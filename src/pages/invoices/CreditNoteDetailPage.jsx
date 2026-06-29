// src/pages/invoices/CreditNoteDetailPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Row, Col, Typography, Tag, Divider, Button, Space, Descriptions, message, Spin, Table } from 'antd'
import { ArrowLeftOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import { invoiceApi } from '../../api/invoiceApi'

const { Text, Title } = Typography

const CreditNoteDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [creditNote, setCreditNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchCreditNoteDetail()
    }
  }, [id])

  const fetchCreditNoteDetail = async () => {
    setLoading(true)
    try {
      const response = await invoiceApi.getInvoiceById(id)
      const data = response.data?.data
      if (data && data.invoiceType === 'CREDIT_NOTE') {
        setCreditNote(data)
      } else {
        message.error('Invalid credit note')
        navigate('/invoices/credit-notes')
      }
    } catch (error) {
      message.error('Failed to load credit note details')
      navigate('/invoices/credit-notes')
    } finally {
      setLoading(false)
    }
  }

  const fmt = v => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!creditNote) {
    return null
  }

  return (
    <div>
      <PageHeader 
        title={`Credit Note: ${creditNote.invoiceNumber}`} 
        onBack={() => navigate('/invoices/credit-notes')}
        extra={
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/invoices/credit-notes')}
            >
              Back to List
            </Button>
            <Button 
              type="primary" 
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={async () => {
                try {
                  const response = await invoiceApi.downloadInvoicePdf(creditNote.id)
                  const url = window.URL.createObjectURL(new Blob([response.data]))
                  const link = document.createElement('a')
                  link.href = url
                  link.setAttribute('download', `${creditNote.invoiceNumber}.pdf`)
                  document.body.appendChild(link)
                  link.click()
                  link.remove()
                } catch (error) {
                  message.error('Failed to download PDF')
                }
              }}
            >
              Download PDF
            </Button>
          </Space>
        }
      />

      <Card style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Credit Note Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#ff4d4f' }}>CREDIT NOTE</Title>
          <Text type="secondary">Credit Note Number: </Text>
          <Text strong>{creditNote.invoiceNumber}</Text>
        </div>

        <Divider />

        {/* Credit Note Details */}
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Original Invoice">
            {creditNote.originalInvoiceNumber || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={creditNote.status === 'ISSUED' ? 'blue' : 'default'}>
              {creditNote.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Client">
            {creditNote.clientName}
          </Descriptions.Item>
          <Descriptions.Item label="Campaign">
            {creditNote.campaignName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Credit Note Date">
            {dayjs(creditNote.invoiceDate).format('DD/MM/YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Created By">
            {creditNote.createdBy || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Remarks" span={2}>
            {creditNote.remarks || '-'}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Line Items */}
        <Title level={4}>Credit Note Items</Title>
        <Table
          dataSource={creditNote.lineItems || []}
          columns={[
            { title: 'Activity', dataIndex: 'activityName', key: 'activityName' },
            { title: 'Description', dataIndex: 'description', key: 'description' },
            { 
              title: 'Amount', 
              dataIndex: 'amount', 
              key: 'amount',
              render: (val) => (
                <Text type="danger">{fmt(Math.abs(val || 0))}</Text>
              )
            },
          ]}
          rowKey="id"
          pagination={false}
          size="small"
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <Text strong>Total Credit</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <Text strong type="danger">{fmt(Math.abs(creditNote.totalAmount || 0))}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  )
}

export default CreditNoteDetailPage