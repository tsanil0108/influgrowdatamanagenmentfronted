// src/pages/invoices/CreditNoteFormPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import {
  Form, Button, DatePicker, InputNumber, Card,
  Row, Col, Space, Divider, message, Alert, Typography, Input
} from 'antd'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import FormSelect from '../../components/common/FormSelect'
import { invoiceApi } from '../../api/invoiceApi'
import { clientApi } from '../../api/clientApi'

const { Text } = Typography
const { TextArea } = Input

const CreditNoteFormPage = () => {
  const navigate = useNavigate()
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      clientId: null,
      originalInvoiceId: null,
      invoiceDate: dayjs(),
      remarks: '',
      amount: 0,
    }
  })

  const [clients,      setClients]      = useState([])
  const [invoices,     setInvoices]     = useState([])
  const [originalInfo, setOriginalInfo] = useState(null)
  const [submitting,   setSubmitting]   = useState(false)

  const selectedClientId  = watch('clientId')
  const selectedInvoiceId = watch('originalInvoiceId')
  const amount             = Number(watch('amount')) || 0

  const gstType    = originalInfo?.gstType  || 'CGST_SGST'
  const cgstRate   = originalInfo?.cgstRate || 0
  const sgstRate   = originalInfo?.sgstRate || 0
  const igstRate   = originalInfo?.igstRate || 0
  const cgstAmount = gstType === 'CGST_SGST' ? amount * cgstRate / 100 : 0
  const sgstAmount = gstType === 'CGST_SGST' ? amount * sgstRate / 100 : 0
  const igstAmount = gstType === 'IGST'      ? amount * igstRate / 100 : 0
  const totalCredit = amount + cgstAmount + sgstAmount + igstAmount

  useEffect(() => {
    clientApi.getClients({ page: 0, size: 1000 })
      .then(r => {
        const list = r.data?.data?.content ?? r.data?.data ?? []
        setClients(Array.isArray(list) ? list : [])
      })
      .catch(() => message.error('Failed to load clients'))
  }, [])

  useEffect(() => {
    if (!selectedClientId) {
      setInvoices([])
      return
    }
    invoiceApi.getInvoices({ clientId: selectedClientId, page: 0, size: 200 })
      .then(r => {
        const list = r.data?.data?.content ?? r.data?.data ?? []
        setInvoices((Array.isArray(list) ? list : []).filter(inv => inv.invoiceType !== 'CREDIT_NOTE'))
      })
      .catch(() => message.error('Failed to load invoices'))
  }, [selectedClientId])

  useEffect(() => {
    if (!selectedInvoiceId) {
      setOriginalInfo(null)
      return
    }
    invoiceApi.getInvoiceById(selectedInvoiceId)
      .then(r => {
        const inv = r.data?.data ?? null
        setOriginalInfo(inv)
        if (inv) {
          setValue('amount', Number(inv.subtotal ?? inv.totalAmount ?? 0))
        }
      })
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
        remarks:           data.remarks || null,
        lineItems: [{
          activityName: 'Credit Note',
          description:  data.remarks || 'Credit Note',
          hsnCode:      null,
          amount:       Math.abs(Number(data.amount) || 0),
          sortOrder:    0,
        }],
      }
      const res = await invoiceApi.createCreditNote(payload)
      const cnNumber = res?.data?.data?.invoiceNumber
      message.success(cnNumber ? `Credit note ${cnNumber} created` : 'Credit note created')
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
      <PageHeader title="Generate Credit Note" onBack={() => navigate('/invoices')} />
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}
        style={{ maxWidth: 700, margin: '0 auto' }}>

        <Card style={{ marginBottom: 16 }}>
          <Alert
            message="This credit note will reduce the original invoice's outstanding balance. It will appear in the Sales Register/Reports in red with a 'Credit Note' tag. The CN number is auto-generated (e.g. IG/CN/2627/04/KIN/01)."
            type="warning" showIcon style={{ marginBottom: 16 }}
          />

          <Row gutter={16}>
            <Col span={24}>
              <FormSelect
                name="clientId"
                label="Client"
                control={control}
                error={errors.clientId}
                options={clients.map(c => ({ value: c.id, label: c.clientName }))}
                required
                showSearch
                placeholder="Select client"
                onChange={() => { setValue('originalInvoiceId', null); setValue('amount', 0) }}
              />
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={24}>
              <FormSelect
                name="originalInvoiceId"
                label="Select Invoice"
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
              <Form.Item label="Credit Note Date" required
                tooltip="Aaj ki date by default hai — neeche se back date bhi select kar sakte hain">
                <Controller name="invoiceDate" control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      format="DD/MM/YYYY"
                      style={{ width: '100%' }}
                      disabledDate={(d) => d && d.isAfter(dayjs(), 'day')}
                    />
                  )} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Credit Note Amount (₹)" required
                tooltip="Selected invoice se fetch hota hai, aap edit kar sakte hain">
                <Controller name="amount" control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field} min={0} precision={2} style={{ width: '100%' }}
                      disabled={!selectedInvoiceId}
                      formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={v => v.replace(/₹\s?|(,*)/g, '')}
                    />
                  )} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Remarks">
                <Controller name="remarks" control={control}
                  render={({ field }) => (
                    <TextArea {...field} rows={3} placeholder="Reason for credit note (e.g. campaign cancelled, billing correction, etc.)" />
                  )} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400, marginLeft: 'auto' }}>
            <Row justify="space-between"><Text>Amount</Text><Text>{fmt(amount)}</Text></Row>
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
              disabled={!selectedInvoiceId || amount <= 0}>
              Save Credit Note
            </Button>
            <Button onClick={() => navigate('/invoices')}>Cancel</Button>
          </Space>
        </Card>
      </Form>
    </div>
  )
}

export default CreditNoteFormPage