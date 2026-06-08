import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import {
  Form, Button, DatePicker, InputNumber, Input, Card, Row, Col,
  Space, message, Divider, Typography
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
  const navigate = useNavigate()
  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { bill_date: dayjs(), tds_percent: 0 }
  })

  const [clients, setClients] = useState([])
  const [invoices, setInvoices] = useState([])
  const [vendors, setVendors] = useState([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

  const selectedClientId = watch('client_id')
  const amount = watch('amount') || 0
  const gstAmount = watch('gst_amount') || 0
  const tdsPercent = watch('tds_percent') || 0
  const totalAmount = Number(amount) + Number(gstAmount)
  const tdsAmount = totalAmount * (Number(tdsPercent) / 100)
  const payableAmount = totalAmount - tdsAmount

  useEffect(() => {
    clientApi.getClients().then(r => setClients(r.data || []))
    vendorApi.getVendors().then(r => setVendors(r.data || []))
  }, [])

  useEffect(() => {
    if (selectedClientId) {
      setLoadingInvoices(true)
      invoiceApi.getInvoices({ client_id: selectedClientId })
        .then(r => setInvoices(r.data || []))
        .finally(() => setLoadingInvoices(false))
      setValue('invoice_id', null)
    }
  }, [selectedClientId])

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        bill_date: data.bill_date?.format('YYYY-MM-DD'),
        total_amount: totalAmount,
        tds_amount: tdsAmount,
        payable_amount: payableAmount,
      }
      await vendorBillApi.createVendorBill(payload)
      message.success('Vendor bill created')
      navigate('/vendor-bills')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create vendor bill')
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <PageHeader title="New Vendor Bill" onBack={() => navigate('/vendor-bills')} />
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Card title="Linking" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <FormSelect
                name="client_id"
                label="Client"
                control={control}
                error={errors.client_id}
                options={clients.map(c => ({ value: c.id, label: c.client_name }))}
                required
                showSearch
              />
            </Col>
            <Col span={12}>
              <FormSelect
                name="invoice_id"
                label="Linked Invoice"
                control={control}
                error={errors.invoice_id}
                options={invoices.map(i => ({ value: i.id, label: `${i.invoice_number} (${i.status})` }))}
                loading={loadingInvoices}
                required
              />
            </Col>
          </Row>
          <FormSelect
            name="vendor_id"
            label="Vendor"
            control={control}
            error={errors.vendor_id}
            options={vendors.map(v => ({ value: v.id, label: v.vendor_name }))}
            required
            showSearch
          />
        </Card>

        <Card title="Bill Details" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Bill Date" required>
                <Controller
                  name="bill_date"
                  control={control}
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => <DatePicker {...field} format="DD/MM/YYYY" style={{ width: '100%' }} />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <FormInput
                name="vendor_bill_number"
                label="Vendor's Bill Number"
                register={register('vendor_bill_number')}
                error={errors.vendor_bill_number}
                placeholder="Vendor's own reference"
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Amount (₹)" required
                validateStatus={errors.amount ? 'error' : ''} help={errors.amount?.message}>
                <Controller
                  name="amount"
                  control={control}
                  rules={{ required: 'Amount is required' }}
                  render={({ field }) => (
                    <InputNumber {...field} min={0} precision={2} style={{ width: '100%' }}
                      formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={v => v.replace(/₹\s?|(,*)/g, '')} />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="GST Amount (₹)">
                <Controller
                  name="gst_amount"
                  control={control}
                  render={({ field }) => (
                    <InputNumber {...field} min={0} precision={2} style={{ width: '100%' }}
                      formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={v => v.replace(/₹\s?|(,*)/g, '')} />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="TDS (%)">
                <Controller
                  name="tds_percent"
                  control={control}
                  render={({ field }) => (
                    <InputNumber {...field} min={0} max={100} precision={2} style={{ width: '100%' }}
                      formatter={v => `${v}%`} parser={v => v.replace('%', '')} />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Row justify="end">
            <Col span={10}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {[
                  ['Amount', amount],
                  ['GST', gstAmount],
                  ['Total', totalAmount],
                  ['TDS Deduction', -tdsAmount],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">{label}</Text>
                    <Text>{val < 0 ? '-' : ''}₹{Math.abs(Number(val)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
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
          <Button type="primary" htmlType="submit" loading={isSubmitting}>Create Vendor Bill</Button>
          <Button onClick={() => navigate('/vendor-bills')}>Cancel</Button>
        </Space>
      </Form>
    </div>
  )
}

export default VendorBillFormPage