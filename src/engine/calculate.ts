import {
  CalculatorInputs,
  CalculationResults,
  EntityType,
  Regime,
  ValuationMethod,
  AssetType,
  WorkingStep,
} from '../types';
import { determineRegime, regimeLabel } from './regime';
import { calculateACB } from './acb';
import { calculateValueAt2027_ATOFormula, calculateTransitionalSplit } from './transitional';
import { applyLossOffsets } from './losses';
import { calculateTaxOnGain } from './marginalRate';
import { calculateMinimumTax } from './minimumTax';
import { applySmallBusinessConcessions } from './smallBusiness';
import { KEY_DATE_NEW_REGIME_START } from './constants';
import { daysBetween, yearsBetween } from '../utils/dates';
import { regimeLabel as _rl } from './regime';

function calculateTaxUnderCurrentRules(
  grossGain: number,
  income: number,
  heldMoreThan12Months: boolean,
  isResident: boolean,
  includeMedicare: boolean,
): number {
  const taxableGain = heldMoreThan12Months ? grossGain * 0.5 : grossGain;
  const dummy: WorkingStep[] = [];
  const { taxAtMarginalRate, medicareLevy } = calculateTaxOnGain(
    income,
    Math.max(0, taxableGain),
    isResident,
    includeMedicare,
    dummy,
  );
  return taxAtMarginalRate + medicareLevy;
}

