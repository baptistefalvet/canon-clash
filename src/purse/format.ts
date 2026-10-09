// 1234 → « 12,34 € ».

const NARROW_NBSP = '\u202f';

export function formatEuros(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const euros = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, '0');
  return `${sign}${euros},${rest}${NARROW_NBSP}€`;
}

/** Amount without the currency, used by the purse pill (currency is laid out separately). */
export function formatPurseAmount(cents: number, hideZeroCents: boolean): string {
  const abs = Math.abs(cents);
  const sign = cents < 0 ? '-' : '';
  if (hideZeroCents && abs % 100 === 0) return `${sign}${abs / 100}`;
  return `${sign}${Math.floor(abs / 100)},${String(abs % 100).padStart(2, '0')}`;
}
