export enum AssetType {
  ResidentialEstablished = 'residential_established',
  ResidentialNewBuild = 'residential_new_build',
  Commercial = 'commercial',
  SharesETFs = 'shares_etfs',
  Other = 'other',
}

export enum EntityType {
  Individual = 'individual',
  TrustPartnership = 'trust_partnership',
  Company = 'company',
  SMSF = 'smsf',
}

export enum ValuationMethod {
  ATOFormula = 'ato_formula',
  ActualValuation = 'actual_valuation',
}

export enum Regime {
  PreCGT = 'pre_cgt',
  OldRules = 'old_rules',
  Transitional = 'transitional',
  NewRules = 'new_rules',
}

export enum EligibilityBasis {
  Turnover = 'turnover',
  NetAssets = 'net_assets',
}

export enum SBConcession {
  FifteenYear = '15_year',
  ActiveAsset50 = 'active_asset_50',
  Retirement = 'retirement',
  Rollover = 'rollover',
}

export interface CalculatorInputs {
  // Section 1
  assetType: AssetType;
  entityType: EntityType;
  purchasePrice: number | null;
  acquisitionDate: string | null;
  acquisitionCosts: number;
  capitalImprovements: number;
  depreciationClaimed: number;

  // Section 2
  salePrice: number | null;
  saleDate: string | null;
  sellingCosts: number;
  valuationMethod: ValuationMethod;
  actualValuationAmount: number | null;

  // Section 3
  annualIncome: number | null;
  cpiRate: number;
  currentYearLosses: number;
  priorYearLosses: number;
  incomeSupportRecipient: boolean;
  includeMedicareLevy: boolean;
  isAustralianResident: boolean;

  // Section 4
  applySmallBusinessConcessions: boolean;
  eligibilityBasis: EligibilityBasis;
  aggregatedTurnover: number | null;
  netAssetValue: number | null;
  activeAssetConfirmed: boolean;
  concessionsToApply: SBConcession[];
  age: number | null;
  retirementExemptionCapRemaining: number;
}

export interface WorkingStep {
  id: string;
  label: string;
  formula: string;
  result: number | string;
  note?: string;
  isHighlighted?: boolean;
  isSubheader?: boolean;
}

export interface BracketBreakdown {
  bracket: string;
  rate: number;
  incomeInBracket: number;
  taxInBracket: number;
}

export interface SBConcessionApplied {
  concession: SBConcession;
  reduction: number;
  label: string;
}

export interface CalculationResults {
  regime: Regime;
  heldMoreThan12Months: boolean;
  adjustedCostBase: number;
  netProceeds: number;
  grossGain: number;
  isCapitalLoss: boolean;

  // Transitional split
  valueAt2027: number | null;
  valuationMethodUsed: ValuationMethod | null;
  preGain: number | null;
  discountedPreGain: number | null;
  postGain: number | null;
  indexedCostBase2027: number | null;
  realPostGain: number | null;

  // After losses
  taxablePreGain: number;
  taxablePostGain: number;
  lossesAppliedToPre: number;
  lossesAppliedToPost: number;
  remainingLosses: number;

  // Small business
  sbConcessionsApplied: SBConcessionApplied[];
  gainAfterConcessions: number;

  // Tax
  combinedTaxableGain: number;
  marginalRate: number;
  bracketBreakdown: BracketBreakdown[];
  taxAtMarginalRate: number;
  minimumTaxRequired: number;
  additionalMinimumTax: number;
  minimumTaxExempt: boolean;
  medicareLevy: number;
  totalTaxPayable: number;
  effectiveRate: number;

  // Comparison
  currentRulesTax: number;
  newRulesTax: number;
  deltaVsCurrentRules: number;

  // New build comparison
  newBuildOption50Discount: number | null;
  newBuildOptionCPI: number | null;
  newBuildBetterOption: '50_discount' | 'cpi' | null;

  isSMSF: boolean;

  workings: WorkingStep[];
  assumptions: string[];
}

export interface CalculatorState {
  inputs: CalculatorInputs;
  section3Expanded: boolean;
  section4Expanded: boolean;
}
