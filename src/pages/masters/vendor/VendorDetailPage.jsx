// src/pages/masters/vendor/VendorDetailPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Descriptions, Space, Spin, Tag, Typography, message, Modal } from 'antd'
import { EditOutlined, ArrowLeftOutlined, EyeOutlined, DownloadOutlined, FilePdfOutlined, FileImageOutlined } from '@ant-design/icons'
import { vendorApi } from '../../../api/vendorApi'
import { getDocUrl } from '../../../utils/fileUtils'

const { Title } = Typography

const VendorDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewDoc, setPreviewDoc] = useState(null)

  useEffect(() => {
    vendorApi.getVendorById(id)
      .then(r => setVendor(r.data?.data))
      .catch(() => message.error('Failed to load vendor'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!vendor) return <div style={{ padding: 24 }}>Vendor not found.</div>

  const isPdf = (doc) => doc.contentType?.includes('pdf') || doc.fileName?.endsWith('.pdf')
  const isImage = (doc) => doc.contentType?.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.fileName)

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/vendors')} />
          <Title level={4} style={{ margin: 0 }}>{vendor.vendorName}</Title>
          <Tag color="blue" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
            {vendor.vendorCode}
          </Tag>
          <Tag color={vendor.isActive ? 'green' : 'default'}>
            {vendor.isActive ? 'Active' : 'Inactive'}
          </Tag>
        </Space>
        <Button icon={<EditOutlined />} onClick={() => navigate(`/vendors/${id}/edit`)}>Edit</Button>
      </div>

      {/* Basic Info */}
      <Card title="Basic Information" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Vendor Code">
            <Tag color="blue" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
              {vendor.vendorCode}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Vendor Name">{vendor.vendorName}</Descriptions.Item>
          <Descriptions.Item label="Contact Person">{vendor.contactPerson || '-'}</Descriptions.Item>
          <Descriptions.Item label="Mobile">{vendor.mobile || '-'}</Descriptions.Item>
          <Descriptions.Item label="Email">{vendor.email || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Address */}
      <Card title="Address" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Address" span={2}>{vendor.address || '-'}</Descriptions.Item>
          <Descriptions.Item label="City">{vendor.city || '-'}</Descriptions.Item>
          <Descriptions.Item label="State">{vendor.state || '-'}</Descriptions.Item>
          <Descriptions.Item label="PIN Code">{vendor.pinCode || '-'}</Descriptions.Item>
          <Descriptions.Item label="State Code">{vendor.stateCode || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Tax & Banking */}
      <Card title="Tax & Banking" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="PAN Number">{vendor.panNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="GST Number">{vendor.gstNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="Bank Name">{vendor.bankName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Account Number">{vendor.accountNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="IFSC Code">{vendor.ifscCode || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Documents */}
      <Card title="Documents" style={{ marginBottom: 16 }}>
        {vendor.documents?.length > 0 ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            {vendor.documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: '#f6f8fa',
                  borderRadius: 8,
                  border: '1px solid #e2e6f0',
                }}
              >
                <Space size={8}>
                  {isPdf(doc)
                    ? <FilePdfOutlined style={{ color: '#e53935', fontSize: 18 }} />
                    : <FileImageOutlined style={{ color: '#1677ff', fontSize: 18 }} />}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#1677ff', textTransform: 'uppercase' }}>
                      {doc.docType}
                    </div>
                    <div style={{ fontSize: 12, color: '#555', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.fileName}
                    </div>
                  </div>
                </Space>
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
                    title="Download"
                    style={{ color: '#555' }}
                  />
                </Space>
              </div>
            ))}
          </Space>
        ) : (
          <p style={{ color: '#aaa', textAlign: 'center', padding: '20px 0' }}>
            No documents uploaded
          </p>
        )}
      </Card>

      {/* Preview Modal */}
      <Modal
        open={!!previewDoc}
        onCancel={() => setPreviewDoc(null)}
        title={
          <Space>
            {previewDoc && isPdf(previewDoc)
              ? <FilePdfOutlined style={{ color: '#e53935' }} />
              : <FileImageOutlined style={{ color: '#1677ff' }} />}
            <span>{previewDoc?.docType} — {previewDoc?.fileName}</span>
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

export default VendorDetailPage