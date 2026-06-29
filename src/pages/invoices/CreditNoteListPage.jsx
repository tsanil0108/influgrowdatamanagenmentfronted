// src/pages/invoices/CreditNoteListPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Tag, Button, Space, Typography, message, Input, Row, Col } from 'antd'
import { PlusOutlined, EyeOutlined, DeleteOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import { invoiceApi } from '../../api/invoiceApi'

const { Text } = Typography

const CreditNoteListPage = () => {
  const navigate = useNavigate()
  const [creditNotes, setCreditNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    fetchCreditNotes()
  }, [])

  const fetchCreditNotes = async () => {
    setLoading(true)
    try {
      const response = await invoiceApi.getInvoices({ page: 0, size: 100 })
      const allInvoices = response.data?.data?.content || []
      const cns = allInvoices.filter(inv => inv.invoiceType === 'CREDIT_NOTE')
      setCreditNotes(cns)
    } catch (error) {
      message.error('Failed to load credit notes')
    } finally {
      setLoading(false)
    }
  }

  const fmt = v => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  const columns = [
    {
      title: 'CN Number',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => {
            // ✅ Credit Note par click kare toh original invoice pe jaao
            if (record.originalInvoiceId) {
              navigate(`/invoices/${record.originalInvoiceId}`)
            } else {
              navigate(`/invoices/${record.id}`)
            }
          }}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Original Invoice',
      dataIndex: 'originalInvoiceNumber',
      key: 'originalInvoiceNumber',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => {
            if (record.originalInvoiceId) {
              navigate(`/invoices/${record.originalInvoiceId}`)
            }
          }}
          style={{ padding: 0 }}
        >
          {text || '-'}
        </Button>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Date',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => (
        <Text type="danger" strong>
          {fmt(Math.abs(val || 0))}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ISSUED' ? 'blue' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => {
            // ✅ View Original Invoice
            if (record.originalInvoiceId) {
              navigate(`/invoices/${record.originalInvoiceId}`)
            } else {
              navigate(`/invoices/${record.id}`)
            }
          }}
        >
          View Original
        </Button>
      ),
    },
  ]

  const filteredData = creditNotes.filter(cn => 
    cn.invoiceNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
    cn.clientName?.toLowerCase().includes(searchText.toLowerCase()) ||
    cn.originalInvoiceNumber?.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div>
      <PageHeader 
        title="Credit Notes" 
        onBack={() => navigate('/invoices')}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/invoices/credit-note/new')}
          >
            Generate Credit Note
          </Button>
        }
      />

      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder="Search by CN number, client or original invoice"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Button type="primary" onClick={fetchCreditNotes}>
              Refresh
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `Total ${total} credit notes`,
          }}
        />
      </Card>
    </div>
  )
}

export default CreditNoteListPage