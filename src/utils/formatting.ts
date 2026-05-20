const auCurrency = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const auPercent = new Intl.NumberFormat('en-AU', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return auCurrency.format(value);
}

export function formatPercent(value: number): string {
  return auPercent.format(value);
}

export function formatResult(result: number | string): string {
  if (typeof result === 'string') return result;
  return formatCurrency(result);
}

export function formatDelta(value: number): string {
  const formatted = formatCurrency(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}
