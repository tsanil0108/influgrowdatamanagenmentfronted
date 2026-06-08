import { useState, useCallback } from 'react'
import { fetchReport, exportReport } from '../api/reportApi'
import { message } from 'antd'

export function useReports() {
  const [data, setData] = useState({ columns: [], rows: [] })
  const [loading, setLoading] = useState(false)

  const loadReport = useCallback(async (reportName, filters = {}) => {
    setLoading(true)
    try {
      const res = await fetchReport(reportName, filters)
      setData(res.data)
    } catch { message.error('Failed to load report') }
    finally { setLoading(false) }
  }, [])

  const exportReportFile = async (reportName, format, filters = {}) => {
    try {
      const res = await exportReport(reportName, format, filters)
      const ext = format === 'excel' ? 'xlsx' : 'pdf'
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportName}.${ext}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch { message.error('Failed to export report') }
  }

  return { data, loading, loadReport, exportReportFile }
}