import React from 'react'
import { Typography } from 'antd'
import { ReportPage } from './ReportBase'

const { Text } = Typography

const columns = [
  { title: 'Sr.', dataIndex: 'sr', key: 'sr', width: 60 },
  { title: 'Client', dataIndex: 'client_name', key: 'client_name', width: 180 },
  { title: 'Invoice No.', dataIndex: 'invoice_number', key: 'invoice_number', width: 140 },
  { title: 'Invoice Date', dataIndex: 'invoice_date', key: 'invoice_date', width: 120 },
  { title: 'Due Date', dataIndex: 'due_date', key: 'due_date', width: 110 },
  {
    title: 'Total Amount (₹)', dataIndex: 'total_amount', key: 'total_amount',
    width: 150, align: 'right',
    render: v => v && v !== '-'
      ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-',
  },
  {
    title: 'Outstanding (₹)', dataIndex: 'outstanding_amount', key: 'outstanding_amount',
    width: 150, align: 'right',
    render: v => v && v !== '-'
      ? <Text style={{ color: '#DC2626', fontWeight: 600 }}>₹{Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      : '-',
  },
  {
    title: 'Overdue Days', dataIndex: 'overdue_days', key: 'overdue_days',
    width: 120, align: 'right',
    render: v => Number(v) > 0
      ? <Text type="danger" strong>{v} days</Text>
      : <Text style={{ color: '#16a34a' }}>On time</Text>,
  },
]

const ClientOutstandingReport = () => (
  <ReportPage
    title="Client Outstanding Report"
    columns={columns}
    reportName="client-outstanding"
    searchKeys={['client_name', 'invoice_number']}
  />
)

export default ClientOutstandingReport