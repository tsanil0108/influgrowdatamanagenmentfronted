import React, { useEffect, useState } from 'react'
import { Button, Space, Tag, DatePicker, Select, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import { bankEntryApi } from '../../api/bankEntryApi'

const { RangePicker } = DatePicker
const { Option } = Select

const ENTRY_TYPE_COLORS = {
  RECEIPT: 'green',
  PAYMENT: 'red',
  CONTRA: 'blue',
}

const BankEntryListPage = () => {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState(null)
  const [dateRange, setDateRange] = useState(null)

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const params = {}
      if (typeFilter) params.entry_type = typeFilter
      if (dateRange) {
        params.from_date = dateRange[0].format('YYYY-MM-DD')
        params.to_date = dateRange[1].format('YYYY-MM-DD')
      }
      const res = await bankEntryApi.getStatement(params)
      setEntries(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEntries() }, [typeFilter, dateRange])

  const columns = [
    { title: 'Entry No.', dataIndex: 'entry_number', key: 'entry_number', width: 130 },
    {
      title: 'Type',
      dataIndex: 'entry_type',
      key: 'entry_type',
      width: 110,
      render: (type) => (
        <Tag color={ENTRY_TYPE_COLORS[type] || 'default'}>{type}</Tag>
      ),
    },
    { title: 'Date', dataIndex: 'entry_date', key: 'entry_date', width: 110,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'Party', key: 'party', width: 160,
      render: (_, r) => r.client_name || r.vendor_name || '-' },
    { title: 'Bank', dataIndex: 'bank_name', key: 'bank_name', width: 150 },
    { title: 'Amount (₹)', dataIndex: 'amount', key: 'amount', width: 130,
      align: 'right',
      render: v => v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-' },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', ellipsis: true },
  ]

  const extraHeader = (
    <Space wrap>
      <Select
        allowClear
        placeholder="Filter by Type"
        style={{ width: 160 }}
        onChange={setTypeFilter}
        value={typeFilter}
      >
        <Option value="RECEIPT">Receipt</Option>
        <Option value="PAYMENT">Payment</Option>
        <Option value="CONTRA">Contra</Option>
      </Select>
      <RangePicker
        onChange={setDateRange}
        format="DD/MM/YYYY"
      />
      <Button type="primary" icon={<PlusOutlined />}
        onClick={() => navigate('/bank-entries/receipt/new')}>
        Receipt
      </Button>
      <Button onClick={() => navigate('/bank-entries/payment/new')}
        icon={<PlusOutlined />}>
        Payment
      </Button>
      <Button onClick={() => navigate('/bank-entries/contra/new')}
        icon={<PlusOutlined />}>
        Contra
      </Button>
    </Space>
  )

  return (
    <div style={{ padding: 24 }}>
      <PageHeader title="Bank Entries" />
      <DataTable
        columns={columns}
        data={entries}
        loading={loading}
        onRefresh={fetchEntries}
        scroll={{ x: 900 }}
        extraHeader={extraHeader}
      />
    </div>
  )
}

export default BankEntryListPage