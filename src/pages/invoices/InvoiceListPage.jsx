// src/pages/invoices/InvoiceListPage.jsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, Space, Popconfirm } from 'antd'
import { EyeOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import { useInvoices } from '../../hooks/useInvoices'

const STATUS_COLORS = { UNPAID: 'red', PARTIAL: 'orange', PAID: 'green', ISSUED: 'red' }

const InvoiceListPage = () => {
  const navigate = useNavigate()
  const { list, loading, loadInvoices, removeInvoice } = useInvoices()

  useEffect(() => {
    loadInvoices({ page: 0, size: 100 })
  }, [loadInvoices])

  const isCreditNote = (r) => r.invoiceType === 'CREDIT_NOTE'

  const fmtAmount = (v) => v != null
    ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '-'

  const columns = [
    {
      title: 'Invoice No.',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 170,
      render: (v, r) => (
        <span style={{ color: isCreditNote(r) ? '#ff4d4f' : undefined, fontWeight: isCreditNote(r) ? 600 : 400 }}>
          {v}
        </span>
      )
    },
    {
      title: 'Type',
      dataIndex: 'invoiceType',
      key: 'invoiceType',
      width: 110,
      render: (type) => type === 'CREDIT_NOTE'
        ? <Tag color="red">Credit Note</Tag>
        : <Tag color="blue">Invoice</Tag>
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
      width: 180
    },
    {
      title: 'Campaign',
      dataIndex: 'campaignName',
      key: 'campaignName',
      width: 160,
      ellipsis: true,
      render: v => v || '-'
    },
    {
      title: 'Invoice Date',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 120,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-'
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 110,
      render: d => d ? dayjs(d).format('DD MMM YYYY') : '-'
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      render: (v, r) => (
        <span style={{ color: isCreditNote(r) ? '#ff4d4f' : undefined, fontWeight: isCreditNote(r) ? 600 : 400 }}>
          {fmtAmount(v)}
        </span>
      )
    },
    {
      title: 'Paid (₹)',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 130,
      align: 'right',
      render: v => v != null ? fmtAmount(v) : '₹0.00'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: s => <Tag color={STATUS_COLORS[s] || 'default'}>{s}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, r) => (
        <Space>
          {/* ✅ VIEW BUTTON - Original invoice dikhao */}
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              // ✅ Agar Credit Note hai aur originalInvoiceId hai toh original pe jaao
              if (isCreditNote(r) && r.originalInvoiceId) {
                navigate(`/invoices/${r.originalInvoiceId}`)
              } else {
                // ✅ Nahi toh current invoice par jaao
                navigate(`/invoices/${r.id}`)
              }
            }}
            title={isCreditNote(r) ? 'View Original Invoice' : 'View Invoice'}
          />

          {/* ✅ CREDIT NOTE BUTTON - Sirf Invoice type par dikhega */}
          {!isCreditNote(r) && (
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/invoices/credit-note/new?invoiceId=${r.id}`)
              }}
              style={{ color: '#ff4d4f' }}
              title="Generate Credit Note"
            />
          )}

          {/* DELETE BUTTON */}
          <Popconfirm
            title={isCreditNote(r) ? 'Delete this Credit Note?' : 'Delete Invoice?'}
            description={
              isCreditNote(r)
                ? 'Yeh credit note delete hone par original invoice ka paid amount/status automatically revert ho jayega.'
                : 'Are you sure? This cannot be undone.'
            }
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={(e) => {
              e?.stopPropagation()
              removeInvoice(r.id)
            }}
            onCancel={(e) => e?.stopPropagation()}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Manage all invoices"
        onAdd={() => navigate('/invoices/new')}
        addLabel="New Invoice"
      />
      <DataTable
        columns={columns}
        data={list}
        loading={loading}
        onRefresh={() => loadInvoices({ page: 0, size: 100 })}
        searchKeys={['invoiceNumber', 'clientName', 'campaignName']}
        scroll={{ x: 1350 }}
        rowClassName={(r) => isCreditNote(r) ? 'credit-note-row' : ''}
      />
      <style>{`
        .credit-note-row {
          background-color: #fff1f0 !important;
        }
        .credit-note-row:hover > td {
          background-color: #ffe1de !important;
        }
      `}</style>
    </div>
  )
}

export default InvoiceListPage