export function calculate(inputs: CalculatorInputs): CalculationResults | null {
  const {
    purchasePrice,
    salePrice,
    acquisitionDate,
    saleDate,
    annualIncome,
    entityType,
    assetType,
    valuationMethod,
    actualValuationAmount,
    cpiRate,
    currentYearLosses,
    priorYearLosses,
    isAustralianResident,
    includeMedicareLevy,
    incomeSupportRecipient,
    applySmallBusinessConcessions: applySB,
  } = inputs;

  if (
    purchasePrice === null ||
    salePrice === null ||
    acquisitionDate === null ||
    saleDate === null ||
    annualIncome === null
  ) {
    return null;
  }

  const workings: WorkingStep[] = [];
  const assumptions: string[] = [];

  // SMSF short-circuit
  if (entityType === EntityType.SMSF) {
    return {
      regime: Regime.OldRules,
      heldMoreThan12Months: false,
      adjustedCostBase: 0,
      netProceeds: 0,
      grossGain: 0,
      isCapitalLoss: false,
      valueAt2027: null,
      valuationMethodUsed: null,
      preGain: null,
      discountedPreGain: null,
      postGain: null,
      indexedCostBase2027: null,
      realPostGain: null,
      taxablePreGain: 0,
      taxablePostGain: 0,
      lossesAppliedToPre: 0,
      lossesAppliedToPost: 0,
      remainingLosses: 0,
      sbConcessionsApplied: [],
      gainAfterConcessions: 0,
      combinedTaxableGain: 0,
      marginalRate: 0,
      bracketBreakdown: [],
      taxAtMarginalRate: 0,
      minimumTaxRequired: 0,
      additionalMinimumTax: 0,
      minimumTaxExempt: true,
      medicareLevy: 0,
      totalTaxPayable: 0,
      effectiveRate: 0,
      currentRulesTax: 0,
      newRulesTax: 0,
      deltaVsCurrentRules: 0,
      newBuildOption50Discount: null,
      newBuildOptionCPI: null,
      newBuildBetterOption: null,
      isSMSF: true,
      workings: [],
      assumptions: ['SMSF/super fund entity selected — different CGT rules apply. This calculator is for individuals, trusts and partnerships.'],
    };
  }

  const regime = determineRegime(acquisitionDate, saleDate);
  const heldDays = daysBetween(acquisitionDate, saleDate);
  const heldMoreThan12Months = heldDays >= 365;

  assumptions.push(`Regime: ${regimeLabel(regime)}`);
  if (!heldMoreThan12Months) {
    assumptions.push(`Asset held ${heldDays} days (less than 12 months) — CGT discount not available.`);
  }

  // Step 1: Adjusted cost base
  const { adjustedCostBase, netProceeds, grossGain } = calculateACB(inputs, workings);
  const isCapitalLoss = grossGain < 0;

  if (isCapitalLoss) {
    assumptions.push('Result is a net capital loss — no CGT payable. Loss may be carried forward to offset future gains.');
    return buildLossResult(inputs, adjustedCostBase, netProceeds, grossGain, regime, heldMoreThan12Months, workings, assumptions);
  }

  // Step 2: Determine value at 1 July 2027 and split gain
  let preGain = 0;
  let discountedPreGain = 0;
  let postGain = grossGain;
  let valueAt2027: number | null = null;
  let indexedCostBase2027: number | null = null;
  let realPostGain: number | null = null;
  let valuationMethodUsed: ValuationMethod | null = null;

  if (regime === Regime.Transitional) {
    workings.push({
      id: 'transitional_valuation_method',
      label: '1 July 2027 valuation method',
      formula: valuationMethod === ValuationMethod.ATOFormula ? 'ATO apportionment formula (time-weighted)' : 'Actual valuation entered by user',
      result: '',
    });

    if (valuationMethod === ValuationMethod.ATOFormula) {
      const r = calculateValueAt2027_ATOFormula(
        acquisitionDate,
        saleDate,
        adjustedCostBase,
        netProceeds,
        workings,
      );
      valueAt2027 = r.valueAt2027;
    } else {
      valueAt2027 = actualValuationAmount ?? adjustedCostBase;
      workings.push({
        id: 'actual_valuation',
        label: 'Value at 1 July 2027 (user-provided)',
        formula: 'actual valuation entered',
        result: valueAt2027,
      });
    }
    valuationMethodUsed = valuationMethod;

    const split = calculateTransitionalSplit(
      valueAt2027,
      adjustedCostBase,
      netProceeds,
      cpiRate,
      saleDate,
      heldMoreThan12Months,
      valuationMethod,
      workings,
    );

    preGain = split.preGain;
    discountedPreGain = split.discountedPreGain;
    postGain = split.postGain;
    indexedCostBase2027 = split.indexedCostBase;
    realPostGain = split.realPostGain;

    assumptions.push(
      valuationMethod === ValuationMethod.ATOFormula
        ? '1 July 2027 value determined using ATO time-weighted apportionment formula.'
        : '1 July 2027 value determined using actual valuation entered by user.',
    );
    assumptions.push(`CPI rate assumption: ${(cpiRate * 100).toFixed(2)}% per annum.`);

  } else if (regime === Regime.OldRules || regime === Regime.PreCGT) {
    // Full gain treated as pre-2027 under old rules; post gain = 0
    preGain = grossGain;
    discountedPreGain = heldMoreThan12Months ? grossGain * 0.5 : grossGain;
    postGain = 0;

    workings.push({
      id: 'old_rules_discount',
      label: regime === Regime.PreCGT
        ? 'Pre-CGT asset: pre-2027 gain exempt — only post-2027 gains taxable'
        : heldMoreThan12Months
          ? 'CGT discount applied (50% — held > 12 months)'
          : 'No CGT discount (held < 12 months)',
      formula: heldMoreThan12Months ? 'gross_gain × 50%' : 'gross_gain × 100%',
      result: discountedPreGain,
      isHighlighted: true,
    });

    if (regime === Regime.PreCGT) {
      // Pre-1985: only gain from 1 Jul 2027 onward is taxable. Treat discountedPreGain as 0.
      discountedPreGain = 0;
      postGain = grossGain; // simplification: full gain treated as post-2027 for pre-CGT assets
      assumptions.push('Pre-CGT asset: gains accrued before 1 July 2027 are exempt. Only post-2027 gains are subject to the new rules.');
    }

  } else if (regime === Regime.NewRules) {
    // Full gain is post-2027 under new rules — apply CPI indexation to ACB
    preGain = 0;
    discountedPreGain = 0;
    const yearsPost2027 = yearsBetween(KEY_DATE_NEW_REGIME_START, saleDate);
    const indexedACB = adjustedCostBase * Math.pow(1 + cpiRate, yearsPost2027);
    indexedCostBase2027 = indexedACB;
    realPostGain = netProceeds - indexedACB;
    postGain = Math.max(realPostGain, 0);
    valueAt2027 = adjustedCostBase; // For display purposes

    workings.push({
      id: 'new_rules_indexed_acb',
      label: 'CPI-indexed cost base',
      formula: 'cost_base × (1 + cpi_rate) ^ years_since_2027',
      result: indexedACB,
    });
    workings.push({
      id: 'new_rules_post_gain',
      label: 'Real gain after CPI indexation',
      formula: 'net_proceeds − indexed_cost_base',
      result: realPostGain,
      isHighlighted: true,
    });

    assumptions.push(`New rules apply in full. CPI rate: ${(cpiRate * 100).toFixed(2)}% per annum.`);
  }

  // Step 3: Apply capital loss offsets
  const lossResult = applyLossOffsets(
    discountedPreGain,
    postGain,
    currentYearLosses,
    priorYearLosses,
    workings,
  );

  let { taxablePreGain, taxablePostGain } = lossResult;
  const { lossesAppliedToPre, lossesAppliedToPost, remainingLosses } = lossResult;

  // Step 4: Small business concessions
  let sbConcessionsApplied: CalculationResults['sbConcessionsApplied'] = [];
  let gainAfterConcessions = taxablePreGain + taxablePostGain;

  if (applySB) {
    const sbResult = applySmallBusinessConcessions(
      gainAfterConcessions,
      inputs,
      heldMoreThan12Months,
      workings,
    );
    gainAfterConcessions = sbResult.reducedGain;
    sbConcessionsApplied = sbResult.concessionsApplied;

    if (sbResult.concessionsApplied.length > 0) {
      assumptions.push(
        `Small business concessions applied: ${sbResult.concessionsApplied.map(c => c.label).join(', ')}.`,
      );
    }
  }

  // Rebalance post-gain after concessions (simplified: concessions reduce combined gain)
  const concessionReduction = (taxablePreGain + taxablePostGain) - gainAfterConcessions;
  taxablePostGain = Math.max(0, taxablePostGain - concessionReduction);
  taxablePreGain = gainAfterConcessions - taxablePostGain;

  const combinedTaxableGain = gainAfterConcessions;

  workings.push({
    id: 'combined_taxable_gain',
    label: 'Combined taxable capital gain',
    formula: 'taxable_pre_gain + taxable_post_gain',
    result: combinedTaxableGain,
    isHighlighted: true,
  });

  // Step 5: Marginal tax rate
  const { taxAtMarginalRate, marginalRate, bracketBreakdown, medicareLevy } = calculateTaxOnGain(
    annualIncome,
    combinedTaxableGain,
    isAustralianResident,
    includeMedicareLevy,
    workings,
  );

  // Step 6: Minimum tax (only on post-2027 portion)
  const isMinTaxExempt = incomeSupportRecipient;
  const exemptReason = incomeSupportRecipient
    ? 'Taxpayer received a means-tested income support payment in the income year — minimum tax exemption applies.'
    : 'SMSF/super fund entity — minimum tax exemption applies.';

  // Tax attributable only to the post-2027 portion
  const dummySteps: WorkingStep[] = [];
  const { taxAtMarginalRate: taxOnPostOnly } = calculateTaxOnGain(
    annualIncome + taxablePreGain,
    taxablePostGain,
    isAustralianResident,
    false,
    dummySteps,
  );

  const { minimumTaxRequired, additionalMinimumTax, exempt: minimumTaxExempt } =
    calculateMinimumTax(taxablePostGain, taxOnPostOnly, isMinTaxExempt, exemptReason, workings);

  if (isMinTaxExempt) {
    assumptions.push(`Minimum tax (30%) exempt: ${exemptReason}`);
  } else if (additionalMinimumTax === 0) {
    assumptions.push('30% minimum tax check: marginal rate tax already meets or exceeds the minimum — no additional tax.');
  } else {
    assumptions.push(`30% minimum tax applies — additional tax of $${Math.round(additionalMinimumTax).toLocaleString()} added.`);
  }

  const totalTaxPayable = taxAtMarginalRate + additionalMinimumTax + medicareLevy;

  workings.push({
    id: 'total_tax',
    label: 'Total estimated tax payable',
    formula: 'tax_at_marginal_rate + additional_minimum_tax + medicare_levy',
    result: totalTaxPayable,
    isHighlighted: true,
  });

  const effectiveRate = grossGain > 0 ? totalTaxPayable / grossGain : 0;

  // Comparison: current rules
  const currentRulesTax = calculateTaxUnderCurrentRules(
    grossGain,
    annualIncome,
    heldMoreThan12Months,
    isAustralianResident,
    includeMedicareLevy,
  );

  const newRulesTax = totalTaxPayable;
  const deltaVsCurrentRules = newRulesTax - currentRulesTax;

  // New build comparison
  let newBuildOption50Discount: number | null = null;
  let newBuildOptionCPI: number | null = null;
  let newBuildBetterOption: CalculationResults['newBuildBetterOption'] = null;

  if (assetType === AssetType.ResidentialNewBuild) {
    newBuildOption50Discount = currentRulesTax;
    newBuildOptionCPI = newRulesTax;
    newBuildBetterOption = newBuildOption50Discount <= newBuildOptionCPI ? '50_discount' : 'cpi';
    assumptions.push('New build: both the 50% discount method and the CPI indexation method are shown. The lower-tax option is highlighted.');
  }

  if (!isAustralianResident) {
    assumptions.push('Non-resident: flat 30% rate applied from $0; no tax-free threshold; Medicare levy disabled.');
  }

  if (includeMedicareLevy && isAustralianResident) {
    assumptions.push('Medicare levy (2%) included on the taxable capital gain.');
  }

  assumptions.push('Proposed legislation only. Not financial or tax advice. Figures are estimates.');

  return {
    regime,
    heldMoreThan12Months,
    adjustedCostBase,
    netProceeds,
    grossGain,
    isCapitalLoss,
    valueAt2027,
    valuationMethodUsed,
    preGain,
    discountedPreGain,
    postGain,
    indexedCostBase2027,
    realPostGain,
    taxablePreGain,
    taxablePostGain,
    lossesAppliedToPre,
    lossesAppliedToPost,
    remainingLosses,
    sbConcessionsApplied,
    gainAfterConcessions,
    combinedTaxableGain,
    marginalRate,
    bracketBreakdown,
    taxAtMarginalRate,
    minimumTaxRequired,
    additionalMinimumTax,
    minimumTaxExempt,
    medicareLevy,
    totalTaxPayable,
    effectiveRate,
    currentRulesTax,
    newRulesTax,
    deltaVsCurrentRules,
    newBuildOption50Discount,
    newBuildOptionCPI,
    newBuildBetterOption,
    isSMSF: false,
    workings,
    assumptions,
  };
}

