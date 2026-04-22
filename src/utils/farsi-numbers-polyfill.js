/**
 * Polyfill to make toLocaleString() use Farsi numbers by default
 */

// Store original toLocaleString
const originalToLocaleString = Number.prototype.toLocaleString;

// Override toLocaleString to use fa-IR locale by default
Number.prototype.toLocaleString = function(locales, options) {
  // If no locale specified, use Persian
  if (!locales) {
    return originalToLocaleString.call(this, 'fa-IR', options);
  }
  return originalToLocaleString.call(this, locales, options);
};

// Also handle Date toLocaleString
const originalDateToLocaleString = Date.prototype.toLocaleString;

Date.prototype.toLocaleString = function(locales, options) {
  if (!locales) {
    return originalDateToLocaleString.call(this, 'fa-IR', options);
  }
  return originalDateToLocaleString.call(this, locales, options);
};

export default {};
