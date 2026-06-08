import dayjs from 'dayjs'

/**
 * Format number as Indian currency: ₹1,23,456.78
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0.00'
  const num = parseFloat(amount)
  if (isNaN(num)) return '₹0.00'
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format date to DD MMM YYYY
 */
export function formatDate(date) {
  if (!date) return '—'
  return dayjs(date).format('DD MMM YYYY')
}

/**
 * Format date to YYYY-MM-DD for API
 */
export function formatDateForApi(date) {
  if (!date) return null
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * Format PAN to uppercase
 */
export function formatPAN(pan) {
  if (!pan) return ''
  return pan.toUpperCase().trim()
}

/**
 * Format GST number to uppercase
 */
export function formatGST(gst) {
  if (!gst) return ''
  return gst.toUpperCase().trim()
}

/**
 * Format mobile number
 */
export function formatMobile(mobile) {
  if (!mobile) return ''
  return mobile.replace(/\D/g, '').slice(0, 10)
}

/**
 * Short currency without decimals
 */
export function formatCurrencyShort(amount) {
  if (!amount) return '₹0'
  const num = parseFloat(amount)
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`
  return `₹${num.toFixed(0)}`
}