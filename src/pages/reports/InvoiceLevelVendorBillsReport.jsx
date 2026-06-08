import React from 'react'
import { ReportPage } from './ReportBase'

const columns = [
  {
    title: 'Invoice No.',
    dataIndex: 'invoice_number',
    key: 'invoice_number',
    width: 140,
  },
  {
    title: 'Client',
    dataIndex: 'client_name',
    key: 'client_name',
    width: 160,
  },
  {
    title: 'Invoice Total (₹)',
    dataIndex: 'invoice_total',
    key: 'invoice_total',
    width: 150,
    align: 'right',
    render: v =>
      v != null
        ? `₹${Number(v).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
          })}`
        : '-',
  },
  {
    title: 'Booking Ref.',
    dataIndex: 'booking_reference',
    key: 'booking_reference',
    width: 150,
  },
  {
    title: 'Vendor',
    dataIndex: 'vendor_name',
    key: 'vendor_name',
    width: 160,
  },
  {
    title: 'Vendor Bill (₹)',
    dataIndex: 'vendor_payable',
    key: 'vendor_payable',
    width: 140,
    align: 'right',
    render: v =>
      v != null
        ? `₹${Number(v).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
          })}`
        : '-',
  },
]

const InvoiceLevelVendorBillsReport = () => (
  <ReportPage
    title="Invoice Level Vendor Bills"
    columns={columns}
    reportName="invoice-vendor-bills"
    searchKeys={[
      'invoice_number',
      'client_name',
      'vendor_name',
    ]}
  />
)

export default InvoiceLevelVendorBillsReport