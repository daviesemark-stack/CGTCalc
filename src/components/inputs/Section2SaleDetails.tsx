import { CalculatorInputs, ValuationMethod } from '../../types';
import { CurrencyInput } from './CurrencyInput';
import { DateInput } from './DateInput';

interface Props {
  inputs: CalculatorInputs;
  setField: <K extends keyof CalculatorInputs>(field: K, value: CalculatorInputs[K]) => void;
}

export function Section2SaleDetails({ inputs, setField }: Props) {
  const showActualValuation = inputs.valuationMethod === ValuationMethod.ActualValuation;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <CurrencyInput
          label="Expected sale price"
          value={inputs.salePrice}
          onChange={v => setField('salePrice', v)}
          required
        />
        <DateInput
          label="Expected sale date"
          value={inputs.saleDate}
          onChange={v => setField('saleDate', v)}
          required
        />
      </div>

      <CurrencyInput
        label="Selling costs"
        value={inputs.sellingCosts || null}
        onChange={v => setField('sellingCosts', v ?? 0)}
        hint="Agent fees, legal costs, brokerage — reduces capital proceeds"
      />

      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">
          1 July 2027 valuation method
        </p>
        <div className="space-y-2">
          {[
            {
              value: ValuationMethod.ATOFormula,
              label: 'ATO apportionment formula (time-weighted)',
              hint: 'Calculates the value at 1 July 2027 using a geometric growth rate derived from your purchase and sale prices.',
            },
            {
              value: ValuationMethod.ActualValuation,
              label: 'Actual valuation',
              hint: 'Enter a dollar figure from a formal appraisal or quoted market price.',
            },
          ].map(opt => (
            <label key={opt.value} className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="valuation-method"
                value={opt.value}
                checked={inputs.valuationMethod === opt.value}
                onChange={() => setField('valuationMethod', opt.value)}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="block text-sm font-medium text-gray-700">{opt.label}</span>
                <span className="block text-xs text-gray-500">{opt.hint}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {showActualValuation && (
        <CurrencyInput
          label="Valuation at 1 July 2027"
          value={inputs.actualValuationAmount}
          onChange={v => setField('actualValuationAmount', v)}
          required
          hint="Enter the market value of the asset as at 1 July 2027"
        />
      )}
    </div>
  );
}
