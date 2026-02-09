/**
 * Money formatting utilities
 */

export interface FormatMoneyOptions {
  currency?: string
  locale?: string
  showCents?: boolean
}

/**
 * Format a price for display
 */
export function formatMoney(
  amount: number,
  options: FormatMoneyOptions = {}
): string {
  const { currency = 'USD', locale = 'en-US', showCents = true } = options

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount)
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(
  originalPrice: number,
  salePrice: number
): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

/**
 * Format discount for display
 */
export function formatDiscount(
  originalPrice: number,
  salePrice: number
): string {
  const discount = calculateDiscount(originalPrice, salePrice)
  return discount > 0 ? `${discount}% OFF` : ''
}
