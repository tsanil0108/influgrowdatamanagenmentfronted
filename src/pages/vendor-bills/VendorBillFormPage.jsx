import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import {
  Form, Button, DatePicker, InputNumber, Card, Row, Col,
  Space, message, Divider, Typography, Spin
} from 'antd'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import FormInput from '../../components/common/FormInput'
import FormSelect from '../../components/common/FormSelect'
import { vendorBillApi } from '../../api/vendorBillApi'
import { clientApi } from '../../api/clientApi'
import { invoiceApi } from '../../api/invoiceApi'
import { vendorApi } from '../../api/vendorApi'

const { Text } = Typography

const VendorBillFormPage = () => {
  const navigate  = useNavigate()
  const { id }    = useParams()          // ← edit mode me id milega
  const isEdit    = Boolean(id)

  const { register, control, handleSubmit, watch, setValue, reset,
    formState: { errors, isSubmitting } } = useForm({
    defaultValues: { billDate: dayjs(), tdsPercent: 0 }
  })

  const [clients,         setClients]         = useState([])
  const [invoices,        setInvoices]        = useState([])
  const [vendors,         setVendors]         = useState([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [loadingData,     setLoadingData]     = useState(false)

  const selectedClientId = watch('clientId')
  const amount        = Number(watch('amount')     || 0)
  const gstAmount     = Number(watch('gstAmount')  || 0)
  const tdsPercent    = Number(watch('tdsPercent') || 0)
  const totalAmount   = amount + gstAmount
  const tdsAmount     = totalAmount * (tdsPercent / 100)
  const payableAmount = totalAmount - tdsAmount

  // ── 1. Clients + Vendors load karo ──────────────────────────
  useEffect(() => {
    clientApi.getClients({ page: 0, size: 1000 }).then(r => {
      const list = r.data?.data?.content ?? r.data?.data ?? []
      setClients(Array.isArray(list) ? list : [])
    })
    vendorApi.getVendors({ page: 0, size: 1000 }).then(r => {
      const list = r.data?.data?.content ?? r.data?.data ?? []
      setVendors(Array.isArray(list) ? list : [])
    })
  }, [])

  // ── 2. Edit mode — existing bill data prefill karo ──────────
  useEffect(() => {
    if (!isEdit) return
    setLoadingData(true)
    vendorBillApi.getVendorBillById(id)
      .then(r => {
        const bill = r.data?.data ?? r.data
        // Invoices for this client load karo
        if (bill.clientId) {
          invoiceApi.getInvoices({ clientId: bill.clientId, page: 0, size: 1000 })
            .then(ir => {
              const list = ir.data?.data?.content ?? ir.data?.data ?? []
              setInvoices(Array.isArray(list) ? list : [])
            })
        }
        // Form me existing values set karo
        reset({
          clientId:         bill.clientId,
          invoiceId:        bill.invoiceId,
          vendorId:         bill.vendorId,
          vendorBillNumber: bill.vendorBillNumber,
          billDate:         bill.billDate ? dayjs(bill.billDate) : dayjs(),
          amount:           bill.amount,
          gstAmount:        bill.gstAmount,
          tdsPercent:       bill.tdsPercent,
        })
      })
      .catch(() => message.error('Failed to load vendor bill'))
      .finally(() => setLoadingData(false))
  }, [id])

  // ── 3. Client change hone pe invoices reload karo ───────────
  useEffect(() => {
    if (!selectedClientId) return
    // Edit mode me initial load already ho chuka hai — skip karo
    if (isEdit && loadingData) return

    setLoadingInvoices(true)
    invoiceApi.getInvoices({ clientId: selectedClientId, page: 0, size: 1000 })
      .then(r => {
        const list = r.data?.data?.content ?? r.data?.data ?? []
        setInvoices(Array.isArray(list) ? list : [])
      })
      .finally(() => setLoadingInvoices(false))

    // Sirf create mode me invoiceId reset karo
    if (!isEdit) setValue('invoiceId', null)
  }, [selectedClientId])

  // ── 4. Submit ────────────────────────────────────────────────
  const onSubmit = async (data) => {
    try {
      const payload = {
        clientId:         data.clientId,
        invoiceId:        data.invoiceId,
        vendorId:         data.vendorId,
        vendorBillNumber: data.vendorBillNumber,
        billDate:         data.billDate?.format('YYYY-MM-DD'),
        amount,
        gstAmount,
        tdsPercent,
        totalAmount,
        tdsAmount,
        payableAmount,
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
      message.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} vendor bill`)
    }
  }

  if (loadingData) {
    return (
      <div style={{ padding: 24, textAlign: 'center', paddingTop: 80 }}>
        <Spin size="large" tip="Loading vendor bill..." />
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <PageHeader
        title={isEdit ? 'Edit Vendor Bill' : 'New Vendor Bill'}
        onBack={() => navigate('/vendor-bills')}
      />
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>

        <Card title="Linking" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <FormSelect name="clientId" label="Client" control={control} error={errors.clientId}
                options={clients.map(c => ({ value: c.id, label: c.clientName }))}
                required showSearch placeholder="Select client" />
            </Col>
            <Col span={12}>
              <FormSelect name="invoiceId" label="Linked Invoice" control={control} error={errors.invoiceId}
                options={invoices.map(i => ({ value: i.id, label: `${i.invoiceNumber} (${i.status})` }))}
                loading={loadingInvoices} placeholder="Select invoice" />
            </Col>
          </Row>
          <FormSelect name="vendorId" label="Vendor" control={control} error={errors.vendorId}
            options={vendors.map(v => ({ value: v.id, label: v.vendorName }))}
            required showSearch placeholder="Select vendor" />
        </Card>

        <Card title="Bill Details" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Bill Date" required>
                <Controller name="billDate" control={control} rules={{ required: 'Date is required' }}
                  render={({ field }) => (
                    <DatePicker {...field} format="DD/MM/YYYY" style={{ width: '100%' }} />
                  )} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <FormInput name="vendorBillNumber" label="Vendor's Bill Number"
                register={register('vendorBillNumber')} error={errors.vendorBillNumber}
                placeholder="Vendor's own reference" />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Amount (₹)" required
                validateStatus={errors.amount ? 'error' : ''} help={errors.amount?.message}>
                <Controller name="amount" control={control} rules={{ required: 'Amount is required' }}
                  render={({ field }) => (
                    <InputNumber {...field} min={0} precision={2} style={{ width: '100%' }}
                      formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={v => v.replace(/₹\s?|(,*)/g, '')} />
                  )} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="GST Amount (₹)">
                <Controller name="gstAmount" control={control}
                  render={({ field }) => (
                    <InputNumber {...field} min={0} precision={2} style={{ width: '100%' }}
                      formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={v => v.replace(/₹\s?|(,*)/g, '')} />
                  )} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="TDS (%)">
                <Controller name="tdsPercent" control={control}
                  render={({ field }) => (
                    <InputNumber {...field} min={0} max={100} precision={2} style={{ width: '100%' }}
                      formatter={v => `${v}%`} parser={v => v.replace('%', '')} />
                  )} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Row justify="end">
            <Col span={10}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {[['Amount', amount], ['GST', gstAmount], ['Total', totalAmount], ['TDS Deduction', -tdsAmount]]
                  .map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">{label}</Text>
                      <Text>{val < 0 ? '-' : ''}₹{Math.abs(Number(val))
                        .toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                    </div>
                  ))}
                <Divider style={{ margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Payable Amount</Text>
                  <Text strong style={{ color: '#0057FF' }}>
                    ₹{payableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>

        <Space>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {isEdit ? 'Update Vendor Bill' : 'Create Vendor Bill'}
          </Button>
          <Button onClick={() => navigate('/vendor-bills')}>Cancel</Button>
        </Space>
      </Form>
    </div>
  )
}

export default VendorBillFormPage