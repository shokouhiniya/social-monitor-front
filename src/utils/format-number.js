/**
 * Convert English numbers to Farsi numbers
 */
export function toFarsiNumber(num) {
  if (num === null || num === undefined) return '';
  
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  
  return num.toString().replace(/\d/g, (digit) => farsiDigits[parseInt(digit, 10)]);
}

/**
 * Format number with thousand separators in Farsi
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '۰';
  
  // Use Persian locale for formatting
  const formatted = new Intl.NumberFormat('fa-IR').format(num);
  
  return formatted;
}

/**
 * Format number with custom options
 */
export function formatNumberWithOptions(num, options = {}) {
  if (num === null || num === undefined) return '۰';
  
  return new Intl.NumberFormat('fa-IR', options).format(num);
}
