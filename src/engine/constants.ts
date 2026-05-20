export const KEY_DATE_BUDGET_ANNOUNCEMENT = new Date('2026-05-12T07:30:00+10:00');
export const KEY_DATE_NEW_REGIME_START = new Date('2027-07-01T00:00:00+10:00');
export const PRE_CGT_CUTOFF = new Date('1985-09-20T00:00:00+10:00');

export const DEFAULT_CPI_RATE = 0.025;
export const MINIMUM_TAX_RATE = 0.30;
export const CGT_DISCOUNT_RATE = 0.50;
export const ACTIVE_ASSET_REDUCTION_RATE = 0.50;
export const MEDICARE_LEVY_RATE = 0.02;

export const SB_TURNOVER_THRESHOLD = 2_000_000;
export const SB_NET_ASSETS_THRESHOLD = 6_000_000;
export const RETIREMENT_EXEMPTION_CAP = 500_000;
export const SB_MIN_AGE_15_YEAR = 55;
export const MINIMUM_HOLDING_DAYS = 365;

export const NON_RESIDENT_RATE = 0.30;

export const TAX_BRACKETS_RESIDENT = [
  { floor: 0,        ceiling: 18_200,   rate: 0.00 },
  { floor: 18_201,   ceiling: 45_000,   rate: 0.14 },
  { floor: 45_001,   ceiling: 135_000,  rate: 0.30 },
  { floor: 135_001,  ceiling: 190_000,  rate: 0.37 },
  { floor: 190_001,  ceiling: Infinity, rate: 0.45 },
];
