/**
 * Currency formatter for NZD
 */
export const formatNZD = (amount) => {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD'
  }).format(amount);
};

/**
 * Credit card number formatter
 * Formats as: 0000 0000 0000 0000
 */
export const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];
  
  for (let i = 0; i < match.length; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  
  if (parts.length) {
    return parts.join(" ");
  } else {
    return value;
  }
};

/**
 * Expiry date formatter
 * Formats as: MM/YY
 */
export const formatExpiryDate = (value) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  if (v.length >= 2) {
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  }
  return v;
};

/**
 * Number formatter with custom precision
 */
export const formatNumber = (value, precision = 1) => {
  return Number(value).toFixed(precision);
};

/**
 * Percentage formatter
 */
export const formatPercent = (value, precision = 1) => {
  return `${formatNumber(value, precision)}%`;
}; 