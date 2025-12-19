/**
 * Number formatting utilities
 * Ensures consistent formatting across server and client
 */

/**
 * Format number with consistent locale (en-US) to prevent hydration mismatches
 * Uses dot as decimal separator regardless of user's locale
 */
export const formatNumber = (value: number, options?: {
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
}) => {
  const maxDigits = options?.maximumFractionDigits ?? (value > 100 ? 1 : 2);
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxDigits,
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
  }).format(value);
};

/**
 * Format number as percentage
 */
export const formatPercent = (value: number, decimals = 1) => {
  return `${formatNumber(value * 100, { maximumFractionDigits: decimals })}%`;
};

