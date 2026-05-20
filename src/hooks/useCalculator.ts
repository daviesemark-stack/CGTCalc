import { useReducer, useMemo, useEffect, useCallback } from 'react';
import {
  CalculatorInputs,
  CalculatorState,
  AssetType,
  EntityType,
  ValuationMethod,
  EligibilityBasis,
  SBConcession,
} from '../types';
import { calculate } from '../engine/calculate';
import { DEFAULT_CPI_RATE, RETIREMENT_EXEMPTION_CAP } from '../engine/constants';

const defaultInputs: CalculatorInputs = {
  assetType: AssetType.ResidentialEstablished,
  entityType: EntityType.Individual,
  purchasePrice: null,
  acquisitionDate: null,
  acquisitionCosts: 0,
  capitalImprovements: 0,
  depreciationClaimed: 0,
  salePrice: null,
  saleDate: null,
  sellingCosts: 0,
  valuationMethod: ValuationMethod.ATOFormula,
  actualValuationAmount: null,
  annualIncome: null,
  cpiRate: DEFAULT_CPI_RATE,
  currentYearLosses: 0,
  priorYearLosses: 0,
  incomeSupportRecipient: false,
  includeMedicareLevy: true,
  isAustralianResident: true,
  applySmallBusinessConcessions: false,
  eligibilityBasis: EligibilityBasis.Turnover,
  aggregatedTurnover: null,
  netAssetValue: null,
  activeAssetConfirmed: false,
  concessionsToApply: [SBConcession.ActiveAsset50],
  age: null,
  retirementExemptionCapRemaining: RETIREMENT_EXEMPTION_CAP,
};

const initialState: CalculatorState = {
  inputs: defaultInputs,
  section3Expanded: false,
  section4Expanded: false,
};

type Action =
  | { type: 'SET_FIELD'; field: keyof CalculatorInputs; value: CalculatorInputs[keyof CalculatorInputs] }
  | { type: 'RESET' }
  | { type: 'SET_SECTION3_EXPANDED'; value: boolean }
  | { type: 'SET_SECTION4_EXPANDED'; value: boolean };

function reducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        inputs: { ...state.inputs, [action.field]: action.value },
      };
    case 'RESET':
      return initialState;
    case 'SET_SECTION3_EXPANDED':
      return { ...state, section3Expanded: action.value };
    case 'SET_SECTION4_EXPANDED':
      return { ...state, section4Expanded: action.value };
  }
}

// Sections 1+2 complete — unlocks sections 3 and 4
function isSections12Complete(inputs: CalculatorInputs): boolean {
  return (
    inputs.purchasePrice !== null &&
    inputs.salePrice !== null &&
    inputs.acquisitionDate !== null &&
    inputs.saleDate !== null
  );
}

// All required fields filled — enables calculation
function isReadyToCalculate(inputs: CalculatorInputs): boolean {
  return isSections12Complete(inputs) && inputs.annualIncome !== null;
}

export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const sections12Complete = useMemo(() => isSections12Complete(state.inputs), [state.inputs]);
  const ready = useMemo(() => isReadyToCalculate(state.inputs), [state.inputs]);

  const results = useMemo(() => calculate(state.inputs), [state.inputs]);

  // Auto-expand sections 3 & 4 when sections 1+2 are complete
  useEffect(() => {
    if (sections12Complete) {
      if (!state.section3Expanded) {
        dispatch({ type: 'SET_SECTION3_EXPANDED', value: true });
      }
      if (!state.section4Expanded) {
        dispatch({ type: 'SET_SECTION4_EXPANDED', value: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections12Complete]);

  const setField = useCallback(
    <K extends keyof CalculatorInputs>(field: K, value: CalculatorInputs[K]) => {
      dispatch({ type: 'SET_FIELD', field, value });
    },
    [],
  );

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    results,
    ready,
    sections12Complete,
    setField,
    reset,
    dispatch,
  };
}
