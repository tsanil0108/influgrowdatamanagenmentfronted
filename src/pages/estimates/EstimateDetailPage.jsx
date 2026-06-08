import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Col, Descriptions, Divider, Row, Space, Spin, Table, Tag, Typography, message } from 'antd'
import { EditOutlined, FilePdfOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { estimateApi } from '../../api/estimateApi'

const { Title, Text } = Typography

const STATUS_COLORS = { DRAFT: 'default', SENT: 'blue', APPROVED: 'green', CANCELLED: 'red' }

const EstimateDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [estimate, setEstimate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    estimateApi.getEstimateById(id)
      .then(r => setEstimate(r.data))
      .catch(() => message.error('Failed to load estimate'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      await estimateApi.downloadEstimatePdf(id)
    } catch {
      message.error('PDF download failed')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!estimate) return <div style={{ padding: 24 }}>Estimate not found.</div>

  const lineItemColumns = [
    { title: '#', key: 'index', width: 50, render: (_, __, i) => i + 1 },
    { title: 'Activity', dataIndex: 'activity_name', key: 'activity_name' },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Amount (₹)', dataIndex: 'amount', key: 'amount', align: 'right',
      render: v => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/estimates')} />
          <Title level={4} style={{ margin: 0 }}>{estimate.estimate_number}</Title>
          <Tag color={STATUS_COLORS[estimate.status]}>{estimate.status}</Tag>
        </Space>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/estimates/${id}/edit`)}>Edit</Button>
          <Button type="primary" icon={<FilePdfOutlined />} loading={downloading} onClick={handleDownloadPdf}>
            Download PDF
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Client">{estimate.client_name}</Descriptions.Item>
          <Descriptions.Item label="Campaign">{estimate.campaign_name}</Descriptions.Item>
          <Descriptions.Item label="Estimate Date">
            {estimate.estimate_date ? dayjs(estimate.estimate_date).format('DD MMM YYYY') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="GST Type">{estimate.gst_type}</Descriptions.Item>
          <Descriptions.Item label="Created By">{estimate.created_by_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={STATUS_COLORS[estimate.status]}>{estimate.status}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Line Items" style={{ marginBottom: 16 }}>
        <Table
          dataSource={estimate.line_items || []}
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
                <Text>₹{Number(estimate.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
              </div>
              {estimate.gst_type === 'CGST_SGST' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>CGST ({estimate.cgst_rate}%)</Text>
                    <Text>₹{Number(estimate.cgst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>SGST ({estimate.sgst_rate}%)</Text>
                    <Text>₹{Number(estimate.sgst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>IGST ({estimate.igst_rate}%)</Text>
                  <Text>₹{Number(estimate.igst_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </div>
              )}
              <Divider style={{ margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: 16 }}>Total</Text>
                <Text strong style={{ fontSize: 16, color: '#0057FF' }}>
                  ₹{Number(estimate.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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