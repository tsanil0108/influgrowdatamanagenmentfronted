import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Descriptions, Button, Space, Modal } from 'antd'
import { EditOutlined, FilePdfOutlined, FileImageOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useClients } from '../../../hooks/useClients'
import PageHeader from '../../../components/common/PageHeader'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { getDocUrl } from '../../../utils/fileUtils'

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { detail, detailLoading, loadClient } = useClients()
  const [previewDoc, setPreviewDoc] = useState(null)

  useEffect(() => { loadClient(id) }, [id])

  if (detailLoading) return <LoadingSpinner />
  if (!detail) return null

  const labelStyle = {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 12,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  }
  const valueStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: 'var(--color-text-primary)',
  }

  const isPdf = (doc) => doc.contentType?.includes('pdf') || doc.fileName?.endsWith('.pdf')
  const isImage = (doc) => doc.contentType?.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.fileName)

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
          <Card
            title={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Client Information</span>}
            style={{ marginBottom: 16, borderRadius: 'var(--radius-lg)' }}
          >
            <Descriptions column={{ xs: 1, md: 2 }} size="small" labelStyle={labelStyle} contentStyle={valueStyle}>
              <Descriptions.Item label="Client Name">{detail.clientName}</Descriptions.Item>
              <Descriptions.Item label="Contact Person">{detail.contactPerson || '—'}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{detail.mobile || '—'}</Descriptions.Item>
              <Descriptions.Item label="Email">{detail.email || '—'}</Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>{detail.address || '—'}</Descriptions.Item>
              <Descriptions.Item label="City">{detail.city || '—'}</Descriptions.Item>
              <Descriptions.Item label="State">
                {detail.state ? `${detail.state} (${detail.stateCode})` : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="PIN Code">{detail.pinCode || '—'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Tax Information</span>}
            style={{ borderRadius: 'var(--radius-lg)' }}
          >
            <Descriptions column={{ xs: 1, md: 2 }} size="small" labelStyle={labelStyle} contentStyle={valueStyle}>
              <Descriptions.Item label="PAN Number">
                {detail.panNumber
                  ? <code style={{ background: 'var(--color-surface-2)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{detail.panNumber}</code>
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="GST Number">
                {detail.gstNumber
                  ? <code style={{ background: 'var(--color-surface-2)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{detail.gstNumber}</code>
                  : '—'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Documents</span>}
            style={{ borderRadius: 'var(--radius-lg)', marginBottom: 16 }}
          >
            {detail.documents?.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {detail.documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--color-surface-2)',
                      borderRadius: 8,
                      border: '1px solid #e2e6f0',
                    }}
                  >
                    {/* Left: icon + name */}
                    <Space size={8} style={{ flex: 1, minWidth: 0 }}>
                      {isPdf(doc) ? (
                        <FilePdfOutlined style={{ color: '#e53935', fontSize: 18 }} />
                      ) : (
                        <FileImageOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#1677ff', textTransform: 'uppercase' }}>
                          {doc.docType}
                        </div>
                        <div style={{
                          fontSize: 12, color: '#555',
                          maxWidth: 130,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {doc.fileName}
                        </div>
                      </div>
                    </Space>

                    {/* Right: View + Download buttons */}
                    <Space size={4}>
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => setPreviewDoc(doc)}
                        title="View"
                        style={{ color: '#1677ff' }}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<DownloadOutlined />}
                        href={getDocUrl(doc.downloadUrl)}
                        target="_blank"
                        rel="noreferrer"
                        title="Download"
                        style={{ color: '#555' }}
                      />
                    </Space>
                  </div>
                ))}
              </Space>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>
                No documents uploaded
              </p>
            )}
          </Card>

          <Card style={{ borderRadius: 'var(--radius-lg)' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                block
                onClick={() => navigate(`/clients/${id}/edit`)}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
              >
                Edit Client
              </Button>
              <Button
                block
                onClick={() => navigate('/estimates/new')}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Create Estimate
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal
        open={!!previewDoc}
        onCancel={() => setPreviewDoc(null)}
        title={
          <Space>
            {previewDoc && isPdf(previewDoc) ? <FilePdfOutlined style={{ color: '#e53935' }} /> : <FileImageOutlined style={{ color: '#1677ff' }} />}
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              {previewDoc?.docType} — {previewDoc?.fileName}
            </span>
          </Space>
        }
        footer={[
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            href={getDocUrl(previewDoc?.downloadUrl)}
            target="_blank"
          >
            Download
          </Button>,
          <Button key="close" onClick={() => setPreviewDoc(null)}>
            Close
          </Button>,
        ]}
        width="80%"
        style={{ top: 20 }}
      >
        {previewDoc && isPdf(previewDoc) && (
          <iframe
            src={getDocUrl(previewDoc.downloadUrl)}
            style={{ width: '100%', height: '75vh', border: 'none' }}
            title={previewDoc.fileName}
          />
        )}
        {previewDoc && isImage(previewDoc) && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={getDocUrl(previewDoc.downloadUrl)}
              alt={previewDoc.fileName}
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}