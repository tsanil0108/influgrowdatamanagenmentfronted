
import { useState, useCallback } from 'react'
import {
  getEstimates,
  getEstimateById,
  createEstimate,
  updateEstimate,
  deleteEstimate,
  downloadEstimatePdf,
} from '../api/estimateApi'
import { message } from 'antd'

export function useEstimates() {
  const [list,    setList]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [detail,  setDetail]  = useState(null)

  const loadEstimates = useCallback(async (params) => {
    setLoading(true)
    try {
      const res  = await getEstimates(params)
      const data = res.data?.data
      const list = data?.content ?? (Array.isArray(data) ? data : [])
      setList(list)
      setTotal(data?.totalElements ?? list.length ?? 0)
    } catch {
      message.error('Failed to load estimates')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadEstimate = async (id) => {
    setLoading(true)
    try {
      const res  = await getEstimateById(id)
      const data = res.data?.data
      setDetail(data)
      return data
    } catch {
      message.error('Failed to load estimate')
    } finally {
      setLoading(false)
    }
  }

  const saveEstimate = async (data, id) => {
    try {
      if (id) {
        await updateEstimate(id, data)
        message.success('Estimate updated')
        return true
      } else {
        const res = await createEstimate(data)
        message.success('Estimate created')
        return res.data?.data
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save estimate')
      return false
    }
  }

  
  const removeEstimate = async (id) => {
    try {
      await deleteEstimate(id)
      message.success('Estimate deleted successfully')
     
      setList(prev => prev.filter(e => e.id !== id))
      setTotal(prev => prev - 1)
      return true
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to delete estimate')
      return false
    }
  }

  const downloadPdf = async (id, estimateNumber) => {
    try {
      const res = await downloadEstimatePdf(id)
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a   = document.createElement('a')
      a.href     = url
      a.download = `${estimateNumber || 'estimate'}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      message.error('Failed to download PDF')
    }
  }

  return { list, total, loading, detail, loadEstimates, loadEstimate, saveEstimate, removeEstimate, downloadPdf }
}