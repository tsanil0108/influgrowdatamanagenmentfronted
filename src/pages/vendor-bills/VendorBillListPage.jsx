import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import { vendorBillApi } from '../../api/vendorBillApi'

const STATUS_COLORS = { UNPAID: 'red', PAID: 'green' }

const VendorBillListPage = () => {
  const navigate = useNavigate()
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchBills = async () => {
    setLoading(true)
    try {
      const res = await vendorBillApi.getVendorBills()
      setBills(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBills() }, [])

  const columns = [
    { title: 'Booking Ref.', dataIndex: 'booking_reference', key: 'booking_reference', width: 150 },
    { title: 'Client', dataIndex: 'client_name', key: 'client_name', width: 160 },
    { title: 'Invoice', dataIndex: 'invoice_number', key: 'invoice_number', width: 140 },
    { title: 'Vendor', dataIndex: 'vendor_name', key: 'vendor_name', width: 160 },
    { title: 'Bill Date', dataIndex: 'bill_date', key: 'bill_date', width: 110,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'Amount (₹)', dataIndex: 'amount', key: 'amount', width: 120, align: 'right',
      render: v => v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-' },
    { title: 'GST (₹)', dataIndex: 'gst_amount', key: 'gst_amount', width: 110, align: 'right',
      render: v => v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-' },
    { title: 'Payable (₹)', dataIndex: 'payable_amount', key: 'payable_amount', width: 130, align: 'right',
      render: v => v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-' },
    { title: 'Status', dataIndex: 'payment_status', key: 'payment_status', width: 90,
      render: s => <Tag color={STATUS_COLORS[s] || 'default'}>{s}</Tag> },
  ]

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Vendor Bills"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/vendor-bills/new')}>
            Add Vendor Bill
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={bills}
        loading={loading}
        onRefresh={fetchBills}
        searchKeys={['booking_reference', 'client_name', 'vendor_name', 'invoice_number']}
        scroll={{ x: 1200 }}
      />
    </div>
  )
}

export default VendorBillListPage