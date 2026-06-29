// src/api/invoiceApi.js
import axiosInstance from './axiosInstance'

// Individual exports
export const getInvoices = (params) => axiosInstance.get('/invoices', { params })
export const getInvoiceById = (id) => axiosInstance.get(`/invoices/${id}`)
export const createInvoice = (data) => axiosInstance.post('/invoices', data)
export const createCreditNote = (data) => axiosInstance.post('/invoices/credit-note', data)
export const updateInvoice = (id, data) => axiosInstance.put(`/invoices/${id}`, data)
export const deleteInvoice = (id) => axiosInstance.delete(`/invoices/${id}`)
export const downloadInvoicePdf = (id) => axiosInstance.get(`/invoices/${id}/pdf`, { responseType: 'blob' })

// ✅ NEW - Get all credit notes for an invoice
export const getCreditNotesByInvoiceId = (invoiceId) => 
  axiosInstance.get(`/invoices/${invoiceId}/credit-notes`)

// ✅ NEW - Delete a credit note
export const deleteCreditNote = (creditNoteId) => 
  axiosInstance.delete(`/invoices/credit-note/${creditNoteId}`)

// Export as object for convenience
export const invoiceApi = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  createCreditNote,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePdf,
  getCreditNotesByInvoiceId,
  deleteCreditNote,
}