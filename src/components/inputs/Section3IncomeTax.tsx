import { CalculatorInputs } from '../../types';
import { CurrencyInput } from './CurrencyInput';
import { ToggleSwitch } from './ToggleSwitch';
import { daysBetween } from '../../utils/dates';

interface Props {
  inputs: CalculatorInputs;
  setField: <K extends keyof CalculatorInputs>(field: K, value: CalculatorInputs[K]) => void;
}

export function Section3IncomeTax({ inputs, setField }: Props) {
  const holdingBadge = (() => {
    if (!inputs.acquisitionDate || !inputs.saleDate) return null;
    const days = daysBetween(inputs.acquisitionDate, inputs.saleDate);
    const months = Math.floor(days / 30.44);
    if (days < 365) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
          ⚠ Held {months} months — no CGT discount
        </span>
      );
    }
    const years = Math.floor(days / 365);
    const rem = months - years * 12;
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
        ✓ Held {years}y {rem}m — CGT discount available
      </span>
    );
  })();

  return (
    <div className="space-y-4">
      {holdingBadge && <div>{holdingBadge}</div>}

      <CurrencyInput
        label="Annual taxable income"
        value={inputs.annualIncome}
        onChange={v => setField('annualIncome', v)}
        required
        hint="Excluding the capital gain"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CPI rate assumption (%)
        </label>
        <div className="relative w-32">
          <input
            type="number"
            min="0"
            max="20"
            step="0.1"
            className="block w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
            value={(inputs.cpiRate * 100).toFixed(1)}
            onChange={e => setField('cpiRate', parseFloat(e.target.value) / 100 || 0)}
          />
          <span className="absolute inset-y-0 right-2 flex items-center text-gray-500 text-sm pointer-events-none">%</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">Applied annually to post-2027 gains. Default: 2.5%</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CurrencyInput
          label="Current-year capital losses"
          value={inputs.currentYearLosses || null}
          onChange={v => setField('currentYearLosses', v ?? 0)}
        />
        <CurrencyInput
          label="Prior-year carried-forward losses"
          value={inputs.priorYearLosses || null}
          onChange={v => setField('priorYearLosses', v ?? 0)}
        />
      </div>

      <div className="space-y-3 pt-1">
        <ToggleSwitch
          label="Income support recipient"
          checked={inputs.incomeSupportRecipient}
          onChange={v => setField('incomeSupportRecipient', v)}
          hint="Age Pension, JobSeeker, etc. — exempts from 30% minimum tax"
        />
        <ToggleSwitch
          label="Include Medicare levy (2%)"
          checked={inputs.includeMedicareLevy}
          onChange={v => setField('includeMedicareLevy', v)}
          disabled={!inputs.isAustralianResident}
          hint="Adds 2% to the tax on the capital gain"
        />
        <ToggleSwitch
          label="Australian tax resident"
          checked={inputs.isAustralianResident}
          onChange={v => {
            setField('isAustralianResident', v);
            if (!v) setField('includeMedicareLevy', false);
          }}
          hint="Non-residents: flat 30% rate from $0, no tax-free threshold"
        />
      </div>
    </div>
  );
}
