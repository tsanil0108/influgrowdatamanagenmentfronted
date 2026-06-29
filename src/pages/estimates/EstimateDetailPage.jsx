// src/pages/estimates/EstimateDetailPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button, Card, Col, Descriptions, Divider,
  Row, Space, Spin, Table, Tag, Typography, message, Popconfirm
} from 'antd'
import { EditOutlined, FilePdfOutlined, ArrowLeftOutlined, SendOutlined, CheckCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { estimateApi } from '../../api/estimateApi'

const { Title, Text } = Typography
const STATUS_COLORS = {
  DRAFT: 'default', SENT: 'blue', APPROVED: 'green', CANCELLED: 'red'
}

const fmt = (val) =>
  `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

const EstimateDetailPage = () => {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [estimate,    setEstimate]    = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const loadEstimate = () => {
    estimateApi.getEstimateById(id)
      .then(r => setEstimate(r.data?.data))
      .catch(() => message.error('Failed to load estimate'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadEstimate()
  }, [id])

  // ✅ NEW: status workflow — DRAFT -> SENT -> APPROVED (= PO generated).
  // Without this there was no way to move an estimate out of DRAFT, so it
  // always showed "DRAFT" everywhere (lists, invoice dropdown, PO report).
  const handleStatusChange = async (status) => {
    setStatusUpdating(true)
    try {
      await estimateApi.updateEstimateStatus(id, status)
      message.success(
        status === 'APPROVED'
          ? 'Estimate approved — it will now appear on the Purchase Order report'
          : `Estimate marked as ${status}`
      )
      loadEstimate()
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update status')
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      const res = await estimateApi.downloadEstimatePdf(id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a   = document.createElement('a')
      a.href     = url
      a.download = `${estimate?.estimateNumber || 'estimate'}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      message.error('PDF download failed')
    } finally {
      setDownloading(false)
    }
  }

  if (loading)   return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!estimate) return <div style={{ padding: 24 }}>Estimate not found.</div>

  const lineItemColumns = [
    { title: '#',           key: 'index',          width: 50,
      render: (_, __, i) => i + 1 },
    { title: 'Activity',    dataIndex: 'activityName', key: 'activityName' },
    { title: 'HSN Code',    dataIndex: 'hsnCode',      key: 'hsnCode', width: 110,
      render: v => v || '-' },
    { title: 'Description', dataIndex: 'description',  key: 'description', ellipsis: true },
    { title: 'Amount (₹)',  dataIndex: 'amount',        key: 'amount', align: 'right',
      render: v => fmt(v) },
  ]

  // Null-safe values
  const subtotal   = Number(estimate.subtotal   || 0)
  const cgstAmount = Number(estimate.cgstAmount || 0)
  const sgstAmount = Number(estimate.sgstAmount || 0)
  const igstAmount = Number(estimate.igstAmount || 0)
  const totalAmount = Number(estimate.totalAmount || 0)

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20
      }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/estimates')} />
          <Title level={4} style={{ margin: 0 }}>{estimate.estimateNumber}</Title>
          <Tag color={STATUS_COLORS[estimate.status]}>{estimate.status}</Tag>
        </Space>
        <Space>
          <Button
            icon={<EditOutlined />}
            disabled={estimate.status !== 'DRAFT'}
            onClick={() => navigate(`/estimates/${id}/edit`)}
          >
            Edit
          </Button>
          {estimate.status === 'DRAFT' && (
            <Popconfirm
              title="Mark this estimate as Sent?"
              onConfirm={() => handleStatusChange('SENT')}
            >
              <Button icon={<SendOutlined />} loading={statusUpdating}>
                Mark as Sent
              </Button>
            </Popconfirm>
          )}
          {(estimate.status === 'DRAFT' || estimate.status === 'SENT') && (
            <Popconfirm
              title="Approve this estimate?"
              description="This generates the Purchase Order entry and lets you create an invoice from it."
              onConfirm={() => handleStatusChange('APPROVED')}
            >
              <Button type="primary" ghost icon={<CheckCircleOutlined />} loading={statusUpdating}>
                Approve (Generate PO)
              </Button>
            </Popconfirm>
          )}
          <Button
            type="primary" icon={<FilePdfOutlined />}
            loading={downloading} onClick={handleDownloadPdf}
          >
            Download PDF
          </Button>
        </Space>
      </div>

      {/* Info */}
      <Card style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Client">{estimate.clientName}</Descriptions.Item>
          <Descriptions.Item label="Campaign">{estimate.campaignName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Estimate Date">
            {estimate.estimateDate
              ? dayjs(estimate.estimateDate).format('DD MMM YYYY') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="GST Type">{estimate.gstType}</Descriptions.Item>
          <Descriptions.Item label="Notes" span={2}>
            {estimate.notes || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={STATUS_COLORS[estimate.status]}>{estimate.status}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Line Items */}
      <Card title="Line Items" style={{ marginBottom: 16 }}>
        <Table
          dataSource={estimate.lineItems || []}
          columns={lineItemColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Totals */}
      <Card>
        <Row justify="end">
          <Col xs={24} sm={14} md={10}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Subtotal (without GST)</Text>
                <Text>{fmt(subtotal)}</Text>
              </div>

              {estimate.gstType === 'CGST_SGST' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">CGST ({estimate.cgstRate}%)</Text>
                    <Text type="secondary">{fmt(cgstAmount)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">SGST ({estimate.sgstRate}%)</Text>
                    <Text type="secondary">{fmt(sgstAmount)}</Text>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">IGST ({estimate.igstRate}%)</Text>
                  <Text type="secondary">{fmt(igstAmount)}</Text>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Total GST</Text>
                <Text>{fmt(cgstAmount + sgstAmount + igstAmount)}</Text>
              </div>

              <Divider style={{ margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: 16 }}>Grand Total</Text>
                <Text strong style={{ fontSize: 16, color: '#0057FF' }}>
                  {fmt(totalAmount)}
                </Text>
              </div>

            </div>
          </Col>
        </Row>
      </Card>

    </div>
  )
}

export default EstimateDetailPage