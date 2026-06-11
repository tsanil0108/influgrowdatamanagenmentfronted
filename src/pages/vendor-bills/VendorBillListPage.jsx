import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, Table, Input, message } from 'antd'
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import { vendorBillApi } from '../../api/vendorBillApi'

const STATUS_COLORS = { UNPAID: 'red', PARTIAL: 'orange', PAID: 'green' }
const fmt = v => v != null
  ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  : '-'

const COLUMNS = [
  { title: 'Booking Ref.',  dataIndex: 'bookingReference', key: 'bookingReference', width: 150 },
  { title: 'Client',        dataIndex: 'clientName',       key: 'clientName',       width: 160 },
  { title: 'Invoice',       dataIndex: 'invoiceNumber',    key: 'invoiceNumber',    width: 140 },
  { title: 'Vendor',        dataIndex: 'vendorName',       key: 'vendorName',       width: 160 },
  { title: 'Bill Date', dataIndex: 'billDate', key: 'billDate', width: 120,
    render: d => d ? dayjs(d).format('DD MMM YYYY') : '-' },
  { title: 'Amount (₹)',   dataIndex: 'amount',        key: 'amount',        width: 130, align: 'right', render: fmt },
  { title: 'GST (₹)',      dataIndex: 'gstAmount',     key: 'gstAmount',     width: 110, align: 'right', render: fmt },
  { title: 'Payable (₹)',  dataIndex: 'payableAmount', key: 'payableAmount', width: 130, align: 'right', render: fmt },
  { title: 'Status', dataIndex: 'paymentStatus', key: 'paymentStatus', width: 100,
    render: s => <Tag color={STATUS_COLORS[s] || 'default'}>{s || '-'}</Tag> },
]

const VendorBillListPage = () => {
  const navigate = useNavigate()
  const [bills,   setBills]   = useState([])
  const [loading, setLoading] = useState(false)
  const [search,  setSearch]  = useState('')

  const fetchBills = async () => {
    setLoading(true)
    try {
      const res  = await vendorBillApi.getVendorBills()
      const list = res.data?.data?.content ?? res.data?.data ?? res.data ?? []
      setBills(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error(err)
      message.error('Failed to load vendor bills')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBills() }, [])

  const filtered = search
    ? bills.filter(b =>
        ['bookingReference','clientName','vendorName','invoiceNumber']
          .some(k => String(b[k] || '').toLowerCase().includes(search.toLowerCase()))
      )
    : bills

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Vendor Bills"
        extra={
          <Button type="primary" icon={<PlusOutlined />}
            onClick={() => navigate('/vendor-bills/new')}>
            Add Vendor Bill
          </Button>
        }
      />
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E2E6F0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E6F0', display: 'flex', gap: 12 }}>
          <Input
            placeholder="Search..." allowClear
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchBills} loading={loading}>Refresh</Button>
        </div>
        <Table
          rowKey="id"
          columns={COLUMNS}
          dataSource={filtered}
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showSizeChanger: true,
            showTotal: (t, r) => `${r[0]}-${r[1]} of ${t}` }}
          size="middle"
        />
      </div>
    </div>
  )
}

export default VendorBillListPage