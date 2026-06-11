// src/pages/invoices/InvoiceListPage.jsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, Space, Popconfirm } from 'antd'
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import { useInvoices } from '../../hooks/useInvoices'

const STATUS_COLORS = { UNPAID: 'red', PARTIAL: 'orange', PAID: 'green' }

const InvoiceListPage = () => {
  const navigate = useNavigate()
  const { list, loading, loadInvoices, removeInvoice } = useInvoices()

  useEffect(() => {
    loadInvoices({ page: 0, size: 100 })
  }, [loadInvoices])

  const columns = [
    {
      title: 'Invoice No.',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 150
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
      width: 180
    },
    {
      title: 'Campaign',
      dataIndex: 'campaignName',
      key: 'campaignName',
      width: 160,
      ellipsis: true,
      render: v => v || '-'
    },
    {
      title: 'Invoice Date',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 120,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-'
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 110,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-'
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      render: v => v != null
        ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        : '-'
    },
    {
      title: 'Paid (₹)',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 130,
      align: 'right',
      render: v => v != null
        ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        : '₹0.00'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: s => <Tag color={STATUS_COLORS[s] || 'default'}>{s}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/invoices/${r.id}`)
            }}
          />
          <Popconfirm
            title="Delete Invoice?"
            description="Are you sure? This cannot be undone."
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={(e) => {
              e?.stopPropagation()
              removeInvoice(r.id)
            }}
            onCancel={(e) => e?.stopPropagation()}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Manage all invoices"
        onAdd={() => navigate('/invoices/new')}
        addLabel="New Invoice"
      />
      <DataTable
        columns={columns}
        data={list}
        loading={loading}
        onRefresh={() => loadInvoices({ page: 0, size: 100 })}
        searchKeys={['invoiceNumber', 'clientName', 'campaignName']}
        scroll={{ x: 1100 }}
      />
    </div>
  )
}

export default InvoiceListPage