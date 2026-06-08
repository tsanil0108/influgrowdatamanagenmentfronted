import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, Space } from 'antd'
import { PlusOutlined, EyeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import { invoiceApi } from '../../api/invoiceApi'

const STATUS_COLORS = { UNPAID: 'red', PARTIAL: 'orange', PAID: 'green' }

const InvoiceListPage = () => {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const res = await invoiceApi.getInvoices()
      setInvoices(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInvoices() }, [])

  const columns = [
    { title: 'Invoice No.', dataIndex: 'invoice_number', key: 'invoice_number', width: 140 },
    { title: 'Client', dataIndex: 'client_name', key: 'client_name', width: 180 },
    { title: 'Campaign', dataIndex: 'campaign_name', key: 'campaign_name', width: 180, ellipsis: true },
    { title: 'Invoice Date', dataIndex: 'invoice_date', key: 'invoice_date', width: 120,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'Due Date', dataIndex: 'due_date', key: 'due_date', width: 110,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'Amount (₹)', dataIndex: 'total_amount', key: 'total_amount', width: 140, align: 'right',
      render: v => v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100,
      render: s => <Tag color={STATUS_COLORS[s] || 'default'}>{s}</Tag> },
    { title: 'Actions', key: 'actions', width: 80, fixed: 'right',
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/invoices/${r.id}`)} />
      ) },
  ]

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Invoices"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/invoices/new')}>
            New Invoice
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        onRefresh={fetchInvoices}
        searchKeys={['invoice_number', 'client_name', 'campaign_name']}
        scroll={{ x: 1000 }}
      />
    </div>
  )
}

export default InvoiceListPage