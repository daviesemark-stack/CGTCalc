import { CalculationResults } from '../../types';
import { formatCurrency, formatPercent, formatDelta } from '../../utils/formatting';
import clsx from 'clsx';

interface Props {
  results: CalculationResults;
}

export function SummaryMetrics({ results }: Props) {
  const metrics = [
    {
      label: 'Gross nominal gain',
      value: formatCurrency(results.grossGain),
      sub: null,
    },
    {
      label: 'Taxable capital gain',
      value: formatCurrency(results.combinedTaxableGain),
      sub: null,
    },
    {
      label: 'Estimated tax payable',
      value: formatCurrency(results.totalTaxPayable),
      sub: null,
      emphasis: true,
    },
    {
      label: 'Effective rate on gross gain',
      value: formatPercent(results.effectiveRate),
      sub: null,
    },
    {
      label: 'vs current rules',
      value: formatDelta(results.deltaVsCurrentRules),
      sub: results.deltaVsCurrentRules > 0 ? 'more tax' : results.deltaVsCurrentRules < 0 ? 'less tax' : 'no change',
      positive: results.deltaVsCurrentRules <= 0,
    },
    {
      label: 'Holding period',
      value: results.heldMoreThan12Months ? '> 12 months' : '< 12 months',
      sub: results.heldMoreThan12Months ? 'CGT discount available' : 'No CGT discount',
      warn: !results.heldMoreThan12Months,
    },
  ];

  return (
    <div aria-live="polite" aria-label="Calculation results">
      <dl className="grid grid-cols-2 gap-3">
        {metrics.map(m => (
          <div
            key={m.label}
            className={clsx(
              'rounded-lg p-3 border',
              m.emphasis ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200',
            )}
          >
            <dt className="text-xs text-gray-500 mb-0.5">{m.label}</dt>
            <dd className={clsx(
              'text-lg font-semibold tabular-nums',
              m.warn ? 'text-orange-600' : m.positive === false ? 'text-red-600' : m.positive === true ? 'text-green-600' : 'text-gray-900',
            )}>
              {m.value}
            </dd>
            {m.sub && <span className="text-xs text-gray-500">{m.sub}</span>}
          </div>
        ))}
      </dl>
    </div>
  );
}
