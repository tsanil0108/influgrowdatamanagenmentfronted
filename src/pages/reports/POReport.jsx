import React from 'react'
import { Tag } from 'antd'
import { ReportPage } from './ReportBase'

const columns = [
  {
    title: 'PO Number',
    dataIndex: 'po_number',
    key: 'po_number',
  },
  {
    title: 'Client',
    dataIndex: 'client_name',
    key: 'client_name',
  },
  {
    title: 'Campaign',
    dataIndex: 'campaign_name',
    key: 'campaign_name',
  },
  {
    title: 'Amount',
    dataIndex: 'total_amount',
    key: 'total_amount',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: s => <Tag>{s}</Tag>,
  },
]

export default function POReport() {
  return (
    <ReportPage
      title="Purchase Order Report"
      columns={columns}
      reportName="purchase-orders"
      searchKeys={['po_number']}
    />
  )
}