import React, { useState } from 'react'
import { Button, Space } from 'antd'
import { FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons'

export default function ExportButtons({ onExportPdf, onExportExcel }) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [excelLoading, setExcelLoading] = useState(false)

  const handlePdf = async () => {
    setPdfLoading(true)
    try { await onExportPdf?.() } finally { setPdfLoading(false) }
  }

  const handleExcel = async () => {
    setExcelLoading(true)
    try { await onExportExcel?.() } finally { setExcelLoading(false) }
  }

  return (
    <Space>
      {onExportPdf && (
        <Button
          icon={<FilePdfOutlined />}
          loading={pdfLoading}
          onClick={handlePdf}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          PDF
        </Button>
      )}
      {onExportExcel && (
        <Button
          icon={<FileExcelOutlined />}
          loading={excelLoading}
          onClick={handleExcel}
          style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)', fontFamily: 'var(--font-body)' }}
        >
          Excel
        </Button>
      )}
    </Space>
  )
}