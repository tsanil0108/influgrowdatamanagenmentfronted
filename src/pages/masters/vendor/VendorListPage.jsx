import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Space, Tag, Card, Input, Popconfirm, message } from 'antd'
import { EyeOutlined, EditOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons'
import DataTable from '../../../components/common/DataTable'
import PageHeader from '../../../components/common/PageHeader'
import { useVendors } from '../../../hooks/useVendors'
import { deleteVendor } from '../../../api/vendorApi'

const VendorListPage = () => {
  const navigate = useNavigate()
  const { list, loading, loadVendors } = useVendors()
  const [search, setSearch] = useState('')

  useEffect(() => { loadVendors({ page: 0, size: 20 }) }, [])

  const filtered = list.filter(v =>
    !search ||
    v.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
    v.panNumber?.toLowerCase().includes(search.toLowerCase()) ||
    v.contactPerson?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    try {
      await deleteVendor(id)
      message.success('Vendor deleted successfully')
      loadVendors({ page: 0, size: 20 })
    } catch {
      message.error('Failed to delete vendor')
    }
  }

  const columns = [
    { title: 'Vendor Name',  dataIndex: 'vendorName',    key: 'vendorName' },
    { title: 'PAN',          dataIndex: 'panNumber',     key: 'panNumber',     width: 130 },
    { title: 'GST',          dataIndex: 'gstNumber',     key: 'gstNumber',     width: 180 },
    { title: 'Contact',      dataIndex: 'contactPerson', key: 'contactPerson', width: 150 },
    { title: 'Mobile',       dataIndex: 'mobile',        key: 'mobile',        width: 130 },
    { title: 'City',         dataIndex: 'city',          key: 'city',          width: 110 },
    {
      title: 'Status', dataIndex: 'isActive', key: 'isActive', width: 90,
      align: 'center',
      render: v => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag>
    },
    {
      title: 'Actions', key: 'actions', width: 130, align: 'center',
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/vendors/${r.id}`)}
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/vendors/${r.id}/edit`)}
          />
          <Popconfirm
            title="Delete Vendor?"
            description="Are you sure? This action cannot be undone."
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(r.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle="Manage all your vendors"
        onAdd={() => navigate('/vendors/new')}
        addLabel="Add Vendor"
      />
      <Card style={{ borderRadius: 'var(--radius-lg)' }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--color-text-muted)' }} />}
            placeholder="Search vendors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
        />
      </Card>
    </div>
  )
}

export default VendorListPage