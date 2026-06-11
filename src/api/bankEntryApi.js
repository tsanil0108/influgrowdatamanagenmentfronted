// src/api/bankEntryApi.js
import axiosInstance from './axiosInstance'

export const getBankEntries = (params) => axiosInstance.get('/bank-entries', { params })

export const createReceipt = (data) => axiosInstance.post('/bank-entries/receipt', data)
export const createPayment = (data) => axiosInstance.post('/bank-entries/payment', data)
export const createContra  = (data) => axiosInstance.post('/bank-entries/contra',  data)

export const getStatement = (params) => axiosInstance.get('/bank-entries', { params })

export const bankEntryApi = {
  getBankEntries,
  createReceipt,
  createPayment,
  createContra,
  getStatement,
}