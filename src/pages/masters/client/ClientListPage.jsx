import React, { useEffect, useState } from 'react'
import { Card, Input, Space, Button, Tooltip } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useClients } from '../../../hooks/useClients'
import PageHeader from '../../../components/common/PageHeader'
import DataTable from '../../../components/common/DataTable'
import StatusBadge from '../../../components/common/StatusBadge'
import { confirmDelete } from '../../../components/common/ConfirmModal'
import { PAGE_SIZE } from '../../../utils/constants'

export default function ClientListPage() {
  const navigate = useNavigate()
  const { list, loading, loadClients, removeClient } = useClients()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadClients({ page: page - 1, size: PAGE_SIZE, search })
  }, [page, search])

  const handleDelete = (id, name) => {
    confirmDelete(async () => {
      const ok = await removeClient(id)
      if (ok) loadClients({ page: page - 1, size: PAGE_SIZE, search })
    }, name)
  }

  const columns = [
    {
      title: 'Client Name',
      dataIndex: 'clientName',
      key: 'name',
      render: (text, row) => (
        <a onClick={() => navigate(`/clients/${row.id}`)} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-brand)' }}>
          {text}
        </a>
      ),
    },
    { title: 'City', dataIndex: 'city', key: 'city', render: v => v || '—' },
    { title: 'State', dataIndex: 'state', key: 'state', render: v => v || '—' },
    { title: 'GST Number', dataIndex: 'gstNumber', key: 'gst', render: v => v ? <code style={{ fontSize: 12 }}>{v}</code> : '—' },
    { title: 'Contact', dataIndex: 'contactPerson', key: 'contact', render: v => v || '—' },
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile', render: v => v || '—' },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: v => <StatusBadge status={v ? 'APPROVED' : 'CANCELLED'} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, row) => (
        <Space size={4}>
          <Tooltip title="View">
            <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/clients/${row.id}`)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/clients/${row.id}/edit`)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(row.id, row.clientName)} />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle="Manage all your client profiles"
        onAdd={() => navigate('/clients/new')}
        addLabel="Add Client"
      />
      <Card style={{ borderRadius: 'var(--radius-lg)' }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--color-text-muted)' }} />}
            placeholder="Search by name, city, GST..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ width: 300 }}
            allowClear
          />
        </div>
        <DataTable
          columns={columns}
          data={list}
          loading={loading}
          pageSize={PAGE_SIZE}
        />
      </Card>
    </div>
  )
}