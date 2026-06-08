import React from 'react'
import dayjs from 'dayjs'
import { ReportPage } from './ReportBase'

const columns = [
  {
    title: 'Campaign',
    dataIndex: 'campaign_name',
    key: 'campaign_name',
  },
  {
    title: 'Client',
    dataIndex: 'client_name',
    key: 'client_name',
  },
  {
    title: 'Start Date',
    dataIndex: 'start_date',
    key: 'start_date',
    render: d =>
      d ? dayjs(d).format('DD MMM YYYY') : '-',
  },
  {
    title: 'End Date',
    dataIndex: 'end_date',
    key: 'end_date',
    render: d =>
      d ? dayjs(d).format('DD MMM YYYY') : '-',
  },
]

export default function CampaignMasterReport() {
  return (
    <ReportPage
      title="Campaign Master Report"
      columns={columns}
      reportName="campaign-master"
      searchKeys={[
        'campaign_name',
        'client_name',
      ]}
    />
  )
}