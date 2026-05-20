import { CalculatorInputs, EligibilityBasis, SBConcession } from '../../types';
import { CurrencyInput } from './CurrencyInput';
import { ToggleSwitch } from './ToggleSwitch';
import { ABSComparisonWidget } from './ABSComparisonWidget';
import { SB_TURNOVER_THRESHOLD, SB_NET_ASSETS_THRESHOLD } from '../../engine/constants';

interface Props {
  inputs: CalculatorInputs;
  setField: <K extends keyof CalculatorInputs>(field: K, value: CalculatorInputs[K]) => void;
}

const concessionOptions: { value: SBConcession; label: string; hint: string }[] = [
  { value: SBConcession.FifteenYear, label: '15-year exemption', hint: 'Age ≥ 55 + held ≥ 15 years — entire gain disregarded' },
  { value: SBConcession.ActiveAsset50, label: '50% active asset reduction', hint: 'Halves the gain after CGT discount' },
  { value: SBConcession.Retirement, label: 'Retirement exemption', hint: 'Up to $500,000 lifetime limit' },
  { value: SBConcession.Rollover, label: 'Small business rollover', hint: 'Defers remaining gain to a future CGT event' },
];

function toggleConcession(current: SBConcession[], value: SBConcession): SBConcession[] {
  return current.includes(value) ? current.filter(c => c !== value) : [...current, value];
}

function EligibilityBadge({ eligible }: { eligible: boolean | null }) {
  if (eligible === null) return null;
  if (eligible) {
    return (
      <p className="mt-1 text-xs text-green-700 font-medium">
        ✓ Below the threshold — eligible via this basis (subject to other conditions)
      </p>
    );
  }
  return (
    <p className="mt-1 text-xs text-red-700 font-medium">
      ✗ Exceeds the threshold — not eligible via this basis, even if the active asset test is met
    </p>
  );
}

export function Section4SmallBusiness({ inputs, setField }: Props) {
  const show15YearAge =
    inputs.applySmallBusinessConcessions &&
    inputs.concessionsToApply.includes(SBConcession.FifteenYear);

  const showRetirementCap =
    inputs.applySmallBusinessConcessions &&
    inputs.concessionsToApply.includes(SBConcession.Retirement);

  const turnoverEligible =
    inputs.aggregatedTurnover !== null && inputs.aggregatedTurnover > 0
      ? inputs.aggregatedTurnover < SB_TURNOVER_THRESHOLD
      : null;

  const netAssetsEligible =
    inputs.netAssetValue !== null && inputs.netAssetValue > 0
      ? inputs.netAssetValue <= SB_NET_ASSETS_THRESHOLD
      : null;

  const isTurnover = inputs.eligibilityBasis === EligibilityBasis.Turnover;
  const activeEligible = isTurnover ? turnoverEligible : netAssetsEligible;

  return (
    <div className="space-y-4">
      <ToggleSwitch
        label="Apply small business CGT concessions"
        checked={inputs.applySmallBusinessConcessions}
        onChange={v => setField('applySmallBusinessConcessions', v)}
      />

      {inputs.applySmallBusinessConcessions && (
        <>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Eligibility basis</p>
            <div className="space-y-4">
              {/* Turnover basis */}
              <div className={isTurnover ? '' : 'opacity-60'}>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="radio"
                    name="eligibility-basis"
                    value={EligibilityBasis.Turnover}
                    checked={isTurnover}
                    onChange={() => setField('eligibilityBasis', EligibilityBasis.Turnover)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">Aggregated turnover &lt; $2M</span>
                </label>
                <div className="ml-6">
                  <CurrencyInput
                    label="Aggregated turnover"
                    value={inputs.aggregatedTurnover}
                    onChange={v => setField('aggregatedTurnover', v)}
                    hint="Include affiliates and connected entities"
                  />
                  <EligibilityBadge eligible={turnoverEligible} />
                </div>
              </div>

              {/* Net assets basis */}
              <div className={!isTurnover ? '' : 'opacity-60'}>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="radio"
                    name="eligibility-basis"
                    value={EligibilityBasis.NetAssets}
                    checked={!isTurnover}
                    onChange={() => setField('eligibilityBasis', EligibilityBasis.NetAssets)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">Maximum net asset value ≤ $6M</span>
                </label>
                <div className="ml-6">
                  <CurrencyInput
                    label="Net asset value"
                    value={inputs.netAssetValue}
                    onChange={v => setField('netAssetValue', v)}
                    hint="Include affiliates and connected entities; exclude personal use assets and super"
                  />
                  <EligibilityBadge eligible={netAssetsEligible} />
                </div>
              </div>
            </div>
          </div>

          {activeEligible === false && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <strong>Not eligible via this basis.</strong> The selected figure exceeds the threshold.
              You may still be eligible if you qualify under the other basis.
            </div>
          )}

          <ABSComparisonWidget
            basis={inputs.eligibilityBasis}
            turnover={inputs.aggregatedTurnover}
            netAssets={inputs.netAssetValue}
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.activeAssetConfirmed}
              onChange={e => setField('activeAssetConfirmed', e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I confirm this asset passes the active asset test
            </span>
          </label>
          <p className="text-xs text-gray-500 -mt-2 ml-6">
            Active for at least half the ownership period, or 7.5 years if held over 15 years.
          </p>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Concessions to apply</p>
            <div className="space-y-2">
              {concessionOptions.map(opt => (
                <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputs.concessionsToApply.includes(opt.value)}
                    onChange={() =>
                      setField('concessionsToApply', toggleConcession(inputs.concessionsToApply, opt.value))
                    }
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-gray-700">{opt.label}</span>
                    <span className="block text-xs text-gray-500">{opt.hint}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {show15YearAge && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age (for 15-year exemption)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                value={inputs.age ?? ''}
                onChange={e => setField('age', e.target.value ? parseInt(e.target.value) : null)}
              />
              <p className="mt-1 text-xs text-gray-500">Must be ≥ 55 or permanently incapacitated</p>
            </div>
          )}

          {showRetirementCap && (
            <CurrencyInput
              label="Retirement exemption cap remaining"
              value={inputs.retirementExemptionCapRemaining}
              onChange={v => setField('retirementExemptionCapRemaining', v ?? 500000)}
              hint="Lifetime limit is $500,000. Enter how much is still available."
            />
          )}
        </>
      )}
    </div>
  );
}
