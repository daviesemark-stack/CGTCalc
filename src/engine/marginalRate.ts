import { BracketBreakdown, WorkingStep } from '../types';
import {
  TAX_BRACKETS_RESIDENT,
  NON_RESIDENT_RATE,
  MEDICARE_LEVY_RATE,
} from './constants';

function calculateTaxOnIncome(income: number, isResident: boolean): number {
  if (!isResident) {
    return income * NON_RESIDENT_RATE;
  }
  let tax = 0;
  for (const bracket of TAX_BRACKETS_RESIDENT) {
    if (income <= 0) break;
    const taxableInBracket = Math.min(income, bracket.ceiling - bracket.floor + 1);
    tax += Math.max(0, taxableInBracket) * bracket.rate;
    income -= taxableInBracket;
  }
  return tax;
}

export function calculateTaxOnGain(
  income: number,
  gain: number,
  isResident: boolean,
  includeMedicare: boolean,
  steps: WorkingStep[],
): {
  taxAtMarginalRate: number;
  marginalRate: number;
  bracketBreakdown: BracketBreakdown[];
  medicareLevy: number;
} {
  const taxOnIncomeOnly = calculateTaxOnIncome(income, isResident);
  const taxOnIncomeAndGain = calculateTaxOnIncome(income + gain, isResident);
  const taxAtMarginalRate = Math.max(0, taxOnIncomeAndGain - taxOnIncomeOnly);

  // Determine top marginal rate for the combined income
  const combined = income + gain;
  let marginalRate = 0;
  if (!isResident) {
    marginalRate = NON_RESIDENT_RATE;
  } else {
    for (const bracket of TAX_BRACKETS_RESIDENT) {
      if (combined > bracket.floor) {
        marginalRate = bracket.rate;
      }
    }
  }

  // Build breakdown for display
  const bracketBreakdown: BracketBreakdown[] = [];
  if (isResident) {
    for (const bracket of TAX_BRACKETS_RESIDENT) {
      const floorAdj = bracket.floor === 0 ? 0 : bracket.floor;
      const incomeInBracket = Math.max(0, Math.min(combined, bracket.ceiling) - floorAdj);
      if (incomeInBracket > 0) {
        bracketBreakdown.push({
          bracket:
            bracket.ceiling === Infinity
              ? `$${bracket.floor.toLocaleString()}+`
              : `$${floorAdj.toLocaleString()} – $${bracket.ceiling.toLocaleString()}`,
          rate: bracket.rate,
          incomeInBracket,
          taxInBracket: incomeInBracket * bracket.rate,
        });
      }
    }
  } else {
    bracketBreakdown.push({
      bracket: 'All income (non-resident flat rate)',
      rate: NON_RESIDENT_RATE,
      incomeInBracket: combined,
      taxInBracket: combined * NON_RESIDENT_RATE,
    });
  }

  const medicareLevy =
    includeMedicare && isResident ? gain * MEDICARE_LEVY_RATE : 0;

  steps.push({
    id: 'marginal_rate_header',
    label: 'Marginal tax rate stacking',
    formula: '',
    result: '',
    isSubheader: true,
  });

  steps.push({
    id: 'income_only_tax',
    label: 'Tax on annual income alone',
    formula: 'tax(annual_income)',
    result: taxOnIncomeOnly,
  });

  steps.push({
    id: 'income_plus_gain_tax',
    label: 'Tax on income + taxable gain',
    formula: 'tax(annual_income + combined_taxable_gain)',
    result: taxOnIncomeAndGain,
  });

  steps.push({
    id: 'tax_on_gain',
    label: 'Tax attributable to capital gain',
    formula: 'tax(income + gain) − tax(income)',
    result: taxAtMarginalRate,
    isHighlighted: true,
  });

  if (medicareLevy > 0) {
    steps.push({
      id: 'medicare_levy',
      label: 'Medicare levy (2% on capital gain)',
      formula: 'taxable_gain × 2%',
      result: medicareLevy,
    });
  }

  return { taxAtMarginalRate, marginalRate, bracketBreakdown, medicareLevy };
}
