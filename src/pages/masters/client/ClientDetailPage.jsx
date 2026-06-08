import React, { useEffect } from 'react'
import { Card, Row, Col, Descriptions, Button, Space, Tag, Divider } from 'antd'
import { EditOutlined, FilePdfOutlined, FileImageOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useClients } from '../../../hooks/useClients'
import PageHeader from '../../../components/common/PageHeader'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { detail, detailLoading, loadClient } = useClients()

  useEffect(() => { loadClient(id) }, [id])

  if (detailLoading) return <LoadingSpinner />
  if (!detail) return null

  const labelStyle = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }
  const valueStyle = { fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-primary)' }

  return (
    <div>
      <PageHeader
        title={detail.clientName}
        subtitle={detail.city ? `${detail.city}, ${detail.state}` : 'Client Profile'}
        backUrl="/clients"
        extra={
          <Button icon={<EditOutlined />} onClick={() => navigate(`/clients/${id}/edit`)}>Edit</Button>
        }
      />

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Client Information</span>} style={{ marginBottom: 16, borderRadius: 'var(--radius-lg)' }}>
            <Descriptions column={{ xs: 1, md: 2 }} size="small" labelStyle={labelStyle} contentStyle={valueStyle}>
              <Descriptions.Item label="Client Name">{detail.clientName}</Descriptions.Item>
              <Descriptions.Item label="Contact Person">{detail.contactPerson || '—'}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{detail.mobile || '—'}</Descriptions.Item>
              <Descriptions.Item label="Email">{detail.email || '—'}</Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>{detail.address || '—'}</Descriptions.Item>
              <Descriptions.Item label="City">{detail.city || '—'}</Descriptions.Item>
              <Descriptions.Item label="State">{detail.state ? `${detail.state} (${detail.stateCode})` : '—'}</Descriptions.Item>
              <Descriptions.Item label="PIN Code">{detail.pinCode || '—'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Tax Information</span>} style={{ borderRadius: 'var(--radius-lg)' }}>
            <Descriptions column={{ xs: 1, md: 2 }} size="small" labelStyle={labelStyle} contentStyle={valueStyle}>
              <Descriptions.Item label="PAN Number">
                {detail.panNumber ? <code style={{ background: 'var(--color-surface-2)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{detail.panNumber}</code> : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="GST Number">
                {detail.gstNumber ? <code style={{ background: 'var(--color-surface-2)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{detail.gstNumber}</code> : '—'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Documents</span>} style={{ borderRadius: 'var(--radius-lg)', marginBottom: 16 }}>
            {detail.documents?.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {detail.documents.map(doc => (
                  <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                      background: 'var(--color-surface-2)', borderRadius: 8,
                      color: 'var(--color-brand)', fontFamily: 'var(--font-body)',
                    }}>
                    {doc.contentType?.includes('pdf') ? <FilePdfOutlined /> : <FileImageOutlined />}
                    <span>{doc.docType} — {doc.fileName}</span>
                  </a>
                ))}
              </Space>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>No documents uploaded</p>
            )}
          </Card>

          <Card style={{ borderRadius: 'var(--radius-lg)' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" icon={<EditOutlined />} block onClick={() => navigate(`/clients/${id}/edit`)} style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                Edit Client
              </Button>
              <Button block onClick={() => navigate('/estimates/new')} style={{ fontFamily: 'var(--font-body)' }}>
                Create Estimate
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}