// src/api/invoiceApi.js
import axiosInstance from './axiosInstance'

export const getInvoices        = (params)     => axiosInstance.get('/invoices', { params })
export const getInvoiceById     = (id)         => axiosInstance.get(`/invoices/${id}`)
export const createInvoice      = (data)       => axiosInstance.post('/invoices', data)
export const updateInvoice      = (id, data)   => axiosInstance.put(`/invoices/${id}`, data)
export const deleteInvoice      = (id)         => axiosInstance.delete(`/invoices/${id}`)
export const downloadInvoicePdf = (id)         => axiosInstance.get(`/invoices/${id}/pdf`, { responseType: 'blob' })

export const invoiceApi = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePdf,
}