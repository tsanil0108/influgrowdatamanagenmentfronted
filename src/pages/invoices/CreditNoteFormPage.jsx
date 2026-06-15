// src/pages/invoices/CreditNoteFormPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import {
  Form, Button, DatePicker, InputNumber, Card,
  Row, Col, Space, Divider, Table, message, Alert, Typography, Input
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import FormSelect from '../../components/common/FormSelect'
import { invoiceApi } from '../../api/invoiceApi'
import { clientApi } from '../../api/clientApi'

const { Text } = Typography

const CreditNoteFormPage = () => {
  const navigate = useNavigate()
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      clientId: null,
      originalInvoiceId: null,
      invoiceDate: dayjs(),
      lineItems: [{ activityName: '', description: '', hsnCode: '', amount: 0 }],
    }
  })

  const { fields, append, remove, replace } = useFieldArray({ control, name: 'lineItems' })

  const [clients,       setClients]       = useState([])
  const [invoices,      setInvoices]      = useState([])
  const [originalInfo,  setOriginalInfo]  = useState(null)
  const [submitting,    setSubmitting]    = useState(false)

  const watchedItems       = watch('lineItems')
  const selectedClientId   = watch('clientId')
  const selectedInvoiceId  = watch('originalInvoiceId')

  const subtotal = watchedItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

  const gstType    = originalInfo?.gstType  || 'CGST_SGST'
  const cgstRate   = originalInfo?.cgstRate || 0
  const sgstRate   = originalInfo?.sgstRate || 0
  const igstRate   = originalInfo?.igstRate || 0
  const cgstAmount = gstType === 'CGST_SGST' ? subtotal * cgstRate / 100 : 0
  const sgstAmount = gstType === 'CGST_SGST' ? subtotal * sgstRate / 100 : 0
  const igstAmount = gstType === 'IGST'      ? subtotal * igstRate / 100 : 0
  const totalGst   = cgstAmount + sgstAmount + igstAmount
  const totalCredit = subtotal + totalGst

  useEffect(() => {
    clientApi.getClients({ page: 0, size: 1000 })
      .then(r => {
        const list = r.data?.data?.content ?? r.data?.data ?? []
        setClients(Array.isArray(list) ? list : [])
      })
      .catch(() => message.error('Failed to load clients'))
  }, [])

  // Load invoices for selected client
  useEffect(() => {
    if (!selectedClientId) {
      setInvoices([])
      return
    }
    invoiceApi.getInvoices({ clientId: selectedClientId, page: 0, size: 200 })
      .then(r => {
        const list = r.data?.data?.content ?? r.data?.data ?? []
        // sirf normal invoices, credit notes ko exclude karo
        setInvoices((Array.isArray(list) ? list : []).filter(inv => inv.invoiceType !== 'CREDIT_NOTE'))
      })
      .catch(() => message.error('Failed to load invoices'))
  }, [selectedClientId])

  // Load original invoice details (for GST rates)
  useEffect(() => {
    if (!selectedInvoiceId) {
      setOriginalInfo(null)
      return
    }
    invoiceApi.getInvoiceById(selectedInvoiceId)
      .then(r => setOriginalInfo(r.data?.data ?? null))
      .catch(() => message.error('Failed to load invoice details'))
  }, [selectedInvoiceId])

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const payload = {
        clientId:          data.clientId,
        originalInvoiceId: data.originalInvoiceId,
        invoiceType:       'CREDIT_NOTE',
        invoiceDate:       data.invoiceDate?.format('YYYY-MM-DD'),
        lineItems: data.lineItems.map((li, idx) => ({
          activityName: li.activityName,
          hsnCode:      li.hsnCode || null,
          description:  li.description,
          amount:       Math.abs(Number(li.amount) || 0), // backend negates internally
          sortOrder:    idx,
        })),
      }
      await invoiceApi.createCreditNote(payload)
      message.success('Credit note created')
      navigate('/invoices')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create credit note')
    } finally {
      setSubmitting(false)
    }
  }

  const fmt = v => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  return (
    <div>
      <PageHeader title="New Credit Note" onBack={() => navigate('/invoices')} />
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}
        style={{ maxWidth: 900, margin: '0 auto' }}>

        <Card style={{ marginBottom: 16 }}>
          <Alert
            message="Credit note se original invoice ka outstanding kam ho jayega. Reports me yeh red color me 'Credit Note' tag ke saath dikhega."
            type="warning" showIcon style={{ marginBottom: 16 }}
          />

          <Row gutter={16}>
            <Col span={12}>
              <FormSelect
                name="clientId"
                label="Client"
                control={control}
                error={errors.clientId}
                options={clients.map(c => ({ value: c.id, label: c.clientName }))}
                required
                showSearch
                placeholder="Select client"
                onChange={() => setValue('originalInvoiceId', null)}
              />
            </Col>
            <Col span={12}>
              <FormSelect
                name="originalInvoiceId"
                label="Against Invoice"
                control={control}
                error={errors.originalInvoiceId}
                options={invoices.map(inv => ({
                  value: inv.id,
                  label: `${inv.invoiceNumber} — ${fmt(inv.totalAmount)} [${inv.status}]`
                }))}
                required
                showSearch
                placeholder={selectedClientId ? 'Select invoice' : 'Select client first'}
                disabled={!selectedClientId}
              />
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={12}>
              <Form.Item label="Credit Note Date" required>
                <Controller name="invoiceDate" control={control}
                  render={({ field }) => (
                    <DatePicker {...field} format="DD/MM/YYYY" style={{ width: '100%' }} />
                  )} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Credit Note Line Items" style={{ marginBottom: 16 }}
          extra={
            <Button size="small" icon={<PlusOutlined />}
              onClick={() => append({ activityName: '', description: '', hsnCode: '', amount: 0 })}>
              Add Row
            </Button>
          }>
          <Table
            dataSource={fields}
            rowKey={(_, i) => i}
            pagination={false}
            size="small"
            columns={[
              { title: '#', key: 'idx', width: 40, render: (_, __, idx) => idx + 1 },
              {
                title: 'Activity', key: 'activityName', width: 200,
                render: (_, __, index) => (
                  <Controller name={`lineItems.${index}.activityName`} control={control}
                    render={({ field }) => <Input {...field} placeholder="Activity name" />} />
                )
              },
              {
                title: 'HSN Code', key: 'hsnCode', width: 110,
                render: (_, __, index) => (
                  <Controller name={`lineItems.${index}.hsnCode`} control={control}
                    render={({ field }) => <Input {...field} placeholder="HSN" />} />
                )
              },
              {
                title: 'Description', key: 'description',
                render: (_, __, index) => (
                  <Controller name={`lineItems.${index}.description`} control={control}
                    render={({ field }) => <Input {...field} placeholder="Description" />} />
                )
              },
              {
                title: 'Amount (₹)', key: 'amount', width: 160,
                render: (_, __, index) => (
                  <Controller name={`lineItems.${index}.amount`} control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field} min={0} precision={2} style={{ width: '100%' }}
                        formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={v => v.replace(/₹\s?|(,*)/g, '')}
                      />
                    )} />
                )
              },
              {
                title: '', key: 'remove', width: 50,
                render: (_, __, index) => fields.length > 1 && (
                  <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(index)} />
                )
              },
            ]}
          />
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400, marginLeft: 'auto' }}>
            <Row justify="space-between"><Text>Subtotal</Text><Text>{fmt(subtotal)}</Text></Row>
            {gstType === 'CGST_SGST' ? (
              <>
                <Row justify="space-between"><Text type="secondary">CGST ({cgstRate}%)</Text><Text type="secondary">{fmt(cgstAmount)}</Text></Row>
                <Row justify="space-between"><Text type="secondary">SGST ({sgstRate}%)</Text><Text type="secondary">{fmt(sgstAmount)}</Text></Row>
              </>
            ) : (
              <Row justify="space-between"><Text type="secondary">IGST ({igstRate}%)</Text><Text type="secondary">{fmt(igstAmount)}</Text></Row>
            )}
            <Divider style={{ margin: '4px 0' }} />
            <Row justify="space-between">
              <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>Total Credit</Text>
              <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>{fmt(totalCredit)}</Text>
            </Row>
          </div>
        </Card>

        <Card>
          <Space>
            <Button type="primary" danger htmlType="submit" loading={submitting}
              disabled={!selectedInvoiceId}>
              Create Credit Note
            </Button>
            <Button onClick={() => navigate('/invoices')}>Cancel</Button>
          </Space>
        </Card>
      </Form>
    </div>
  )
}

export default CreditNoteFormPage