// src/pages/vendor-bills/VendorBillFormPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import {
  Button, Card, Col, DatePicker, Form, Input, InputNumber,
  Row, Select, Space, message, Divider, Typography
} from 'antd'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import { vendorBillApi } from '../../api/vendorBillApi'
import { clientApi } from '../../api/clientApi'
import { vendorApi } from '../../api/vendorApi'
import { invoiceApi } from '../../api/invoiceApi'

const { Text } = Typography
const { Option } = Select

const VendorBillFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      clientId: null,
      invoiceId: null,
      vendorId: null,
      billDate: dayjs(),
      vendorBillNumber: '',
      amount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      tdsPercent: 0,
      notes: '',
    }
  })

  const [clients,    setClients]    = useState([])
  const [vendors,    setVendors]    = useState([])
  const [invoices,   setInvoices]   = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    clientApi.getClients({ page: 0, size: 1000 })
      .then(r => {
        const list = r.data?.data?.content ?? r.data?.data ?? []
        setClients(Array.isArray(list) ? list : [])
      })
      .catch(() => message.error('Failed to load clients'))

    vendorApi.getVendors({ page: 0, size: 1000 })
      .then(r => {
        const list = r.data?.data?.content ?? r.data?.data ?? []
        setVendors(Array.isArray(list) ? list : [])
      })
      .catch(() => message.error('Failed to load vendors'))

    invoiceApi.getInvoices({ page: 0, size: 1000 })
      .then(r => {
        const list = r.data?.data?.content ?? r.data?.data ?? []
        setInvoices(Array.isArray(list) ? list : [])
      })
      .catch(() => message.error('Failed to load invoices'))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    vendorBillApi.getVendorBillById(id).then(r => {
      const b = r.data?.data
      if (!b) return
      setValue('clientId', b.clientId)
      setValue('invoiceId', b.invoiceId || null)
      setValue('vendorId', b.vendorId)
      setValue('billDate', b.billDate ? dayjs(b.billDate) : dayjs())
      setValue('vendorBillNumber', b.vendorBillNumber || '')
      setValue('amount', Number(b.amount) || 0)
      setValue('cgstAmount', Number(b.cgstAmount) || 0)
      setValue('sgstAmount', Number(b.sgstAmount) || 0)
      setValue('igstAmount', Number(b.igstAmount) || 0)
      setValue('tdsPercent', Number(b.tdsPercent) || 0)
      setValue('notes', b.notes || '')
    }).catch(() => message.error('Failed to load vendor bill'))
  }, [id])

  const amount = watch('amount')
  const cgst   = watch('cgstAmount')
  const sgst   = watch('sgstAmount')
  const igst   = watch('igstAmount')
  const tdsPct = watch('tdsPercent')

  const amt  = Number(amount) || 0
  const c    = Number(cgst) || 0
  const s    = Number(sgst) || 0
  const i    = Number(igst) || 0
  const tp   = Number(tdsPct) || 0

  const gstTotal      = c + s + i
  const totalAmount   = amt + gstTotal
  const tdsAmount     = parseFloat(((amt * tp) / 100).toFixed(2))
  const payableAmount = totalAmount - tdsAmount

  const handleCgstChange = (val) => {
    const v = val ?? 0
    setValue('cgstAmount', v)
    if (v > 0) {
      setValue('sgstAmount', v)
      setValue('igstAmount', 0)
    }
  }

  const handleSgstChange = (val) => {
    const v = val ?? 0
    setValue('sgstAmount', v)
    if (v > 0) {
      setValue('cgstAmount', v)
      setValue('igstAmount', 0)
    }
  }

  const handleIgstChange = (val) => {
    const v = val ?? 0
    setValue('igstAmount', v)
    if (v > 0) {
      setValue('cgstAmount', 0)
      setValue('sgstAmount', 0)
    }
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const payload = {
        clientId:         data.clientId,
        invoiceId:        data.invoiceId || null,
        vendorId:         data.vendorId,
        billDate:         data.billDate?.format('YYYY-MM-DD'),
        vendorBillNumber: data.vendorBillNumber || null,
        amount:           Number(data.amount),
        cgstAmount:       Number(data.cgstAmount) || 0,
        sgstAmount:       Number(data.sgstAmount) || 0,
        igstAmount:       Number(data.igstAmount) || 0,
        tdsPercent:       Number(data.tdsPercent) || 0,
        notes:            data.notes || null,
      }

      if (isEdit) {
        await vendorBillApi.updateVendorBill(id, payload)
        message.success('Vendor bill updated')
      } else {
        await vendorBillApi.createVendorBill(payload)
        message.success('Vendor bill created')
      }
      navigate('/vendor-bills')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save vendor bill')
    } finally {
      setSubmitting(false)
    }
  }

  const fmt = v => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title={isEdit ? 'Edit Vendor Bill' : 'New Vendor Bill'}
        onBack={() => navigate('/vendor-bills')}
      />
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)} style={{ maxWidth: 900, margin: '0 auto' }}>

        <Card title="Bill Details" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Client" required validateStatus={errors.clientId && 'error'}
                help={errors.clientId?.message}>
                <Controller
                  name="clientId" control={control}
                  rules={{ required: 'Client is required' }}
                  render={({ field }) => (
                    <Select {...field} showSearch optionFilterProp="children" placeholder="Select client">
                      {clients.map(c => <Option key={c.id} value={c.id}>{c.clientName}</Option>)}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Vendor" required validateStatus={errors.vendorId && 'error'}
                help={errors.vendorId?.message}>
                <Controller
                  name="vendorId" control={control}
                  rules={{ required: 'Vendor is required' }}
                  render={({ field }) => (
                    <Select {...field} showSearch optionFilterProp="children" placeholder="Select vendor">
                      {vendors.map(v => <Option key={v.id} value={v.id}>{v.vendorName}</Option>)}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Link to Invoice (optional)">
                <Controller
                  name="invoiceId" control={control}
                  render={({ field }) => (
                    <Select {...field} allowClear showSearch optionFilterProp="children"
                      placeholder="Select invoice (optional)">
                      {invoices.map(inv => (
                        <Option key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} — {inv.clientName}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Vendor's Bill Number">
                <Controller
                  name="vendorBillNumber" control={control}
                  render={({ field }) => <Input {...field} placeholder="e.g. 25-26/INC/12/015" />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Bill Date" required validateStatus={errors.billDate && 'error'}
                help={errors.billDate?.message}>
                <Controller
                  name="billDate" control={control}
                  rules={{ required: 'Bill date is required' }}
                  render={({ field }) => (
                    <DatePicker {...field} format="DD/MM/YYYY" style={{ width: '100%' }} />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Amount (₹)" required validateStatus={errors.amount && 'error'}
                help={errors.amount?.message}>
                <Controller
                  name="amount" control={control}
                  rules={{ required: 'Amount is required', min: { value: 0.01, message: 'Must be > 0' } }}
                  render={({ field }) => (
                    <InputNumber
                      {...field} min={0} precision={2} style={{ width: '100%' }}
                      formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={v => v.replace(/₹\s?|(,*)/g, '')}
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="CGST (₹)">
                <Controller
                  name="cgstAmount" control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field} min={0} precision={2} style={{ width: '100%' }}
                      onChange={handleCgstChange}
                      formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={v => v.replace(/₹\s?|(,*)/g, '')}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="SGST (₹)">
                <Controller
                  name="sgstAmount" control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field} min={0} precision={2} style={{ width: '100%' }}
                      onChange={handleSgstChange}
                      formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={v => v.replace(/₹\s?|(,*)/g, '')}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="IGST (₹)">
                <Controller
                  name="igstAmount" control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field} min={0} precision={2} style={{ width: '100%' }}
                      onChange={handleIgstChange}
                      formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={v => v.replace(/₹\s?|(,*)/g, '')}
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ✅ CHANGED: Hindi → English */}
          <Text type="secondary" style={{ fontSize: 12 }}>
            Filling CGST will auto-mirror SGST and set IGST to 0.
            Filling IGST will set CGST and SGST to 0.
          </Text>

          <Divider />

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="TDS (%)">
                <Controller
                  name="tdsPercent" control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field} min={0} max={100} precision={2} style={{ width: '100%' }}
                      formatter={v => `${v}%`}
                      parser={v => v.replace('%', '')}
                    />
                  )}
                />
              </Form.Item>
              {/* ✅ CHANGED: Hindi → English */}
              <Text type="secondary" style={{ fontSize: 12 }}>
                TDS applies only on base Amount, not on GST.
              </Text>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Notes">
                <Controller
                  name="notes" control={control}
                  render={({ field }) => <Input.TextArea {...field} rows={2} />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Summary" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400, marginLeft: 'auto' }}>
            <Row justify="space-between"><Text>Amount</Text><Text>{fmt(amt)}</Text></Row>
            {c > 0 && <Row justify="space-between"><Text type="secondary">CGST</Text><Text type="secondary">{fmt(c)}</Text></Row>}
            {s > 0 && <Row justify="space-between"><Text type="secondary">SGST</Text><Text type="secondary">{fmt(s)}</Text></Row>}
            {i > 0 && <Row justify="space-between"><Text type="secondary">IGST</Text><Text type="secondary">{fmt(i)}</Text></Row>}
            <Row justify="space-between"><Text>Total GST</Text><Text>{fmt(gstTotal)}</Text></Row>
            <Divider style={{ margin: '4px 0' }} />
            <Row justify="space-between">
              <Text strong style={{ fontSize: 15 }}>Total Amount</Text>
              <Text strong style={{ fontSize: 15 }}>{fmt(totalAmount)}</Text>
            </Row>
            <Row justify="space-between">
              <Text style={{ color: '#ff4d4f' }}>TDS ({tp}% on Amount)</Text>
              <Text style={{ color: '#ff4d4f' }}>- {fmt(tdsAmount)}</Text>
            </Row>
            <Divider style={{ margin: '4px 0' }} />
            <Row justify="space-between">
              <Text strong style={{ fontSize: 16, color: '#0057FF' }}>Payable Amount</Text>
              <Text strong style={{ fontSize: 16, color: '#0057FF' }}>{fmt(payableAmount)}</Text>
            </Row>
          </div>
        </Card>

        <Card>
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {isEdit ? 'Update Vendor Bill' : 'Create Vendor Bill'}
            </Button>
            <Button onClick={() => navigate('/vendor-bills')}>Cancel</Button>
          </Space>
        </Card>
      </Form>
    </div>
  )
}

export default VendorBillFormPage