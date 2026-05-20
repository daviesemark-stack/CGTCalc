import { CalculationResults, AssetType } from '../../types';
import { formatCurrency, formatDelta } from '../../utils/formatting';
import clsx from 'clsx';

interface Props {
  results: CalculationResults;
  assetType: AssetType;
}

export function ComparisonCards({ results, assetType }: Props) {
  const { currentRulesTax, newRulesTax, deltaVsCurrentRules, newBuildBetterOption } = results;
  const isNewBuild = assetType === AssetType.ResidentialNewBuild;

  const cards = [
    {
      key: 'current',
      title: 'Current rules',
      subtitle: '50% CGT discount (grandfathered)',
      tax: currentRulesTax,
      isBetter: currentRulesTax <= newRulesTax,
    },
    {
      key: 'new',
      title: 'New rules',
      subtitle: 'CPI indexation + 30% minimum tax',
      tax: newRulesTax,
      isBetter: newRulesTax <= currentRulesTax,
    },
  ];

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Regime comparison</h3>
      <div className={clsx('grid gap-3', isNewBuild ? 'grid-cols-3' : 'grid-cols-2')}>
        {cards.map(card => (
          <div
            key={card.key}
            className={clsx(
              'rounded-lg border p-3',
              card.isBetter ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50',
            )}
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-xs font-semibold text-gray-700">{card.title}</h4>
              {card.isBetter && (
                <span className="text-xs text-green-700 font-medium">Lower ✓</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-2">{card.subtitle}</p>
            <p className="text-xl font-bold tabular-nums text-gray-900">
              {formatCurrency(card.tax)}
            </p>
          </div>
        ))}

        {isNewBuild && newBuildBetterOption && (
          <div className="rounded-lg border border-blue-400 bg-blue-50 p-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-1">New build — best option</h4>
            <p className="text-xs text-gray-500 mb-2">
              {newBuildBetterOption === '50_discount'
                ? '50% discount method is better for you'
                : 'CPI indexation method is better for you'}
            </p>
            <p className="text-xl font-bold tabular-nums text-gray-900">
              {formatCurrency(Math.min(currentRulesTax, newRulesTax))}
            </p>
          </div>
        )}
      </div>

      {deltaVsCurrentRules !== 0 && (
        <p className={clsx(
          'mt-2 text-sm font-medium',
          deltaVsCurrentRules > 0 ? 'text-red-600' : 'text-green-600',
        )}>
          {formatDelta(deltaVsCurrentRules)} {deltaVsCurrentRules > 0 ? 'more' : 'less'} tax under new rules
        </p>
      )}
    </div>
  );
}
