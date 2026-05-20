import { CalculatorInputs, WorkingStep } from '../types';

export interface ACBResult {
  adjustedCostBase: number;
  netProceeds: number;
  grossGain: number;
}

export function calculateACB(inputs: CalculatorInputs, steps: WorkingStep[]): ACBResult {
  const {
    purchasePrice,
    acquisitionCosts,
    capitalImprovements,
    depreciationClaimed,
    salePrice,
    sellingCosts,
  } = inputs;

  const pp = purchasePrice ?? 0;
  const acb = pp + acquisitionCosts + capitalImprovements - depreciationClaimed;
  const sp = salePrice ?? 0;
  const netProceeds = sp - sellingCosts;
  const grossGain = netProceeds - acb;

  steps.push({
    id: 'acb',
    label: 'Adjusted cost base',
    formula: 'purchase_price + acquisition_costs + capital_improvements − depreciation_claimed',
    result: acb,
    isSubheader: false,
  });

  steps.push({
    id: 'net_proceeds',
    label: 'Net proceeds',
    formula: 'sale_price − selling_costs',
    result: netProceeds,
  });

  steps.push({
    id: 'gross_gain',
    label: 'Gross capital gain / (loss)',
    formula: 'net_proceeds − adjusted_cost_base',
    result: grossGain,
    isHighlighted: true,
  });

  return { adjustedCostBase: acb, netProceeds, grossGain };
}
