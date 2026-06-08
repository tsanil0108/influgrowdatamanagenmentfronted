import React from 'react'
import { Typography } from 'antd'
import { ReportPage } from './ReportBase'

const { Text } = Typography

const formatINR = v =>
  v != null
    ? `₹${Number(v).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
      })}`
    : '-'

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
    width: 160,
  },
  {
    title: 'Invoice Revenue (₹)',
    dataIndex: 'invoice_revenue',
    key: 'invoice_revenue',
    width: 170,
    align: 'right',
    render: formatINR,
  },
  {
    title: 'Vendor Cost (₹)',
    dataIndex: 'vendor_cost',
    key: 'vendor_cost',
    width: 150,
    align: 'right',
    render: formatINR,
  },
  {
    title: 'Gross Margin (₹)',
    dataIndex: 'gross_margin',
    key: 'gross_margin',
    width: 150,
    align: 'right',
    render: value => {
      if (value == null) return '-'

      const color =
        Number(value) >= 0
          ? '#059669'
          : '#DC2626'

      return (
        <Text style={{ color }}>
          {formatINR(value)}
        </Text>
      )
    },
  },
  {
    title: 'Margin %',
    dataIndex: 'margin_percent',
    key: 'margin_percent',
    width: 100,
    align: 'right',
    render: v =>
      v != null
        ? `${Number(v).toFixed(1)}%`
        : '-',
  },
]

const CampaignMarginReport = () => (
  <ReportPage
    title="Campaign Margin Report"
    columns={columns}
    reportName="campaign-margin"
    searchKeys={[
      'campaign_name',
      'client_name',
    ]}
  />
)

export default CampaignMarginReport