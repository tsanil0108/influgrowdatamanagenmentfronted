import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, Space, Dropdown } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import { estimateApi } from '../../api/estimateApi'

const STATUS_COLORS = {
  DRAFT: 'default',
  SENT: 'blue',
  APPROVED: 'green',
  CANCELLED: 'red',
}

const EstimateListPage = () => {
  const navigate = useNavigate()
  const [estimates, setEstimates] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchEstimates = async () => {
    setLoading(true)
    try {
      const res = await estimateApi.getEstimates()
      setEstimates(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEstimates() }, [])

  const columns = [
    { title: 'Estimate No.', dataIndex: 'estimate_number', key: 'estimate_number', width: 140 },
    { title: 'Client', dataIndex: 'client_name', key: 'client_name', width: 180 },
    { title: 'Campaign', dataIndex: 'campaign_name', key: 'campaign_name', width: 180, ellipsis: true },
    { title: 'Date', dataIndex: 'estimate_date', key: 'estimate_date', width: 110,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'Total (₹)', dataIndex: 'total_amount', key: 'total_amount', width: 130, align: 'right',
      render: v => v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 110,
      render: s => <Tag color={STATUS_COLORS[s] || 'default'}>{s}</Tag> },
    {
      title: 'Actions', key: 'actions', width: 100, fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/estimates/${record.id}`)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/estimates/${record.id}/edit`)} />
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Estimates"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/estimates/new')}>
            New Estimate
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={estimates}
        loading={loading}
        onRefresh={fetchEstimates}
        searchKeys={['estimate_number', 'client_name', 'campaign_name']}
        scroll={{ x: 950 }}
      />
    </div>
  )
}

export default EstimateListPage