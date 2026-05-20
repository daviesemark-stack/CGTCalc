import { CalculatorInputs, SBConcession, SBConcessionApplied, WorkingStep } from '../types';
import {
  SB_MIN_AGE_15_YEAR,
  SB_NET_ASSETS_THRESHOLD,
  SB_TURNOVER_THRESHOLD,
  RETIREMENT_EXEMPTION_CAP,
  CGT_DISCOUNT_RATE,
  ACTIVE_ASSET_REDUCTION_RATE,
} from './constants';
import { EligibilityBasis } from '../types';
import { daysBetween } from '../utils/dates';

export interface SmallBusinessResult {
  reducedGain: number;
  concessionsApplied: SBConcessionApplied[];
  eligible: boolean;
  eligibilityFailReason?: string;
}

export function applySmallBusinessConcessions(
  grossGain: number,
  inputs: CalculatorInputs,
  heldMoreThan12Months: boolean,
  steps: WorkingStep[],
): SmallBusinessResult {
  const {
    eligibilityBasis,
    aggregatedTurnover,
    netAssetValue,
    activeAssetConfirmed,
    concessionsToApply,
    age,
    retirementExemptionCapRemaining,
    acquisitionDate,
    saleDate,
  } = inputs;

  steps.push({
    id: 'sb_header',
    label: 'Small business CGT concessions',
    formula: '',
    result: '',
    isSubheader: true,
  });

  // Eligibility check
  let eligible = false;
  let eligibilityFailReason: string | undefined;

  if (eligibilityBasis === EligibilityBasis.Turnover) {
    eligible = aggregatedTurnover !== null && aggregatedTurnover < SB_TURNOVER_THRESHOLD;
    if (!eligible)
      eligibilityFailReason = `Aggregated turnover $${(aggregatedTurnover ?? 0).toLocaleString()} exceeds $2M threshold.`;
  } else {
    eligible = netAssetValue !== null && netAssetValue <= SB_NET_ASSETS_THRESHOLD;
    if (!eligible)
      eligibilityFailReason = `Net asset value $${(netAssetValue ?? 0).toLocaleString()} exceeds $6M threshold.`;
  }

  if (eligible && !activeAssetConfirmed) {
    eligible = false;
    eligibilityFailReason = 'Active asset test not confirmed.';
  }

  if (!eligible) {
    steps.push({
      id: 'sb_ineligible',
      label: 'Small business concessions — not eligible',
      formula: 'N/A',
      result: eligibilityFailReason ?? 'Eligibility not met',
    });
    return { reducedGain: grossGain, concessionsApplied: [], eligible: false, eligibilityFailReason };
  }

  let remainingGain = grossGain;
  const concessionsApplied: SBConcessionApplied[] = [];
  const daysHeld =
    acquisitionDate && saleDate ? daysBetween(acquisitionDate, saleDate) : 0;
  const yearsHeld = daysHeld / 365.25;

  // Step 1: 15-year exemption (entire gain disregarded if eligible)
  if (concessionsToApply.includes(SBConcession.FifteenYear)) {
    const meetsAge = age !== null && age >= SB_MIN_AGE_15_YEAR;
    const meetsHolding = yearsHeld >= 15;

    if (meetsAge && meetsHolding && activeAssetConfirmed) {
      concessionsApplied.push({
        concession: SBConcession.FifteenYear,
        reduction: remainingGain,
        label: '15-year exemption — entire gain disregarded',
      });
      steps.push({
        id: 'sb_15year',
        label: '15-year exemption applied',
        formula: 'entire gain disregarded',
        result: '$0',
        isHighlighted: true,
        note: `Asset held ${yearsHeld.toFixed(1)} years; taxpayer aged ${age}.`,
      });
      return { reducedGain: 0, concessionsApplied, eligible: true };
    } else {
      const reasons = [];
      if (!meetsAge) reasons.push(`age ${age ?? '?'} < 55`);
      if (!meetsHolding) reasons.push(`held ${yearsHeld.toFixed(1)} years < 15`);
      steps.push({
        id: 'sb_15year_ineligible',
        label: '15-year exemption — not eligible',
        formula: 'N/A',
        result: reasons.join('; '),
      });
    }
  }

  // Step 2: CGT discount 50% (if held > 12 months; applied before active asset reduction)
  if (heldMoreThan12Months && !concessionsToApply.includes(SBConcession.FifteenYear)) {
    const reduction = remainingGain * CGT_DISCOUNT_RATE;
    remainingGain -= reduction;
    concessionsApplied.push({
      concession: SBConcession.ActiveAsset50,
      reduction,
      label: 'CGT discount (50%)',
    });
    steps.push({
      id: 'sb_cgt_discount',
      label: 'CGT discount (50%)',
      formula: 'gain × 50%',
      result: remainingGain,
    });
  }

  // Step 3: 50% active asset reduction
  if (concessionsToApply.includes(SBConcession.ActiveAsset50)) {
    const reduction = remainingGain * ACTIVE_ASSET_REDUCTION_RATE;
    remainingGain -= reduction;
    concessionsApplied.push({
      concession: SBConcession.ActiveAsset50,
      reduction,
      label: '50% active asset reduction',
    });
    steps.push({
      id: 'sb_active_asset',
      label: '50% active asset reduction',
      formula: 'remaining_gain × 50%',
      result: remainingGain,
    });
  }

  // Step 4: Retirement exemption (up to lifetime cap)
  if (concessionsToApply.includes(SBConcession.Retirement)) {
    const cap = Math.min(retirementExemptionCapRemaining, RETIREMENT_EXEMPTION_CAP);
    const reduction = Math.min(remainingGain, cap);
    remainingGain -= reduction;
    concessionsApplied.push({
      concession: SBConcession.Retirement,
      reduction,
      label: `Retirement exemption (capped at $${cap.toLocaleString()} lifetime limit)`,
    });
    steps.push({
      id: 'sb_retirement',
      label: 'Retirement exemption',
      formula: 'min(remaining_gain, lifetime_cap_remaining)',
      result: remainingGain,
      note: `$${reduction.toLocaleString()} sheltered; $${(cap - reduction).toLocaleString()} lifetime cap remaining.`,
    });
  }

  // Step 5: Small business rollover (defers remaining gain)
  if (concessionsToApply.includes(SBConcession.Rollover)) {
    const reduction = remainingGain;
    concessionsApplied.push({
      concession: SBConcession.Rollover,
      reduction,
      label: 'Small business rollover (gain deferred)',
    });
    steps.push({
      id: 'sb_rollover',
      label: 'Small business rollover',
      formula: 'remaining gain deferred — not taxable this year',
      result: '$0 (deferred)',
      note: 'The gain is rolled over and will be taxable on a subsequent CGT event.',
    });
    remainingGain = 0;
  }

  steps.push({
    id: 'sb_total',
    label: 'Gain after small business concessions',
    formula: 'gain − all concession reductions',
    result: remainingGain,
    isHighlighted: true,
  });

  return { reducedGain: remainingGain, concessionsApplied, eligible: true };
}
