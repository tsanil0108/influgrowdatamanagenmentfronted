// src/pages/bank-entries/PaymentFormPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { Form, Button, DatePicker, InputNumber, Input, Switch, Card, Row, Col, Space, message } from 'antd'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import FormSelect from '../../components/common/FormSelect'
import { bankEntryApi } from '../../api/bankEntryApi'
import { vendorApi } from '../../api/vendorApi'
import { vendorBillApi } from '../../api/vendorBillApi'
import { bankApi } from '../../api/bankApi'

const PaymentFormPage = () => {
  const navigate = useNavigate()
  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { entryDate: dayjs(), isOnAccount: false }
  })

  const [vendors, setVendors] = useState([])
  const [bills,   setBills]   = useState([])
  const [banks,   setBanks]   = useState([])
  const [loadingBills, setLoadingBills] = useState(false)

  const selectedVendorId = watch('vendorId')
  const isOnAccount      = watch('isOnAccount')

  useEffect(() => {
    // Vendors: { success, message, data: { content: [...], totalElements } }
    vendorApi.getVendors({ page: 0, size: 1000 }).then(r => {
      const list = r.data?.data?.content ?? r.data?.data ?? []
      setVendors(Array.isArray(list) ? list : [])
    })
    // Banks: { success, message, data: [...] }
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
      }
      await bankEntryApi.createPayment(payload)
      message.success('Payment entry created')
      navigate('/bank-entries')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create payment')
    }
  }

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
              <Form.Item label="Amount (₹)" required
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