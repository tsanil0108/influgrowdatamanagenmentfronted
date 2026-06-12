// src/pages/bank-entries/BankEntryListPage.jsx
import React, { useEffect, useState } from 'react'
import { Button, Space, Tag, DatePicker, Select, Popconfirm, Tooltip, App } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import { bankEntryApi } from '../../api/bankEntryApi'

const { RangePicker } = DatePicker
const { Option } = Select

const ENTRY_TYPE_COLORS = { RECEIPT: 'green', PAYMENT: 'red', CONTRA: 'blue' }

const BankEntryListPage = () => {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [entries,    setEntries]    = useState([])
  const [loading,    setLoading]    = useState(false)
  const [typeFilter, setTypeFilter] = useState(null)
  const [dateRange,  setDateRange]  = useState(null)

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const params = {}
      if (typeFilter) params.entryType = typeFilter
      if (dateRange) {
        params.fromDate = dateRange[0].format('YYYY-MM-DD')
        params.toDate   = dateRange[1].format('YYYY-MM-DD')
      }
      const res = await bankEntryApi.getStatement(params)
      // API: { success, message, data: [...] }
      const list = res.data?.data
      setEntries(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('fetchEntries error:', err)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await bankEntryApi.deleteBankEntry(id)
      message.success('Bank entry deleted')
      fetchEntries()
    } catch (err) {
      console.error('Delete error:', err.response?.status, err.response?.data)
      message.error(err.response?.data?.message || 'Failed to delete bank entry')
    }
  }

  useEffect(() => { fetchEntries() }, [typeFilter, dateRange])

  const columns = [
    { title: 'Entry No.', dataIndex: 'entryNumber', key: 'entryNumber', width: 140 },
    { title: 'Type',      dataIndex: 'entryType',   key: 'entryType',   width: 110,
      render: type => <Tag color={ENTRY_TYPE_COLORS[type] || 'default'}>{type}</Tag> },
    { title: 'Date',      dataIndex: 'entryDate',   key: 'entryDate',   width: 120,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'Party',     key: 'party', width: 180,
      render: (_, r) => r.clientName || r.vendorName || '-' },
    { title: 'Bank',      dataIndex: 'bankName',    key: 'bankName',    width: 150 },
    { title: 'Amount (₹)', dataIndex: 'amount',     key: 'amount',      width: 140,
      align: 'right',
      render: v => v != null
        ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        : '-' },
    { title: 'Remarks',   dataIndex: 'remarks',     key: 'remarks',     ellipsis: true },
    {
      title: 'Actions', key: 'actions', width: 90, align: 'center', fixed: 'right',
      render: (_, record) => (
        <Popconfirm
          title="Delete this entry?"
          description="Linked invoice/vendor bill amounts will be adjusted."
          onConfirm={() => handleDelete(record.id)}
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
        >
          <Tooltip title="Delete">
            <Button
              type="text" size="small"
              icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ]

  const extraHeader = (
    <Space wrap>
      <Select allowClear placeholder="Filter by Type" style={{ width: 160 }}
        onChange={setTypeFilter} value={typeFilter}>
        <Option value="RECEIPT">Receipt</Option>
        <Option value="PAYMENT">Payment</Option>
        <Option value="CONTRA">Contra</Option>
      </Select>
      <RangePicker onChange={setDateRange} format="DD/MM/YYYY" />
      <Button type="primary" icon={<PlusOutlined />}
        onClick={() => navigate('/bank-entries/receipt/new')}>Receipt</Button>
      <Button icon={<PlusOutlined />}
        onClick={() => navigate('/bank-entries/payment/new')}>Payment</Button>
      <Button icon={<PlusOutlined />}
        onClick={() => navigate('/bank-entries/contra/new')}>Contra</Button>
    </Space>
  )

  return (
    <div>
      <PageHeader title="Bank Entries" extra={extraHeader} />
      <DataTable
        columns={columns}
        data={entries}
        loading={loading}
        onRefresh={fetchEntries}
        scroll={{ x: 1000 }}
      />
    </div>
  )
}

export default BankEntryListPage