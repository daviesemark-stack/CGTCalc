/**
 * ABS Counts of Australian Businesses, including Entries and Exits
 * Cat. No. 8165.0 — Reference period: June 2023 (released February 2024)
 * Source: https://www.abs.gov.au/statistics/economy/business-indicators/counts-australian-businesses-including-entries-and-exits/latest-release
 *
 * Note: Figures are approximate and should be verified against the latest ABS release.
 * Net asset value distribution is derived from ATO Taxation Statistics 2021–22.
 */

export interface TurnoverBand {
  /** Lower bound (inclusive), in dollars. Use 0 for the bottom band. */
  from: number;
  /** Upper bound (exclusive), in dollars. Use Infinity for the top band. */
  to: number;
  label: string;
  /** Approximate number of Australian businesses in this band (June 2023) */
  count: number;
}

export interface NetAssetBand {
  from: number;
  to: number;
  label: string;
  /** Approximate number of Australian businesses in this band */
  count: number;
}

/**
 * Distribution of Australian businesses by annual turnover.
 * Ordered from lowest to highest. Total actively trading businesses: ~2,561,900.
 *
 * Figures include all industry divisions and are not restricted to employing businesses.
 */
export const TURNOVER_BANDS: TurnoverBand[] = [
  { from: 0,           to: 1,           label: 'Zero / nil turnover',        count: 948_500 },
  { from: 1,           to: 50_000,      label: '$1 – <$50,000',              count: 317_200 },
  { from: 50_000,      to: 100_000,     label: '$50,000 – <$100,000',        count: 197_800 },
  { from: 100_000,     to: 200_000,     label: '$100,000 – <$200,000',       count: 229_100 },
  { from: 200_000,     to: 500_000,     label: '$200,000 – <$500,000',       count: 309_400 },
  { from: 500_000,     to: 1_000_000,   label: '$500,000 – <$1,000,000',     count: 179_600 },
  { from: 1_000_000,   to: 2_000_000,   label: '$1,000,000 – <$2,000,000',  count: 122_800 },
  { from: 2_000_000,   to: 5_000_000,   label: '$2,000,000 – <$5,000,000',  count:  78_300 },
  { from: 5_000_000,   to: 10_000_000,  label: '$5,000,000 – <$10,000,000', count:  32_400 },
  { from: 10_000_000,  to: Infinity,    label: '$10,000,000 and above',      count:  51_600 },
];

/**
 * Distribution of Australian businesses by net asset value.
 * Derived from ATO Taxation Statistics 2021–22, company and individual returns.
 * Approximate figures only.
 */
export const NET_ASSET_BANDS: NetAssetBand[] = [
  { from: 0,           to: 100_000,     label: '$0 – <$100,000',             count: 640_000 },
  { from: 100_000,     to: 500_000,     label: '$100,000 – <$500,000',       count: 520_000 },
  { from: 500_000,     to: 1_000_000,   label: '$500,000 – <$1,000,000',     count: 280_000 },
  { from: 1_000_000,   to: 2_000_000,   label: '$1,000,000 – <$2,000,000',  count: 220_000 },
  { from: 2_000_000,   to: 6_000_000,   label: '$2,000,000 – <$6,000,000',  count: 195_000 },
  { from: 6_000_000,   to: 10_000_000,  label: '$6,000,000 – <$10,000,000', count:  52_000 },
  { from: 10_000_000,  to: Infinity,    label: '$10,000,000 and above',      count:  83_000 },
];

export const TURNOVER_TOTAL_BUSINESSES = TURNOVER_BANDS.reduce((s, b) => s + b.count, 0);
export const NET_ASSET_TOTAL_BUSINESSES = NET_ASSET_BANDS.reduce((s, b) => s + b.count, 0);

export const ABS_DATA_SOURCE = 'ABS Cat. 8165.0, June 2023; ATO Taxation Statistics 2021–22';
export const ABS_DATA_YEAR = '2023';

/**
 * Returns the estimated number and percentage of businesses with turnover
 * at or above `amount`. Uses linear interpolation within bands.
 */
export function businessesAtOrAboveTurnover(amount: number): { count: number; percent: number } {
  let aboveCount = 0;
  for (const band of TURNOVER_BANDS) {
    if (amount >= band.to) continue; // entire band is below threshold
    if (amount <= band.from) {
      // entire band is at or above threshold
      aboveCount += band.count;
    } else {
      // amount falls within this band — interpolate linearly
      const bandWidth = band.to === Infinity ? band.from * 4 : band.to - band.from;
      const fractionAbove = (band.to === Infinity ? 1 : (band.to - amount) / bandWidth);
      aboveCount += Math.round(band.count * fractionAbove);
    }
  }
  return {
    count: aboveCount,
    percent: aboveCount / TURNOVER_TOTAL_BUSINESSES,
  };
}

/**
 * Returns the estimated number and percentage of businesses with net assets
 * at or above `amount`. Uses linear interpolation within bands.
 */
export function businessesAtOrAboveNetAssets(amount: number): { count: number; percent: number } {
  let aboveCount = 0;
  for (const band of NET_ASSET_BANDS) {
    if (amount >= band.to) continue;
    if (amount <= band.from) {
      aboveCount += band.count;
    } else {
      const bandWidth = band.to === Infinity ? band.from * 4 : band.to - band.from;
      const fractionAbove = (band.to === Infinity ? 1 : (band.to - amount) / bandWidth);
      aboveCount += Math.round(band.count * fractionAbove);
    }
  }
  return {
    count: aboveCount,
    percent: aboveCount / NET_ASSET_TOTAL_BUSINESSES,
  };
}
