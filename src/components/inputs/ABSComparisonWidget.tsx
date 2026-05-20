import {
  businessesAtOrAboveTurnover,
  businessesAtOrAboveNetAssets,
  ABS_DATA_SOURCE,
  ABS_DATA_YEAR,
  NET_ASSET_TOTAL_BUSINESSES,
  TURNOVER_TOTAL_BUSINESSES,
} from '../../data/absBusinessData';
import { SB_TURNOVER_THRESHOLD, SB_NET_ASSETS_THRESHOLD } from '../../engine/constants';
import { EligibilityBasis } from '../../types';

interface Props {
  basis: EligibilityBasis;
  turnover: number | null;
  netAssets: number | null;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `~${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `~${Math.round(n / 1_000)}k`;
  return `~${n}`;
}

function ProgressBar({ percent, thresholdPercent }: { percent: number; thresholdPercent: number }) {
  const userPct = Math.min(percent * 100, 100);
  const threshPct = Math.min(thresholdPercent * 100, 100);

  return (
    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mt-2 mb-1">
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
        style={{ left: `${100 - threshPct}%` }}
        title="SB eligibility threshold"
      />
      <div
        className="absolute top-0 bottom-0 right-0 bg-blue-400 rounded-r-full transition-all duration-300"
        style={{ width: `${userPct}%` }}
      />
    </div>
  );
}

export function ABSComparisonWidget({ basis, turnover, netAssets }: Props) {
  const isTurnover = basis === EligibilityBasis.Turnover;
  const value = isTurnover ? turnover : netAssets;

  if (value === null || value <= 0) return null;

  const { count, percent } = isTurnover
    ? businessesAtOrAboveTurnover(value)
    : businessesAtOrAboveNetAssets(value);

  const total = isTurnover ? TURNOVER_TOTAL_BUSINESSES : NET_ASSET_TOTAL_BUSINESSES;
  const threshold = isTurnover ? SB_TURNOVER_THRESHOLD : SB_NET_ASSETS_THRESHOLD;

  const thresholdStats = isTurnover
    ? businessesAtOrAboveTurnover(threshold)
    : businessesAtOrAboveNetAssets(threshold);

  const label = isTurnover ? 'annual turnover' : 'net asset value';
  const thresholdLabel = isTurnover ? '$2M' : '$6M';

  const userFormatted =
    value >= 1_000_000
      ? `$${(value / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`
      : `$${Math.round(value / 1_000)}k`;

  const belowThreshold = value < threshold;

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">
      <p className="font-medium text-blue-900 mb-1">
        ABS business comparison ({ABS_DATA_YEAR})
      </p>

      <p className="text-blue-800 mb-1">
        Approximately{' '}
        <strong>{formatCount(count)}</strong>{' '}
        ({(percent * 100).toFixed(1)}% of ~{(total / 1_000_000).toFixed(1)}M Australian businesses)
        have {label} of <strong>{userFormatted} or more</strong>.
      </p>

      <ProgressBar percent={percent} thresholdPercent={thresholdStats.percent} />

      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>Your figure ({userFormatted})</span>
        <span>← SB threshold ({thresholdLabel})</span>
        <span>All businesses</span>
      </div>

      {belowThreshold ? (
        <p className="text-xs text-green-700">
          ✓ Your {label} is below the {thresholdLabel} SB concession threshold.{' '}
          {formatCount(thresholdStats.count)} businesses ({(thresholdStats.percent * 100).toFixed(1)}%) are at or above it.
        </p>
      ) : (
        <p className="text-xs text-orange-700 font-medium">
          ⚠ Your {label} of {userFormatted} exceeds the {thresholdLabel} SB concession threshold — this eligibility basis may not apply.
        </p>
      )}

      <p className="mt-2 text-xs text-gray-400">
        Source: {ABS_DATA_SOURCE}. Figures are approximate interpolations.
      </p>
    </div>
  );
}
