// src/pages/invoices/InvoiceDetailPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button, Card, Col, Divider, Row, Space,
  Spin, Table, Tag, Typography, message, Tabs, Alert
} from 'antd'
import { 
  FilePdfOutlined, 
  ArrowLeftOutlined, 
  EyeOutlined, 
  FileTextOutlined,
  CreditCardOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { invoiceApi } from '../../api/invoiceApi'

const { Title, Text } = Typography
const STATUS_COLORS = { UNPAID: 'red', PARTIAL: 'orange', PAID: 'green' }

const InvoiceDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [invoice, setInvoice] = useState(null)
  const [creditNotes, setCreditNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [activeTab, setActiveTab] = useState('1')

  useEffect(() => {
    loadInvoiceData()
  }, [id])

  const loadInvoiceData = async () => {
    setLoading(true)
    try {
      // Load Original Invoice
      const invoiceRes = await invoiceApi.getInvoiceById(id)
      const inv = invoiceRes.data?.data ?? invoiceRes.data
      setInvoice(inv)
      
      // Check if this is a Credit Note
      if (inv?.invoiceType === 'CREDIT_NOTE' && inv?.originalInvoiceId) {
        // Credit Note hai, original invoice load karo
        const originalRes = await invoiceApi.getInvoiceById(inv.originalInvoiceId)
        const originalInv = originalRes.data?.data ?? originalRes.data
        setInvoice(originalInv)
        
        // Credit Notes list mein current credit note add karo
        setCreditNotes([inv])
        
        // Active tab "Credit Notes" par set karo
        setActiveTab('2')
      } else {
        // Original Invoice hai - uske credit notes load karo
        try {
          const cnRes = await invoiceApi.getCreditNotesByInvoiceId(id)
          const cns = cnRes.data?.data ?? []
          setCreditNotes(Array.isArray(cns) ? cns : [])
        } catch (error) {
          setCreditNotes([])
        }
        setActiveTab('1')
      }
    } catch (error) {
      message.error('Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  // Download PDF
  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      const res = await invoiceApi.downloadInvoicePdf(id)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      if (blob.size < 100) throw new Error('Empty PDF received')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice?.invoiceNumber || 'invoice'}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      message.success('PDF downloaded successfully')
    } catch {
      message.error('PDF generate nahi ho rahi, please try again.')
    } finally {
      setDownloading(false)
    }
  }

  // View PDF
  const handleViewPdf = async () => {
    setDownloading(true)
    try {
      const res = await invoiceApi.downloadInvoicePdf(id)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      if (blob.size < 100) throw new Error('Empty PDF received')
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch {
      message.error('PDF view nahi ho rahi, please try again.')
    } finally {
      setDownloading(false)
    }
  }

  // View Credit Note Detail
  const handleViewCreditNote = (cnId) => {
    navigate(`/invoices/${cnId}`)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!invoice) return <div style={{ padding: 24 }}>Invoice not found.</div>

  const lineItemColumns = [
    { title: '#', key: 'idx', width: 50, render: (_, __, i) => i + 1 },
    { title: 'Activity', dataIndex: 'activityName', key: 'activityName' },
    { title: 'HSN Code', dataIndex: 'hsnCode', key: 'hsnCode', width: 110, render: v => v || '-' },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { 
      title: 'Amount (₹)', 
      dataIndex: 'amount', 
      key: 'amount', 
      align: 'right',
      render: v => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` 
    },
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

  const cgstAmount = Number(invoice.cgstAmount || 0)
  const sgstAmount = Number(invoice.sgstAmount || 0)
  const igstAmount = Number(invoice.igstAmount || 0)
  const totalGst = cgstAmount + sgstAmount + igstAmount
  const subtotal = Number(invoice.subtotal || 0)
  const totalAmount = Number(invoice.totalAmount || 0)
  const paidAmount = Number(invoice.paidAmount || 0)
  const balanceDue = Math.max(0, totalAmount - paidAmount)

  // Credit Notes Table Columns
  const creditNoteColumns = [
    {
      title: 'CN Number',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => handleViewCreditNote(record.id)}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => (
        <Text type="danger" strong>
          ₹{Math.abs(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ISSUED' ? 'blue' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewCreditNote(record.id)}
        >
          View
        </Button>
      ),
    },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>

      {/* Header - ✅ Print button removed */}
      <div className="no-print" style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20, flexWrap: 'wrap',
        gap: 8
      }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/invoices')} />
          <Title level={4} style={{ margin: 0 }}>{invoice.invoiceNumber}</Title>
          <Tag color={STATUS_COLORS[invoice.status] || 'default'}>{invoice.status}</Tag>
          {creditNotes.length > 0 && (
            <Tag color="red">Has Credit Notes ({creditNotes.length})</Tag>
          )}
        </Space>

        <Space wrap>
          {/* ✅ View Button - Open PDF in new tab */}
          <Button
            icon={<EyeOutlined />}
            onClick={handleViewPdf}
            loading={downloading}
          >
            View
          </Button>
          
          {/* ✅ Download PDF Button */}
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            loading={downloading}
            onClick={handleDownloadPdf}
          >
            Download PDF
          </Button>
        </Space>
      </div>

      {/* ✅ Tabs - Invoice Details & Credit Notes */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: '1',
            label: 'Invoice Details',
            children: (
              <div>
                {/* Invoice Info */}
                <Card style={{ marginBottom: 16 }}>
                  <Row gutter={32}>
                    <Col xs={24} sm={12}>
                      <InfoRow label="Client" value={invoice.clientName} />
                      <InfoRow label="Invoice Date" value={invoice.invoiceDate
                        ? dayjs(invoice.invoiceDate).format('DD MMM YYYY') : '-'} />
                      <InfoRow label="GST Type" value={invoice.gstType} />
                    </Col>
                    <Col xs={24} sm={12}>
                      <InfoRow label="Campaign" value={invoice.campaignName} />
                      <InfoRow label="Due Date" value={invoice.dueDate
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
            ),
          },
          {
            key: '2',
            label: (
              <span>
                <CreditCardOutlined /> Credit Notes ({creditNotes.length})
              </span>
            ),
            children: (
              <Card>
                {creditNotes.length > 0 ? (
                  <Table
                    dataSource={creditNotes}
                    columns={creditNoteColumns}
                    rowKey="id"
                    pagination={false}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Text type="secondary">No credit notes issued for this invoice</Text>
                    <br />
                    <Button 
                      type="primary" 
                      danger
                      style={{ marginTop: 16 }}
                      onClick={() => navigate(`/invoices/credit-note/new?invoiceId=${invoice.id}`)}
                    >
                      Generate Credit Note
                    </Button>
                  </div>
                )}
              </Card>
            ),
          },
        ]}
      />
    </div>
  )
}

export default InvoiceDetailPage