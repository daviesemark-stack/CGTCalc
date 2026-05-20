import { WorkingStep } from '../types';

export interface LossOffsetResult {
  taxablePreGain: number;
  taxablePostGain: number;
  lossesAppliedToPre: number;
  lossesAppliedToPost: number;
  remainingLosses: number;
}

export function applyLossOffsets(
  preGain: number,
  postGain: number,
  currentYearLosses: number,
  priorYearLosses: number,
  steps: WorkingStep[],
): LossOffsetResult {
  const totalLosses = currentYearLosses + priorYearLosses;

  if (totalLosses === 0) {
    return {
      taxablePreGain: Math.max(preGain, 0),
      taxablePostGain: Math.max(postGain, 0),
      lossesAppliedToPre: 0,
      lossesAppliedToPost: 0,
      remainingLosses: 0,
    };
  }

  steps.push({
    id: 'losses_header',
    label: 'Capital loss offsets',
    formula: '',
    result: '',
    isSubheader: true,
  });

  steps.push({
    id: 'total_losses',
    label: 'Total capital losses available',
    formula: 'current_year_losses + prior_year_carried_forward',
    result: totalLosses,
  });

  // Apply to pre-2027 gain first (ATO-mandated order for transitional regime)
  let remainingLosses = totalLosses;

  const preGainPositive = Math.max(preGain, 0);
  const lossesAppliedToPre = Math.min(remainingLosses, preGainPositive);
  remainingLosses -= lossesAppliedToPre;

  const postGainPositive = Math.max(postGain, 0);
  const lossesAppliedToPost = Math.min(remainingLosses, postGainPositive);
  remainingLosses -= lossesAppliedToPost;

  const taxablePreGain = preGainPositive - lossesAppliedToPre;
  const taxablePostGain = postGainPositive - lossesAppliedToPost;

  steps.push({
    id: 'losses_to_pre',
    label: 'Losses applied to pre-2027 gain',
    formula: 'min(total_losses, pre_gain)',
    result: lossesAppliedToPre,
    note: 'Applied to pre-2027 gain first per ATO ordering rules',
  });

  steps.push({
    id: 'losses_to_post',
    label: 'Losses applied to post-2027 gain',
    formula: 'min(remaining_losses, post_gain)',
    result: lossesAppliedToPost,
  });

  if (remainingLosses > 0) {
    steps.push({
      id: 'losses_carryforward',
      label: 'Remaining losses (carry forward to future years)',
      formula: 'total_losses − losses_applied',
      result: remainingLosses,
      note: 'These losses can be carried forward to offset future capital gains.',
    });
  }

  return { taxablePreGain, taxablePostGain, lossesAppliedToPre, lossesAppliedToPost, remainingLosses };
}
