import { useState, useCallback } from 'react'
import { getInvoices, getInvoiceById, createInvoice, downloadInvoicePdf } from '../api/invoiceApi'
import { message } from 'antd'

export function useInvoices() {
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState(null)

  const loadInvoices = useCallback(async (params) => {
    setLoading(true)
    try {
      const res = await getInvoices(params)
      setList(res.data.content || res.data)
      setTotal(res.data.totalElements || res.data.length || 0)
    } catch { message.error('Failed to load invoices') }
    finally { setLoading(false) }
  }, [])

  const loadInvoice = async (id) => {
    setLoading(true)
    try {
      const res = await getInvoiceById(id)
      setDetail(res.data)
      return res.data
    } catch { message.error('Failed to load invoice') }
    finally { setLoading(false) }
  }

  const saveInvoice = async (data) => {
    try {
      const res = await createInvoice(data)
      message.success('Invoice created')
      return res.data
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create invoice')
      return false
    }
  }

  const downloadPdf = async (id, invoiceNumber) => {
    try {
      const res = await downloadInvoicePdf(id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoiceNumber || 'invoice'}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch { message.error('Failed to download PDF') }
  }

  return { list, total, loading, detail, loadInvoices, loadInvoice, saveInvoice, downloadPdf }
}