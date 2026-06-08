import React from 'react'
import { Tag } from 'antd'
import { ReportPage } from './ReportBase'

const columns = [
  {
    title: 'Vendor Name',
    dataIndex: 'vendor_name',
    key: 'vendor_name',
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
    title: 'Bank',
    dataIndex: 'bank_name',
    key: 'bank_name',
  },
  {
    title: 'IFSC',
    dataIndex: 'ifsc_code',
    key: 'ifsc_code',
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

export default function VendorMasterReport() {
  return (
    <ReportPage
      title="Vendor Master Report"
      columns={columns}
      reportName="vendor-master"
      searchKeys={['vendor_name', 'pan_number']}
    />
  )
}