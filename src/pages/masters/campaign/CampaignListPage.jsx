import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import DataTable from '../../../components/common/DataTable'
import PageHeader from '../../../components/common/PageHeader'
import { campaignApi } from '../../../api/campaignApi'

const CampaignListPage = () => {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const res = await campaignApi.getCampaigns()
      setCampaigns(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCampaigns() }, [])

  const today = dayjs()

  const columns = [
    { title: 'Campaign Name', dataIndex: 'campaign_name', key: 'campaign_name' },
    { title: 'Client', dataIndex: 'client_name', key: 'client_name', width: 180 },
    { title: 'Start Date', dataIndex: 'start_date', key: 'start_date', width: 120,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'End Date', dataIndex: 'end_date', key: 'end_date', width: 120,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'Status', key: 'status', width: 100,
      render: (_, r) => {
        if (!r.is_active) return <Tag color="default">Inactive</Tag>
        if (today.isBefore(r.start_date)) return <Tag color="blue">Upcoming</Tag>
        if (today.isAfter(r.end_date)) return <Tag color="orange">Ended</Tag>
        return <Tag color="green">Active</Tag>
      }
    },
    { title: 'Actions', key: 'actions', width: 80,
      render: (_, r) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/campaigns/${r.id}/edit`)} />
      ) },
  ]

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Campaigns"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/campaigns/new')}>
            New Campaign
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={campaigns}
        loading={loading}
        onRefresh={fetchCampaigns}
        searchKeys={['campaign_name', 'client_name']}
      />
    </div>
  )
}

export default CampaignListPage