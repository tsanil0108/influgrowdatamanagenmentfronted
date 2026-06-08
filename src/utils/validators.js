/**
 * PAN: ABCDE1234F
 */
export function validatePAN(pan) {
  if (!pan) return 'PAN number is required'
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
    return 'Invalid PAN format (e.g. ABCDE1234F)'
  }
  return null
}

/**
 * GST: 27ABCDE1234F1Z5
 */
export function validateGST(gst) {
  if (!gst) return null // GST optional for some
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst.toUpperCase())) {
    return 'Invalid GST format (e.g. 27ABCDE1234F1Z5)'
  }
  return null
}

/**
 * IFSC: SBIN0001234
 */
export function validateIFSC(ifsc) {
  if (!ifsc) return 'IFSC code is required'
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())) {
    return 'Invalid IFSC format (e.g. SBIN0001234)'
  }
  return null
}

/**
 * Mobile: 10 digits
 */
export function validateMobile(mobile) {
  if (!mobile) return null // optional
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return 'Invalid mobile number (10 digits, starts with 6-9)'
  }
  return null
}

/**
 * Email
 */
export function validateEmail(email) {
  if (!email) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Invalid email address'
  }
  return null
}

/**
 * Required field
 */
export function required(value, fieldName = 'This field') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`
  }
  return null
}

/**
 * Amount: positive number
 */
export function validateAmount(amount) {
  if (amount === null || amount === undefined || amount === '') return 'Amount is required'
  if (isNaN(amount) || parseFloat(amount) <= 0) return 'Amount must be a positive number'
  return null
}