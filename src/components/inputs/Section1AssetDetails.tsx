import { CalculatorInputs, AssetType, EntityType } from '../../types';
import { CurrencyInput } from './CurrencyInput';
import { DateInput } from './DateInput';

interface Props {
  inputs: CalculatorInputs;
  setField: <K extends keyof CalculatorInputs>(field: K, value: CalculatorInputs[K]) => void;
}

const assetTypeOptions: { value: AssetType; label: string }[] = [
  { value: AssetType.ResidentialEstablished, label: 'Residential — established' },
  { value: AssetType.ResidentialNewBuild, label: 'Residential — new build' },
  { value: AssetType.Commercial, label: 'Commercial property' },
  { value: AssetType.SharesETFs, label: 'Shares / ETFs' },
  { value: AssetType.Other, label: 'Other CGT asset' },
];

const entityTypeOptions: { value: EntityType; label: string }[] = [
  { value: EntityType.Individual, label: 'Individual' },
  { value: EntityType.TrustPartnership, label: 'Trust / Partnership' },
  { value: EntityType.Company, label: 'Company' },
  { value: EntityType.SMSF, label: 'SMSF / Super fund' },
];

export function Section1AssetDetails({ inputs, setField }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asset type</label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
            value={inputs.assetType}
            onChange={e => setField('assetType', e.target.value as AssetType)}
          >
            {assetTypeOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Entity type</label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
            value={inputs.entityType}
            onChange={e => setField('entityType', e.target.value as EntityType)}
          >
            {entityTypeOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CurrencyInput
          label="Purchase price"
          value={inputs.purchasePrice}
          onChange={v => setField('purchasePrice', v)}
          required
        />
        <DateInput
          label="Date of acquisition"
          value={inputs.acquisitionDate}
          onChange={v => setField('acquisitionDate', v)}
          required
          max="2099-12-31"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CurrencyInput
          label="Acquisition costs"
          value={inputs.acquisitionCosts || null}
          onChange={v => setField('acquisitionCosts', v ?? 0)}
          hint="Stamp duty, legal/conveyancing fees"
        />
        <CurrencyInput
          label="Capital improvements"
          value={inputs.capitalImprovements || null}
          onChange={v => setField('capitalImprovements', v ?? 0)}
          hint="Structural additions only, not repairs"
        />
      </div>

      <CurrencyInput
        label="Depreciation claimed"
        value={inputs.depreciationClaimed || null}
        onChange={v => setField('depreciationClaimed', v ?? 0)}
        hint="Optional — reduces the adjusted cost base"
      />
    </div>
  );
}
