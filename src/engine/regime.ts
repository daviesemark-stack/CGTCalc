import { Regime } from '../types';
import {
  KEY_DATE_BUDGET_ANNOUNCEMENT,
  KEY_DATE_NEW_REGIME_START,
  PRE_CGT_CUTOFF,
} from './constants';
import { parseDate, isBeforeDate, isOnOrAfterDate } from '../utils/dates';

export function determineRegime(acquisitionDate: string, saleDate: string): Regime {
  const acqDate = parseDate(acquisitionDate);
  const salDate = parseDate(saleDate);

  if (isBeforeDate(acqDate, PRE_CGT_CUTOFF)) {
    return Regime.PreCGT;
  }

  if (isBeforeDate(acqDate, KEY_DATE_BUDGET_ANNOUNCEMENT)) {
    return Regime.OldRules;
  }

  if (isOnOrAfterDate(acqDate, KEY_DATE_NEW_REGIME_START)) {
    return Regime.NewRules;
  }

  // Acquired between budget announcement and 1 Jul 2027
  if (isOnOrAfterDate(salDate, KEY_DATE_NEW_REGIME_START)) {
    return Regime.Transitional;
  }

  return Regime.OldRules;
}

export function regimeLabel(regime: Regime): string {
  switch (regime) {
    case Regime.PreCGT: return 'Pre-CGT asset (acquired before 20 September 1985)';
    case Regime.OldRules: return 'Current rules (50% CGT discount — grandfathered)';
    case Regime.Transitional: return 'Transitional split (acquired after budget announcement, sold after 1 July 2027)';
    case Regime.NewRules: return 'New rules (CPI indexation + 30% minimum tax)';
  }
}
