import React from 'react'
import { Tag } from 'antd'
import { ReportPage, formatDate, formatINR } from './ReportBase'

const STATUS_COLORS = {
  UNPAID: 'red',
  PARTIAL: 'orange',
  PAID: 'green',
  CANCELLED: 'default',
}

const columns = [
  {
    title: 'Booking Ref.',
    dataIndex: 'booking_reference',
    key: 'booking_reference',
    width: 150,
  },
  {
    title: 'Vendor Name',
    dataIndex: 'vendor_name',
    key: 'vendor_name',
    width: 200,
  },
  {
    title: 'Client Name',
    dataIndex: 'client_name',
    key: 'client_name',
    width: 200,
  },
  {
    title: 'Campaign',
    dataIndex: 'campaign_name',
    key: 'campaign_name',
    width: 200,
  },
  {
    title: 'Invoice No.',
    dataIndex: 'invoice_number',
    key: 'invoice_number',
    width: 150,
  },
  {
    title: 'Bill Date',
    dataIndex: 'bill_date',
    key: 'bill_date',
    width: 120,
    render: formatDate,
  },
  {
    title: 'Base Amount (₹)',
    dataIndex: 'amount',
    key: 'amount',
    width: 140,
    align: 'right',
    render: formatINR,
  },
  {
    title: 'CGST (₹)',
    dataIndex: 'cgst_amount',
    key: 'cgst_amount',
    width: 120,
    align: 'right',
    render: formatINR,
  },
  {
    title: 'SGST (₹)',
    dataIndex: 'sgst_amount',
    key: 'sgst_amount',
    width: 120,
    align: 'right',
    render: formatINR,
  },
  {
    title: 'IGST (₹)',
    dataIndex: 'igst_amount',
    key: 'igst_amount',
    width: 120,
    align: 'right',
    render: formatINR,
  },
  {
    title: 'Payable Amount (₹)',
    dataIndex: 'payable_amount',
    key: 'payable_amount',
    width: 150,
    align: 'right',
    render: formatINR,
  },
  {
    title: 'Paid Amount (₹)',
    dataIndex: 'paid_amount',
    key: 'paid_amount',
    width: 150,
    align: 'right',
    render: formatINR,
  },
  {
    title: 'Outstanding (₹)',
    dataIndex: 'outstanding_amount',
    key: 'outstanding_amount',
    width: 150,
    align: 'right',
    render: formatINR,
  },
  {
    title: 'Payment Status',
    dataIndex: 'payment_status',
    key: 'payment_status',
    width: 130,
    render: (status) => (
      <Tag color={STATUS_COLORS[status] || 'default'}>
        {status}
      </Tag>
    ),
  },
]

const VendorInvoicesReport = () => {
  return (
    <ReportPage
      title="Vendor Invoices Report"
      columns={columns}
      reportName="vendor-invoices"
      searchKeys={[
        'booking_reference',
        'vendor_name',
        'client_name',
        'invoice_number',
      ]}
    />
  )
}

export default VendorInvoicesReport