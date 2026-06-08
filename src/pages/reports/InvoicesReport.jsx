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
    title: 'Invoice No.',
    dataIndex: 'invoice_number',
    key: 'invoice_number',
    width: 150,
  },
  {
    title: 'Client',
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
    title: 'Invoice Date',
    dataIndex: 'invoice_date',
    key: 'invoice_date',
    width: 120,
    render: formatDate,
  },
  {
    title: 'Due Date',
    dataIndex: 'due_date',
    key: 'due_date',
    width: 120,
    render: formatDate,
  },
  {
    title: 'Subtotal (₹)',
    dataIndex: 'subtotal',
    key: 'subtotal',
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
    title: 'Total Amount (₹)',
    dataIndex: 'total_amount',
    key: 'total_amount',
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
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (status) => (
      <Tag color={STATUS_COLORS[status] || 'default'}>
        {status}
      </Tag>
    ),
  },
]

const InvoicesReport = () => {
  return (
    <ReportPage
      title="Invoices Report"
      columns={columns}
      reportName="invoices"
      searchKeys={[
        'invoice_number',
        'client_name',
        'campaign_name',
      ]}
    />
  )
}

export default InvoicesReport