import currency from 'currency.js';

/**
 * Format a value as USD currency
 */
export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '-';
  }
  
  return currency(numValue, { symbol: '$', precision: 2 }).format();
}

/**
 * Format a value as percentage
 */
export function formatPercentage(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '-';
  }
  
  return `${numValue.toFixed(4)}%`;
}

/**
 * Parse currency string to number for form submission
 */
export function parseCurrency(value: string): number | null {
  if (!value || value === '-') {
    return null;
  }
  
  const parsed = currency(value).value;
  return isNaN(parsed) ? null : parsed;
}
