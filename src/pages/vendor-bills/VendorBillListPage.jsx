import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, Table, Input, Popconfirm, Tooltip, Space, Switch, App } from 'antd'
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import { vendorBillApi } from '../../api/vendorBillApi'

const STATUS_COLORS = {
  UNPAID:    'red',
  PARTIAL:   'orange',
  PAID:      'green',
  CANCELLED: 'default',
}

const fmt = v => v != null
  ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  : '-'

const VendorBillListPage = () => {
  const { message } = App.useApp()   // ✅ Ant Design v5 fix
  const navigate = useNavigate()
  const [bills,         setBills]         = useState([])
  const [loading,       setLoading]       = useState(false)
  const [search,        setSearch]        = useState('')
  const [showCancelled, setShowCancelled] = useState(false)

  const fetchBills = async () => {
    setLoading(true)
    try {
      const res  = await vendorBillApi.getVendorBills(
        showCancelled ? { includeCancelled: true } : {}
      )
      const list = res.data?.data?.content ?? res.data?.data ?? res.data ?? []
      setBills(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error(err)
      message.error('Failed to load vendor bills')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    // 🔍 DEBUG LOGS — remove once issue is found
    console.log('Deleting id:', id, 'type:', typeof id)
    console.log('deleteVendorBill type:', typeof vendorBillApi.deleteVendorBill)

    try {
      await vendorBillApi.deleteVendorBill(id)
      message.success('Vendor bill cancelled')
      fetchBills()
    } catch (err) {
      console.error('Delete error FULL:', err)
      console.error('message:', err.message)
      console.error('code:', err.code)
      console.error('name:', err.name)
      console.error('stack:', err.stack)
      message.error(err.response?.data?.message || 'Failed to cancel vendor bill')
    }
  }

  useEffect(() => { fetchBills() }, [showCancelled])

  const columns = [
    { title: 'Booking Ref.', dataIndex: 'bookingReference', key: 'bookingReference', width: 150 },
    { title: 'Client',       dataIndex: 'clientName',       key: 'clientName',       width: 160 },
    { title: 'Invoice',      dataIndex: 'invoiceNumber',    key: 'invoiceNumber',    width: 140,
      render: v => v || <span style={{ color: '#aaa' }}>—</span> },
    { title: 'Vendor',       dataIndex: 'vendorName',       key: 'vendorName',       width: 160 },
    { title: 'Bill Date',    dataIndex: 'billDate',         key: 'billDate',         width: 120,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'Amount (₹)',  dataIndex: 'amount',        key: 'amount',        width: 130, align: 'right', render: fmt },
    { title: 'GST (₹)',     dataIndex: 'gstAmount',     key: 'gstAmount',     width: 110, align: 'right', render: fmt },
    { title: 'Payable (₹)', dataIndex: 'payableAmount', key: 'payableAmount', width: 130, align: 'right',
      render: v => <strong>{fmt(v)}</strong> },
    { title: 'Status', dataIndex: 'paymentStatus', key: 'paymentStatus', width: 110,
      render: s => <Tag color={STATUS_COLORS[s] || 'default'}>{s || '-'}</Tag> },
    {
      title: 'Actions', key: 'actions', width: 100, align: 'center', fixed: 'right',
      render: (_, record) => {
        const isCancelled = record.paymentStatus === 'CANCELLED'
        return (
          <Space size={4}>
            <Tooltip title="Edit">
              <Button
                type="text" size="small"
                disabled={isCancelled}
                icon={<EditOutlined style={{ color: isCancelled ? '#ccc' : '#1677ff' }} />}
                onClick={() => navigate(`/vendor-bills/${record.id}/edit`)}
              />
            </Tooltip>

            {!isCancelled && (
              <Popconfirm
                title="Cancel this vendor bill?"
                description="Bill CANCELLED ho jayega. Bank entries safe rahenge."
                onConfirm={() => handleDelete(record.id)}
                okText="Cancel Bill"
                okButtonProps={{ danger: true }}
                cancelText="Back"
              >
                <Tooltip title="Cancel Bill">
                  <Button
                    type="text" size="small"
                    icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                  />
                </Tooltip>
              </Popconfirm>
            )}
          </Space>
        )
      },
    },
  ]

  const filtered = search
    ? bills.filter(b =>
        ['bookingReference', 'clientName', 'vendorName', 'invoiceNumber']
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
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E6F0', display: 'flex', gap: 12, alignItems: 'center' }}>
          <Input
            placeholder="Search by ref, client, vendor..." allowClear
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchBills} loading={loading}>Refresh</Button>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#666' }}>Show Cancelled</span>
            <Switch size="small" checked={showCancelled} onChange={setShowCancelled} />
          </div>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={loading}
          scroll={{ x: 1200 }}
          rowClassName={record =>
            record.paymentStatus === 'CANCELLED' ? 'cancelled-row' : ''
          }
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (t, r) => `${r[0]}-${r[1]} of ${t}`,
          }}
          size="middle"
        />
      </div>

      <style>{`
        .cancelled-row td {
          opacity: 0.45 !important;
          text-decoration: line-through;
          background: #fafafa !important;
        }
        .cancelled-row:hover td {
          background: #f0f0f0 !important;
        }
      `}</style>
    </div>
  )
}

export default VendorBillListPage