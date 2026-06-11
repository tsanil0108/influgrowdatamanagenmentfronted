import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, Card, Input, Space, Popconfirm, message } from 'antd'
import { EditOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import DataTable from '../../../components/common/DataTable'
import PageHeader from '../../../components/common/PageHeader'
import { useCampaigns } from '../../../hooks/useCampaigns'
import { deleteCampaign } from '../../../api/campaignApi'

const CampaignListPage = () => {
  const navigate = useNavigate()
  const { list, loading, loadCampaigns } = useCampaigns()
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCampaigns({ page: 0, size: 20 })
  }, [])

  const today = dayjs()

  const filtered = list.filter(c =>
    !search ||
    c.campaignName?.toLowerCase().includes(search.toLowerCase()) ||
    c.clientName?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    try {
      await deleteCampaign(id)
      message.success('Campaign deleted successfully')
      loadCampaigns({ page: 0, size: 20 })
    } catch {
      message.error('Failed to delete campaign')
    }
  }

  const columns = [
    { title: 'Campaign Name', dataIndex: 'campaignName', key: 'campaignName' },
    { title: 'Client',        dataIndex: 'clientName',   key: 'clientName',   width: 180 },
    { title: 'Start Date',    dataIndex: 'startDate',    key: 'startDate',    width: 120,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'End Date',      dataIndex: 'endDate',      key: 'endDate',      width: 120,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    {
      title: 'Status', key: 'status', width: 100,
      render: (_, r) => {
        if (!r.isActive)                 return <Tag color="default">Inactive</Tag>
        if (today.isBefore(r.startDate)) return <Tag color="blue">Upcoming</Tag>
        if (today.isAfter(r.endDate))    return <Tag color="orange">Ended</Tag>
        return                                  <Tag color="green">Active</Tag>
      }
    },
    {
      title: 'Actions', key: 'actions', width: 110, align: 'center',
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/campaigns/${r.id}/edit`)}
          />
          <Popconfirm
            title="Delete Campaign?"
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
        title="Campaigns"
        subtitle="Manage all campaigns"
        onAdd={() => navigate('/campaigns/new')}
        addLabel="New Campaign"
      />
      <Card style={{ borderRadius: 'var(--radius-lg)' }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--color-text-muted)' }} />}
            placeholder="Search campaigns..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </Card>
    </div>
  )
}

export default CampaignListPage