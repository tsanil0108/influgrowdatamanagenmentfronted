import { useState, useCallback } from 'react'
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  deleteInvoice,
  downloadInvoicePdf
} from '../api/invoiceApi'
import { message } from 'antd'

export function useInvoices() {
  const [list,    setList]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [detail,  setDetail]  = useState(null)

  const loadInvoices = useCallback(async (params) => {
    setLoading(true)
    try {
      const res     = await getInvoices(params)
      // ApiResponse wrapper: res.data = { success, message, data: { content, totalElements } }
      const payload = res.data?.data ?? res.data
      const items   = payload?.content ?? payload
      setList(Array.isArray(items) ? items : [])
      setTotal(payload?.totalElements ?? (Array.isArray(items) ? items.length : 0))
    } catch { message.error('Failed to load invoices') }
    finally   { setLoading(false) }
  }, [])

  const loadInvoice = async (id) => {
    setLoading(true)
    try {
      const res = await getInvoiceById(id)
      const data = res.data?.data ?? res.data
      setDetail(data)
      return data
    } catch { message.error('Failed to load invoice') }
    finally   { setLoading(false) }
  }

  const saveInvoice = async (data) => {
    try {
      const res = await createInvoice(data)
      message.success('Invoice created')
      return res.data?.data ?? res.data
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create invoice')
      return false
    }
  }

  const removeInvoice = async (id) => {
    try {
      await deleteInvoice(id)
      setList(prev => prev.filter(i => i.id !== id))
      message.success('Invoice deleted')
      return true
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to delete invoice')
      return false
    }
  }

  const downloadPdf = async (id, invoiceNumber) => {
    try {
      const res = await downloadInvoicePdf(id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a   = document.createElement('a')
      a.href     = url
      a.download = `${invoiceNumber || 'invoice'}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch { message.error('Failed to download PDF') }
  }

  return {
    list, total, loading, detail,
    loadInvoices, loadInvoice, saveInvoice,
    removeInvoice,
    downloadPdf
  }
}