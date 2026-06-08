import { GST_RATES, GST_TYPE, COMPANY_STATE_CODE } from './constants'

/**
 * Determine GST type based on state codes
 * Same state → CGST + SGST
 * Different state → IGST
 */
export function getGSTType(clientStateCode) {
  if (!clientStateCode) return GST_TYPE.IGST
  return clientStateCode === COMPANY_STATE_CODE ? GST_TYPE.CGST_SGST : GST_TYPE.IGST
}

/**
 * Calculate GST breakdown from subtotal
 */
export function calculateGST(subtotal, clientStateCode) {
  const amount = parseFloat(subtotal) || 0
  const gstType = getGSTType(clientStateCode)

  if (gstType === GST_TYPE.CGST_SGST) {
    const cgstAmount = parseFloat((amount * GST_RATES.CGST / 100).toFixed(2))
    const sgstAmount = parseFloat((amount * GST_RATES.SGST / 100).toFixed(2))
    return {
      gstType,
      cgstRate: GST_RATES.CGST,
      sgstRate: GST_RATES.SGST,
      igstRate: 0,
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      totalGST: cgstAmount + sgstAmount,
      totalAmount: parseFloat((amount + cgstAmount + sgstAmount).toFixed(2)),
    }
  } else {
    const igstAmount = parseFloat((amount * GST_RATES.IGST / 100).toFixed(2))
    return {
      gstType,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: GST_RATES.IGST,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount,
      totalGST: igstAmount,
      totalAmount: parseFloat((amount + igstAmount).toFixed(2)),
    }
  }
}

/**
 * Recalculate when line items change
 */
export function recalculateFromLineItems(lineItems, clientStateCode) {
  const subtotal = lineItems.reduce((sum, item) => {
    return sum + (parseFloat(item.amount) || 0)
  }, 0)
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    ...calculateGST(subtotal, clientStateCode),
  }
}