function buildLossResult(
  _inputs: CalculatorInputs,
  adjustedCostBase: number,
  netProceeds: number,
  grossGain: number,
  regime: Regime,
  heldMoreThan12Months: boolean,
  workings: WorkingStep[],
  assumptions: string[],
): CalculationResults {
  return {
    regime,
    heldMoreThan12Months,
    adjustedCostBase,
    netProceeds,
    grossGain,
    isCapitalLoss: true,
    valueAt2027: null,
    valuationMethodUsed: null,
    preGain: null,
    discountedPreGain: null,
    postGain: null,
    indexedCostBase2027: null,
    realPostGain: null,
    taxablePreGain: 0,
    taxablePostGain: 0,
    lossesAppliedToPre: 0,
    lossesAppliedToPost: 0,
    remainingLosses: 0,
    sbConcessionsApplied: [],
    gainAfterConcessions: 0,
    combinedTaxableGain: 0,
    marginalRate: 0,
    bracketBreakdown: [],
    taxAtMarginalRate: 0,
    minimumTaxRequired: 0,
    additionalMinimumTax: 0,
    minimumTaxExempt: true,
    medicareLevy: 0,
    totalTaxPayable: 0,
    effectiveRate: 0,
    currentRulesTax: 0,
    newRulesTax: 0,
    deltaVsCurrentRules: 0,
    newBuildOption50Discount: null,
    newBuildOptionCPI: null,
    newBuildBetterOption: null,
    isSMSF: false,
    workings,
    assumptions,
  };
}
