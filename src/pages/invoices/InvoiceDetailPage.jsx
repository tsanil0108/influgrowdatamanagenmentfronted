import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Col, Descriptions, Divider, Row, Space, Spin, Table, Tag, Typography, message } from 'antd'
import { FilePdfOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { invoiceApi } from '../../api/invoiceApi'

const { Title, Text } = Typography
const STATUS_COLORS = { UNPAID: 'red', PARTIAL: 'orange', PAID: 'green' }

const InvoiceDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    invoiceApi.getInvoiceById(id)
      .then(r => setInvoice(r.data))
      .catch(() => message.error('Failed to load invoice'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      await invoiceApi.downloadInvoicePdf(id)
    } catch {
      message.error('PDF download failed')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!invoice) return <div style={{ padding: 24 }}>Invoice not found.</div>

  const lineItemColumns = [
    { title: '#', key: 'idx', width: 50, render: (_, __, i) => i + 1 },
    { title: 'Activity', dataIndex: 'activity_name', key: 'activity_name' },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Amount (₹)', dataIndex: 'amount', key: 'amount', align: 'right',
      render: v => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/invoices')} />
          <Title level={4} style={{ margin: 0 }}>{invoice.invoice_number}</Title>
          <Tag color={STATUS_COLORS[invoice.status]}>{invoice.status}</Tag>
        </Space>
        <Button type="primary" icon={<FilePdfOutlined />} loading={downloading} onClick={handleDownloadPdf}>
          Download PDF
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Client">{invoice.client_name}</Descriptions.Item>
          <Descriptions.Item label="Campaign">{invoice.campaign_name}</Descriptions.Item>
          <Descriptions.Item label="Invoice Date">
            {invoice.invoice_date ? dayjs(invoice.invoice_date).format('DD MMM YYYY') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Due Date">
            {invoice.due_date ? dayjs(invoice.due_date).format('DD MMM YYYY') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="GST Type">{invoice.gst_type}</Descriptions.Item>
          <Descriptions.Item label="Source Estimate">{invoice.estimate_number || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Line Items" style={{ marginBottom: 16 }}>
        <Table
          dataSource={invoice.line_items || []}
          columns={lineItemColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      <Card>
        <Row justify="end">
          <Col span={10}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Subtotal</Text>
                <Text>₹{Number(invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
              </div>
              {invoice.gst_type === 'CGST_SGST' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>CGST ({invoice.cgst_rate}%)</Text>
                    <Text>₹{Number(invoice.cgst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>SGST ({invoice.sgst_rate}%)</Text>
                    <Text>₹{Number(invoice.sgst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>IGST ({invoice.igst_rate}%)</Text>
                  <Text>₹{Number(invoice.igst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </div>
              )}
              <Divider style={{ margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: 16 }}>Total</Text>
                <Text strong style={{ fontSize: 16, color: '#0057FF' }}>
                  ₹{Number(invoice.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </div>
              {invoice.amount_in_words && (
                <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                  {invoice.amount_in_words}
                </Text>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default InvoiceDetailPage