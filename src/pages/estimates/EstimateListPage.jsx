// src/pages/estimates/EstimateListPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, Space, Popconfirm, App } from 'antd'
import { EyeOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import { useEstimates } from '../../hooks/useEstimates'
import { estimateApi } from '../../api/estimateApi'

const STATUS_COLORS = {
  DRAFT:     'default',
  SENT:      'blue',
  APPROVED:  'green',
  CANCELLED: 'red',
}

const EstimateListPage = () => {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { list, loading, loadEstimates, removeEstimate } = useEstimates()

  // ✅ CANCELLED estimates hide karo — invoice linked hone ki wajah se soft delete hote hain
  const estimates = list.filter(e => e.status !== 'CANCELLED')

  useEffect(() => {
    loadEstimates({ page: 0, size: 100 })
  }, [])

  const handleDelete = async (id) => {
    await removeEstimate(id)
  }

  // ✅ NEW: quick-approve from the list, so an estimate doesn't have to stay
  // stuck on DRAFT just because nobody opened the detail page to change it.
  const handleApprove = async (id) => {
    try {
      await estimateApi.updateEstimateStatus(id, 'APPROVED')
      message.success('Estimate approved — now shows on the Purchase Order report')
      loadEstimates({ page: 0, size: 100 })
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to approve estimate')
    }
  }

  const columns = [
    {
      title:     'Estimate No.',
      dataIndex: 'estimateNumber',
      key:       'estimateNumber',
      width:     150,
    },
    {
      title:     'Client',
      dataIndex: 'clientName',
      key:       'clientName',
      width:     200,
    },
    {
      title:     'Campaign',
      dataIndex: 'campaignName',
      key:       'campaignName',
      width:     180,
      ellipsis:  true,
      render:    v => v || '-',
    },
    {
      title:     'Date',
      dataIndex: 'estimateDate',
      key:       'estimateDate',
      width:     120,
      render:    d => d ? dayjs(d).format('DD MMM YYYY') : '-',
    },
    {
      title:     'Total (₹)',
      dataIndex: 'totalAmount',
      key:       'totalAmount',
      width:     150,
      align:     'right',
      render:    v => v != null
        ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        : '-',
    },
    {
      title:     'Status',
      dataIndex: 'status',
      key:       'status',
      width:     130,
      render:    s => <Tag color={STATUS_COLORS[s] || 'default'}>{s}</Tag>,
    },
    {
      title:  'Actions',
      key:    'actions',
      width:  130,
      align:  'center',
      fixed:  'right',
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/estimates/${r.id}`)}
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            disabled={r.status !== 'DRAFT'}
            onClick={() => navigate(`/estimates/${r.id}/edit`)}
          />
          {(r.status === 'DRAFT' || r.status === 'SENT') && (
            <Popconfirm
              title="Approve estimate?"
              description="Generates the Purchase Order entry."
              onConfirm={() => handleApprove(r.id)}
            >
              <Button size="small" icon={<CheckCircleOutlined />} />
            </Popconfirm>
          )}
          <Popconfirm
            title="Delete Estimate?"
            description="Are you sure? This cannot be undone."
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(r.id)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Estimates"
        subtitle="Manage all estimates"
        onAdd={() => navigate('/estimates/new')}
        addLabel="New Estimate"
      />
      <DataTable
        columns={columns}
        data={estimates}
        loading={loading}
        onRefresh={() => loadEstimates({ page: 0, size: 100 })}
        searchKeys={['estimateNumber', 'clientName', 'campaignName']}
        scroll={{ x: 950 }}
      />
    </div>
  )
}

export default EstimateListPage