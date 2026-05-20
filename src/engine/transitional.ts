import { ValuationMethod, WorkingStep } from '../types';
import { KEY_DATE_NEW_REGIME_START } from './constants';
import { daysBetween, yearsBetween } from '../utils/dates';

export interface ValueAt2027Result {
  valueAt2027: number;
  annualGrowthRate: number;
  yearsHeldTo2027: number;
}

export function calculateValueAt2027_ATOFormula(
  acquisitionDate: string,
  saleDate: string,
  costBase: number,
  salePrice: number,
  steps: WorkingStep[],
): ValueAt2027Result {
  const totalYearsHeld = yearsBetween(acquisitionDate, saleDate);
  const yearsHeldTo2027 = yearsBetween(acquisitionDate, KEY_DATE_NEW_REGIME_START);

  const annualGrowthRate =
    totalYearsHeld > 0 ? Math.pow(salePrice / costBase, 1 / totalYearsHeld) - 1 : 0;

  const valueAt2027 = costBase * Math.pow(1 + annualGrowthRate, yearsHeldTo2027);

  steps.push({
    id: 'growth_rate',
    label: 'Annual growth rate (ATO apportionment formula)',
    formula: '(sale_price / cost_base) ^ (1 / total_years_held) − 1',
    result: `${(annualGrowthRate * 100).toFixed(4)}% per annum`,
  });

  steps.push({
    id: 'years_to_2027',
    label: 'Years held to 1 July 2027',
    formula: 'days(acquisition → 1 Jul 2027) / 365.25',
    result: `${yearsHeldTo2027.toFixed(4)} years`,
  });

  steps.push({
    id: 'value_at_2027',
    label: 'Estimated value at 1 July 2027',
    formula: 'cost_base × (1 + annual_growth_rate) ^ years_held_to_2027',
    result: valueAt2027,
    isHighlighted: true,
  });

  return { valueAt2027, annualGrowthRate, yearsHeldTo2027 };
}

export interface TransitionalSplitResult {
  preGain: number;
  discountedPreGain: number;
  postGain: number;
  indexedCostBase: number;
  realPostGain: number;
  yearsPost2027: number;
}

export function calculateTransitionalSplit(
  valueAt2027: number,
  acb: number,
  saleProceeds: number,
  cpiRate: number,
  saleDate: string,
  heldMoreThan12Months: boolean,
  valuationMethod: ValuationMethod,
  steps: WorkingStep[],
): TransitionalSplitResult {
  const yearsPost2027 = yearsBetween(KEY_DATE_NEW_REGIME_START, saleDate);
  const daysPost2027 = daysBetween(KEY_DATE_NEW_REGIME_START, saleDate);

  const preGain = valueAt2027 - acb;
  const discountedPreGain = heldMoreThan12Months ? preGain * 0.5 : preGain;

  const indexedCostBase = valueAt2027 * Math.pow(1 + cpiRate, yearsPost2027);
  const realPostGain = saleProceeds - indexedCostBase;
  const postGain = Math.max(realPostGain, 0);

  const methodNote =
    valuationMethod === ValuationMethod.ATOFormula
      ? 'Using ATO time-weighted apportionment formula'
      : 'Using actual valuation entered by user';

  steps.push({
    id: 'transitional_header',
    label: 'Transitional split',
    formula: '',
    result: '',
    isSubheader: true,
  });

  steps.push({
    id: 'pre_gain',
    label: 'Pre-1 July 2027 gain',
    formula: 'value_at_2027 − adjusted_cost_base',
    result: preGain,
    note: methodNote,
  });

  steps.push({
    id: 'discounted_pre_gain',
    label: heldMoreThan12Months
      ? 'Taxable pre-2027 gain (50% CGT discount applied)'
      : 'Taxable pre-2027 gain (no discount — held < 12 months)',
    formula: heldMoreThan12Months ? 'pre_gain × 50%' : 'pre_gain × 100%',
    result: discountedPreGain,
    isHighlighted: true,
  });

  steps.push({
    id: 'post_2027_years',
    label: 'Years post 1 July 2027',
    formula: 'days(1 Jul 2027 → sale_date) / 365.25',
    result: `${yearsPost2027.toFixed(4)} years (${daysPost2027} days)`,
  });

  steps.push({
    id: 'indexed_cost_base',
    label: 'CPI-indexed cost base (post-2027 portion)',
    formula: 'value_at_2027 × (1 + cpi_rate) ^ years_post_2027',
    result: indexedCostBase,
  });

  steps.push({
    id: 'real_post_gain',
    label: 'Real post-2027 gain (after CPI indexation)',
    formula: 'sale_proceeds − indexed_cost_base',
    result: realPostGain,
  });

  steps.push({
    id: 'taxable_post_gain_raw',
    label: 'Taxable post-2027 gain (floor at zero)',
    formula: 'max(real_post_gain, 0)',
    result: postGain,
    isHighlighted: true,
    note: realPostGain < 0 ? 'CPI indexation eliminated the post-2027 gain — $0 taxable.' : undefined,
  });

  return { preGain, discountedPreGain, postGain, indexedCostBase, realPostGain, yearsPost2027 };
}
