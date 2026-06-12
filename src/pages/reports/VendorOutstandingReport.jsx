import React from 'react'
import { Typography, Tag } from 'antd'
import { ReportPage } from './ReportBase'

const { Text } = Typography

const columns = [
  { title: 'Sr.', dataIndex: 'sr', key: 'sr', width: 60 },
  { title: 'Booking Ref.', dataIndex: 'booking_reference', key: 'booking_reference', width: 150 },
  { title: 'Bill Date', dataIndex: 'bill_date', key: 'bill_date', width: 120 },
  { title: 'Vendor', dataIndex: 'vendor_name', key: 'vendor_name', width: 180 },
  { title: 'Invoice No.', dataIndex: 'invoice_number', key: 'invoice_number', width: 140 },
  {
    title: 'Payable (₹)',
    dataIndex: 'payable_amount',
    key: 'payable_amount',
    width: 140,
    align: 'right',
    render: v => v && v !== '-'
      ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      : '-',
  },
  {
    title: 'Payment Status',
    dataIndex: 'payment_status',
    key: 'payment_status',
    width: 130,
    align: 'center',
    render: v => {
      const map = {
        UNPAID:   { color: 'red',    label: 'Unpaid' },
        PAID:     { color: 'green',  label: 'Paid' },
        PARTIAL:  { color: 'orange', label: 'Partial' },
      }
      const cfg = map[v] || { color: 'default', label: v || '-' }
      return <Tag color={cfg.color}>{cfg.label}</Tag>
    },
  },
]

const VendorOutstandingReport = () => (
  <ReportPage
    title="Vendor Outstanding Report"
    columns={columns}
    reportName="vendor-outstanding"
    searchKeys={['vendor_name', 'booking_reference', 'invoice_number']}
  />
)

export default VendorOutstandingReport