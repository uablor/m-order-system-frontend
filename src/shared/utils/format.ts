/**
 * Format number with comma separators.
 * Removes trailing .00 but keeps meaningful decimals.
 *
 * Examples:
 *   1000     → "1,000"
 *   1000.5   → "1,000.5"
 *   1000.00  → "1,000"
 *   44.55    → "44.55"
 *   0        → "0"
 */
export const fmtNumber = (val: number): string => {
  return val.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

/**
 * Formatter for a-input-number: adds comma separators, preserves decimals during typing.
 */
export const numFormatter = (value: string | number | undefined): string => {
  if (value === undefined || value === '') return '';
  const str = String(value);
  const parts = str.split('.');
  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return parts.join('.');
};

/**
 * Parser for a-input-number: strips commas so the component gets a clean number.
 */
export const numParser = (value: string | undefined): string => {
  return value ? value.replace(/,/g, '') : '';
};
