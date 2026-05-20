import { WorkingStep } from '../types';
import { MINIMUM_TAX_RATE } from './constants';

export interface MinimumTaxResult {
  minimumTaxRequired: number;
  additionalMinimumTax: number;
  exempt: boolean;
}

export function calculateMinimumTax(
  taxablePostGain: number,
  taxAtMarginalOnPostGain: number,
  isExempt: boolean,
  exemptReason: string,
  steps: WorkingStep[],
): MinimumTaxResult {
  steps.push({
    id: 'minimum_tax_header',
    label: '30% minimum tax check (post-2027 gain)',
    formula: '',
    result: '',
    isSubheader: true,
  });

  if (isExempt) {
    steps.push({
      id: 'minimum_tax_exempt',
      label: 'Minimum tax — exempt',
      formula: 'N/A',
      result: '$0',
      note: exemptReason,
    });
    return { minimumTaxRequired: 0, additionalMinimumTax: 0, exempt: true };
  }

  const minimumTaxRequired = taxablePostGain * MINIMUM_TAX_RATE;
  const additionalMinimumTax = Math.max(0, minimumTaxRequired - taxAtMarginalOnPostGain);

  steps.push({
    id: 'minimum_tax_required',
    label: 'Minimum tax required (30% of post-2027 gain)',
    formula: 'taxable_post_2027_gain × 30%',
    result: minimumTaxRequired,
  });

  steps.push({
    id: 'additional_minimum_tax',
    label: 'Additional minimum tax',
    formula: 'max(minimum_tax_required − tax_at_marginal_rate, 0)',
    result: additionalMinimumTax,
    isHighlighted: additionalMinimumTax > 0,
    note:
      additionalMinimumTax === 0
        ? 'Marginal rate tax equals or exceeds the 30% minimum — no additional tax.'
        : 'Your marginal rate on the post-2027 gain is below the 30% minimum.',
  });

  return { minimumTaxRequired, additionalMinimumTax, exempt: false };
}
