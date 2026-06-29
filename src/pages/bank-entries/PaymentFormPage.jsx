// src/pages/bank-entries/PaymentFormPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { Form, Button, DatePicker, InputNumber, Input, Switch, Card, Row, Col, Space, Divider, Typography, message } from 'antd'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import FormSelect from '../../components/common/FormSelect'
import { bankEntryApi } from '../../api/bankEntryApi'
import { vendorApi } from '../../api/vendorApi'
import { vendorBillApi } from '../../api/vendorBillApi'
import { bankApi } from '../../api/bankApi'

const { Text } = Typography

const TDS_RATES = [
  { label: 'No TDS (0%)', value: 0 },
  { label: '1% (Contractor)',     value: 1 },
  { label: '2% (Contractor HUF)', value: 2 },
  { label: '5% (Rent - Plant)',   value: 5 },
  { label: '10% (Professional)',  value: 10 },
  { label: '10% (Rent - Land)',   value: 10 },
  { label: '30% (Winning)',       value: 30 },
]

const PaymentFormPage = () => {
  const navigate = useNavigate()
  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      entryDate: dayjs(),
      isOnAccount: false,
      tdsRate: 0,
      tdsAmount: 0,
    }
  })

  const [vendors, setVendors] = useState([])
  const [bills,   setBills]   = useState([]  )
  const [banks,   setBanks]   = useState([])
  const [loadingBills, setLoadingBills] = useState(false)

  const selectedVendorId = watch('vendorId')
  const isOnAccount      = watch('isOnAccount')
  const grossAmount      = Number(watch('amount')) || 0
  const tdsRate          = Number(watch('tdsRate')) || 0
  const tdsAmount        = Number(watch('tdsAmount')) || 0
  const netPayable       = grossAmount - tdsAmount

  // Auto-calculate TDS amount when amount or rate changes
  useEffect(() => {
    if (tdsRate > 0 && grossAmount > 0) {
      const calculated = parseFloat((grossAmount * tdsRate / 100).toFixed(2))
      setValue('tdsAmount', calculated)
    } else if (tdsRate === 0) {
      setValue('tdsAmount', 0)
    }
  }, [grossAmount, tdsRate])

  useEffect(() => {
    vendorApi.getVendors({ page: 0, size: 1000 }).then(r => {
      const list = r.data?.data?.content ?? r.data?.data ?? []
      setVendors(Array.isArray(list) ? list : [])
    })
    bankApi.getBanks().then(r => {
      const list = r.data?.data
      setBanks(Array.isArray(list) ? list : [])
    })
  }, [])

  useEffect(() => {
    if (selectedVendorId) {
      setLoadingBills(true)
      vendorBillApi.getVendorBills({ vendorId: selectedVendorId, paymentStatus: 'UNPAID', page: 0, size: 1000 })
        .then(r => {
          const list = r.data?.data?.content ?? r.data?.data ?? []
          setBills(Array.isArray(list) ? list : [])
        })
        .finally(() => setLoadingBills(false))
      setValue('vendorBillId', null)
    } else {
      setBills([])
    }
  }, [selectedVendorId])

  const onSubmit = async (data) => {
    try {
      const payload = {
        entryDate:    data.entryDate?.format('YYYY-MM-DD'),
        amount:       data.amount,
        bankId:       data.bankId,
        vendorId:     data.vendorId,
        vendorBillId: data.isOnAccount ? null : data.vendorBillId,
        isOnAccount:  data.isOnAccount,
        remarks:      data.remarks,
        tdsRate:      data.tdsRate  || 0,
        tdsAmount:    data.tdsAmount || 0,
      }
      await bankEntryApi.createPayment(payload)
      message.success('Payment entry created')
      navigate('/bank-entries')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create payment')
    }
  }

  const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  return (
    <div>
      <PageHeader title="New Payment Entry" onBack={() => navigate('/bank-entries')} />
      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Row gutter={16}>
            <Col span={12}>
              <FormSelect
                name="vendorId" label="Vendor" control={control} error={errors.vendorId}
                options={vendors.map(v => ({ value: v.id, label: v.vendorName }))}
                required showSearch
              />
            </Col>
            <Col span={12}>
              <FormSelect
                name="bankId" label="Paying Bank" control={control} error={errors.bankId}
                options={banks.map(b => ({ value: b.id, label: `${b.bankName} - ${b.accountNumber}` }))}
                required
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Entry Date" required>
                <Controller name="entryDate" control={control}
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => (
                    <DatePicker {...field} format="DD/MM/YYYY" style={{ width: '100%' }} />
                  )} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Gross Amount (₹)" required
                validateStatus={errors.amount ? 'error' : ''} help={errors.amount?.message}>
                <Controller name="amount" control={control}
                  rules={{ required: 'Amount is required', min: { value: 1, message: 'Must be > 0' } }}
                  render={({ field }) => (
                    <InputNumber {...field} min={0} precision={2} style={{ width: '100%' }}
                      formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={v => v.replace(/₹\s?|(,*)/g, '')} />
                  )} />
              </Form.Item>
            </Col>
          </Row>

          {/* TDS Section */}
          <Card
            size="small"
            title={<Text strong style={{ color: '#1677ff' }}>TDS Deduction</Text>}
            style={{ marginBottom: 16, background: '#f6f8ff', border: '1px solid #d0e0ff' }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="TDS Rate">
                  <Controller name="tdsRate" control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        value={field.value}
                        onChange={e => field.onChange(Number(e.target.value))}
                        style={{
                          width: '100%', height: 32, borderRadius: 6,
                          border: '1px solid #d9d9d9', padding: '0 8px',
                          background: '#fff', fontSize: 14,
                        }}
                      >
                        {TDS_RATES.map((r, i) => (
                          <option key={i} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    )} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="TDS Amount (₹)" tooltip="Auto-calculated, can be edited manually">
                  <Controller name="tdsAmount" control={control}
                    render={({ field }) => (
                      <InputNumber {...field} min={0} precision={2} style={{ width: '100%' }}
                        formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={v => v.replace(/₹\s?|(,*)/g, '')} />
                    )} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Net Amount Payable">
                  <div style={{
                    padding: '4px 11px', height: 32, lineHeight: '22px',
                    background: '#fff7e6', border: '1px solid #ffd591',
                    borderRadius: 6, fontWeight: 700, color: '#d46b08',
                  }}>
                    {fmt(netPayable)}
                  </div>
                </Form.Item>
              </Col>
            </Row>
            {tdsAmount > 0 && (
              <div style={{ fontSize: 12, color: '#888', marginTop: -8 }}>
                ℹ️ Gross: {fmt(grossAmount)} — TDS: {fmt(tdsAmount)} — Net to vendor: {fmt(netPayable)}
                &nbsp;(TDS will be deposited to Govt by you)
              </div>
            )}
          </Card>

          <Row gutter={16} align="middle">
            <Col span={12}>
              <Form.Item label="On-Account (no specific bill)">
                <Controller name="isOnAccount" control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onChange={field.onChange} />
                  )} />
              </Form.Item>
            </Col>
            {!isOnAccount && (
              <Col span={12}>
                <FormSelect
                  name="vendorBillId" label="Link to Vendor Bill"
                  control={control} error={errors.vendorBillId}
                  options={bills.map(b => ({
                    value: b.id,
                    label: `${b.bookingReference} — ₹${Number(b.payableAmount).toLocaleString('en-IN')}`
                  }))}
                  loading={loadingBills} placeholder="Select vendor bill"
                />
              </Col>
            )}
          </Row>

          <Form.Item label="Remarks">
            <Controller name="remarks" control={control}
              render={({ field }) => <Input.TextArea {...field} rows={2} />} />
          </Form.Item>

          <Divider />
          {tdsAmount > 0 && (
            <div style={{ marginBottom: 12, padding: '8px 12px', background: '#fffbe6', borderRadius: 6, border: '1px solid #ffe58f' }}>
              <Text>Gross Amount: <strong>{fmt(grossAmount)}</strong></Text>
              <Text style={{ marginLeft: 24 }}>TDS ({tdsRate}%): <strong style={{ color: '#cf1322' }}>- {fmt(tdsAmount)}</strong></Text>
              <Text style={{ marginLeft: 24 }}>Net Payable: <strong style={{ color: '#389e0d' }}>{fmt(netPayable)}</strong></Text>
            </div>
          )}

          <Space>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>Save Payment</Button>
            <Button onClick={() => navigate('/bank-entries')}>Cancel</Button>
          </Space>
        </Form>
      </Card>
    </div>
  )
}

export default PaymentFormPage