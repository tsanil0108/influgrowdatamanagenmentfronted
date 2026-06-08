import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Space, Tag } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import DataTable from '../../../components/common/DataTable'
import PageHeader from '../../../components/common/PageHeader'
import { vendorApi } from '../../../api/vendorApi'

const VendorListPage = () => {
  const navigate = useNavigate()
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const res = await vendorApi.getVendors()
      setVendors(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVendors() }, [])

  const columns = [
    { title: 'Vendor Name', dataIndex: 'vendor_name', key: 'vendor_name' },
    { title: 'PAN', dataIndex: 'pan_number', key: 'pan_number', width: 130 },
    { title: 'GST', dataIndex: 'gst_number', key: 'gst_number', width: 180 },
    { title: 'Contact', dataIndex: 'contact_person', key: 'contact_person', width: 150 },
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile', width: 130 },
    { title: 'City', dataIndex: 'city', key: 'city', width: 110 },
    { title: 'Status', dataIndex: 'is_active', key: 'is_active', width: 90,
      render: v => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag> },
    { title: 'Actions', key: 'actions', width: 100, fixed: 'right',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/vendors/${r.id}`)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/vendors/${r.id}/edit`)} />
        </Space>
      ) },
  ]

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Vendors"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/vendors/new')}>
            Add Vendor
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={vendors}
        loading={loading}
        onRefresh={fetchVendors}
        searchKeys={['vendor_name', 'pan_number', 'contact_person']}
        scroll={{ x: 1000 }}
      />
    </div>
  )
}

export default VendorListPage