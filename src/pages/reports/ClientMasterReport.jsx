import React from 'react'
import { Tag } from 'antd'
import { ReportPage } from './ReportBase'

const columns = [
  {
    title: 'Client Name',
    dataIndex: 'client_name',
    key: 'client_name',
  },
  {
    title: 'PAN',
    dataIndex: 'pan_number',
    key: 'pan_number',
  },
  {
    title: 'GST',
    dataIndex: 'gst_number',
    key: 'gst_number',
  },
  {
    title: 'City',
    dataIndex: 'city',
    key: 'city',
  },
  {
    title: 'State',
    dataIndex: 'state',
    key: 'state',
  },
  {
    title: 'Contact',
    dataIndex: 'contact_person',
    key: 'contact_person',
  },
  {
    title: 'Mobile',
    dataIndex: 'mobile',
    key: 'mobile',
  },
  {
    title: 'Status',
    dataIndex: 'is_active',
    key: 'is_active',
    render: value => (
      <Tag color={value ? 'green' : 'red'}>
        {value ? 'Active' : 'Inactive'}
      </Tag>
    ),
  },
]

export default function ClientMasterReport() {
  return (
    <ReportPage
      title="Client Master Report"
      columns={columns}
      reportName="client-master"
      searchKeys={['client_name', 'pan_number', 'city']}
    />
  )
}