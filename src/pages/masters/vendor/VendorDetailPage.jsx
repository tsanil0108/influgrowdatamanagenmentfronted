import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Descriptions, Space, Spin, Tag, Typography, message, List } from 'antd'
import { EditOutlined, ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons'
import { vendorApi } from '../../../api/vendorApi'

const { Title } = Typography

const VendorDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vendorApi.getVendorById(id)
      .then(r => setVendor(r.data?.data))
      .catch(() => message.error('Failed to load vendor'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!vendor) return <div style={{ padding: 24 }}>Vendor not found.</div>

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/vendors')} />
          <Title level={4} style={{ margin: 0 }}>{vendor.vendorName}</Title>
          <Tag color={vendor.isActive ? 'green' : 'default'}>{vendor.isActive ? 'Active' : 'Inactive'}</Tag>
        </Space>
        <Button icon={<EditOutlined />} onClick={() => navigate(`/vendors/${id}/edit`)}>Edit</Button>
      </div>

      <Card title="Basic Information" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Vendor Name">{vendor.vendorName}</Descriptions.Item>
          <Descriptions.Item label="Contact Person">{vendor.contactPerson || '-'}</Descriptions.Item>
          <Descriptions.Item label="Mobile">{vendor.mobile || '-'}</Descriptions.Item>
          <Descriptions.Item label="Email">{vendor.email || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Address" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Address" span={2}>{vendor.address || '-'}</Descriptions.Item>
          <Descriptions.Item label="City">{vendor.city || '-'}</Descriptions.Item>
          <Descriptions.Item label="State">{vendor.state || '-'}</Descriptions.Item>
          <Descriptions.Item label="PIN Code">{vendor.pinCode || '-'}</Descriptions.Item>
          <Descriptions.Item label="State Code">{vendor.stateCode || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Tax & Banking" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="PAN Number">{vendor.panNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="GST Number">{vendor.gstNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="Bank Name">{vendor.bankName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Account Number">{vendor.accountNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="IFSC Code">{vendor.ifscCode || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {vendor.documents?.length > 0 && (
        <Card title="Documents">
          <List
            dataSource={vendor.documents}
            renderItem={doc => (
              <List.Item
                actions={[
                  <Button key="dl" size="small" icon={<DownloadOutlined />}
                    href={doc.fileUrl} target="_blank">
                    Download
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={doc.fileName}
                  description={`${doc.docType} • ${doc.contentType}`}
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  )
}

export default VendorDetailPage