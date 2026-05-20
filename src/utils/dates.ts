import { differenceInCalendarDays, parseISO } from 'date-fns';

export function daysBetween(from: Date | string, to: Date | string): number {
  const fromDate = typeof from === 'string' ? parseISO(from) : from;
  const toDate = typeof to === 'string' ? parseISO(to) : to;
  return differenceInCalendarDays(toDate, fromDate);
}

export function yearsBetween(from: Date | string, to: Date | string): number {
  return daysBetween(from, to) / 365.25;
}

export function parseDate(dateStr: string): Date {
  return parseISO(dateStr);
}

export function isAfterDate(date: Date | string, reference: Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d > reference;
}

export function isBeforeDate(date: Date | string, reference: Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d < reference;
}

export function isOnOrAfterDate(date: Date | string, reference: Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d >= reference;
}
