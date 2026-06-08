import axiosInstance from './axiosInstance'

export const getBankEntries = (params) =>
  axiosInstance.get('/bank-entries', { params })

export const createReceipt = (data) =>
  axiosInstance.post('/bank-entries', {
    ...data,
    entryType: 'RECEIPT',
  })

export const createPayment = (data) =>
  axiosInstance.post('/bank-entries', {
    ...data,
    entryType: 'PAYMENT',
  })

export const createContra = (data) =>
  axiosInstance.post('/bank-entries', {
    ...data,
    entryType: 'CONTRA',
  })

export const getStatement = (params) =>
  axiosInstance.get('/bank-entries/statement', { params })

export const bankEntryApi = {
  getBankEntries,
  createReceipt,
  createPayment,
  createContra,
  getStatement,
}