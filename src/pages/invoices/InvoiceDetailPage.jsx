// src/pages/invoices/InvoiceDetailPage.jsx
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button, Card, Col, Divider, Row, Space,
  Spin, Table, Tag, Typography, message, Modal
} from 'antd'
import { FilePdfOutlined, ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { invoiceApi } from '../../api/invoiceApi'

const { Title, Text } = Typography
const STATUS_COLORS = { UNPAID: 'red', PARTIAL: 'orange', PAID: 'green' }

const InvoiceDetailPage = () => {
  const { id }   = useParams()
  const navigate = useNavigate()
  const printRef = useRef()

  const [invoice,     setInvoice]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    invoiceApi.getInvoiceById(id)
      .then(r => setInvoice(r.data?.data ?? r.data))
      .catch(() => message.error('Failed to load invoice'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      const res  = await invoiceApi.downloadInvoicePdf(id)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      if (blob.size < 100) throw new Error('Empty PDF received')
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${invoice?.invoiceNumber || 'invoice'}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      Modal.confirm({
        title:      'PDF download failed',
        content:    'Server se PDF generate nahi ho rahi. Browser print se PDF save kar sakte ho.',
        okText:     'Print / Save as PDF',
        cancelText: 'Cancel',
        onOk:       () => window.print(),
      })
    } finally {
      setDownloading(false)
    }
  }

  if (loading)  return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!invoice) return <div style={{ padding: 24 }}>Invoice not found.</div>

  const lineItemColumns = [
    { title: '#',           key: 'idx',               width: 50,
      render: (_, __, i) => i + 1 },
    { title: 'Activity',    dataIndex: 'activityName', key: 'activityName' },
    { title: 'HSN Code',    dataIndex: 'hsnCode',      key: 'hsnCode',      width: 110,
      render: v => v || '-' },
    { title: 'Description', dataIndex: 'description',  key: 'description',  ellipsis: true },
    { title: 'Amount (₹)',  dataIndex: 'amount',       key: 'amount',       align: 'right',
      render: v => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
  ]

  const InfoRow = ({ label, value }) => (
    <div style={{
      display: 'flex', padding: '10px 0',
      borderBottom: '1px solid #f0f0f0', gap: 8
    }}>
      <Text type="secondary" style={{ minWidth: 140, flexShrink: 0 }}>{label}</Text>
      <Text strong>{value || '-'}</Text>
    </div>
  )

  const cgstAmount  = Number(invoice.cgstAmount  || 0)
  const sgstAmount  = Number(invoice.sgstAmount  || 0)
  const igstAmount  = Number(invoice.igstAmount  || 0)
  const totalGst    = cgstAmount + sgstAmount + igstAmount
  const subtotal    = Number(invoice.subtotal    || 0)
  const totalAmount = Number(invoice.totalAmount || 0)
  const paidAmount  = Number(invoice.paidAmount  || 0)
  const balanceDue  = Math.max(0, totalAmount - paidAmount)

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
      `}</style>

      <div ref={printRef} style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div className="no-print" style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 20
        }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/invoices')} />
            <Title level={4} style={{ margin: 0 }}>{invoice.invoiceNumber}</Title>
            <Tag color={STATUS_COLORS[invoice.status] || 'default'}>{invoice.status}</Tag>
          </Space>
          <Space>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              Print
            </Button>
            <Button
              type="primary" icon={<FilePdfOutlined />}
              loading={downloading} onClick={handleDownloadPdf}
            >
              Download PDF
            </Button>
          </Space>
        </div>

        {/* Info Grid */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={32}>
            <Col xs={24} sm={12}>
              <InfoRow label="Client"          value={invoice.clientName} />
              <InfoRow label="Invoice Date"    value={invoice.invoiceDate
                ? dayjs(invoice.invoiceDate).format('DD MMM YYYY') : '-'} />
              <InfoRow label="GST Type"        value={invoice.gstType} />
            </Col>
            <Col xs={24} sm={12}>
              <InfoRow label="Campaign"        value={invoice.campaignName} />
              <InfoRow label="Due Date"        value={invoice.dueDate
                ? dayjs(invoice.dueDate).format('DD MMM YYYY') : '-'} />
              <InfoRow label="Source Estimate" value={invoice.estimateNumber} />
            </Col>
          </Row>
        </Card>

        {/* Line Items */}
        <Card title="Line Items" style={{ marginBottom: 16 }}>
          <Table
            dataSource={invoice.lineItems || []}
            columns={lineItemColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>

        {/* Totals */}
        <Card>
          <Row justify="end">
            <Col xs={24} sm={14} md={12}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Subtotal (without GST)</Text>
                  <Text>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </div>

                {invoice.gstType === 'CGST_SGST' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">CGST ({invoice.cgstRate}%)</Text>
                      <Text type="secondary">
                        ₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">SGST ({invoice.sgstRate}%)</Text>
                      <Text type="secondary">
                        ₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Text>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">IGST ({invoice.igstRate}%)</Text>
                    <Text type="secondary">
                      ₹{igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Text>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Total GST</Text>
                  <Text>₹{totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </div>

                <Divider style={{ margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 16 }}>Grand Total</Text>
                  <Text strong style={{ fontSize: 16, color: '#0057FF' }}>
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#52c41a' }}>Paid Amount</Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    ₹{paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </div>

                <Divider style={{ margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 15, color: balanceDue <= 0 ? '#52c41a' : '#ff4d4f' }}>
                    Balance Due
                  </Text>
                  <Text strong style={{ fontSize: 15, color: balanceDue <= 0 ? '#52c41a' : '#ff4d4f' }}>
                    ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </div>

              </div>
            </Col>
          </Row>
        </Card>

      </div>
    </>
  )
}

export default InvoiceDetailPage