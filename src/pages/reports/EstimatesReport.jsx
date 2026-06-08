import React from 'react'
import { Tag } from 'antd'
import dayjs from 'dayjs'
import { ReportPage } from './ReportBase'

const columns = [
  {
    title: 'Estimate No',
    dataIndex: 'estimate_number',
    key: 'estimate_number',
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
    title: 'Date',
    dataIndex: 'estimate_date',
    key: 'estimate_date',
    render: d =>
      d ? dayjs(d).format('DD MMM YYYY') : '-',
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

export default function EstimatesReport() {
  return (
    <ReportPage
      title="Estimates Report"
      columns={columns}
      reportName="estimates"
      searchKeys={[
        'estimate_number',
        'client_name',
      ]}
    />
  )
}