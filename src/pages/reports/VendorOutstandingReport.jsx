import React from 'react'
import { Typography } from 'antd'
import dayjs from 'dayjs'
import { ReportPage } from './ReportBase'

const { Text } = Typography

const columns = [
  {
    title: 'Vendor',
    dataIndex: 'vendor_name',
    key: 'vendor_name',
    width: 180,
  },
  {
    title: 'Booking Ref.',
    dataIndex: 'booking_reference',
    key: 'booking_reference',
    width: 150,
  },
  {
    title: 'Bill Date',
    dataIndex: 'bill_date',
    key: 'bill_date',
    width: 110,
    render: d =>
      d
        ? dayjs(d).format('DD MMM YYYY')
        : '-',
  },
  {
    title: 'Payable (₹)',
    dataIndex: 'payable_amount',
    key: 'payable_amount',
    width: 140,
    align: 'right',
    render: v =>
      v != null
        ? `₹${Number(v).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
          })}`
        : '-',
  },
  {
    title: 'Outstanding (₹)',
    dataIndex: 'outstanding_amount',
    key: 'outstanding_amount',
    width: 150,
    align: 'right',
    render: v =>
      v != null ? (
        <Text style={{ color: '#DC2626' }}>
          ₹
          {Number(v).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
          })}
        </Text>
      ) : (
        '-'
      ),
  },
]

const VendorOutstandingReport = () => (
  <ReportPage
    title="Vendor Outstanding Report"
    columns={columns}
    reportName="vendor-outstanding"
    searchKeys={[
      'vendor_name',
      'booking_reference',
    ]}
  />
)

export default VendorOutstandingReport