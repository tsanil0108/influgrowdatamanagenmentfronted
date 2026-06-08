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
    defaultValues: { entry_date: dayjs(), is_on_account: false }
  })

  const [vendors, setVendors] = useState([])
  const [bills, setBills] = useState([])
  const [banks, setBanks] = useState([])
  const [loadingBills, setLoadingBills] = useState(false)

  const selectedVendorId = watch('vendor_id')
  const isOnAccount = watch('is_on_account')

  useEffect(() => {
    vendorApi.getVendors().then(r => setVendors(r.data || []))
    bankApi.getBanks().then(r => setBanks(r.data || []))
  }, [])

  useEffect(() => {
    if (selectedVendorId) {
      setLoadingBills(true)
      vendorBillApi.getVendorBills({ vendor_id: selectedVendorId, payment_status: 'UNPAID' })
        .then(r => setBills(r.data || []))
        .finally(() => setLoadingBills(false))
      setValue('vendor_bill_id', null)
    } else {
      setBills([])
    }
  }, [selectedVendorId])

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        entry_type: 'PAYMENT',
        entry_date: data.entry_date?.format('YYYY-MM-DD'),
      }
      await bankEntryApi.createPayment(payload)
      message.success('Payment entry created')
      navigate('/bank-entries')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create payment')
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <PageHeader title="New Payment Entry" onBack={() => navigate('/bank-entries')} />
      <Card>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Row gutter={16}>
            <Col span={12}>
              <FormSelect
                name="vendor_id"
                label="Vendor"
                control={control}
                error={errors.vendor_id}
                options={vendors.map(v => ({ value: v.id, label: v.vendor_name }))}
                required
                showSearch
              />
            </Col>
            <Col span={12}>
              <FormSelect
                name="bank_id"
                label="Paying Bank"
                control={control}
                error={errors.bank_id}
                options={banks.map(b => ({ value: b.id, label: `${b.bank_name} - ${b.account_number}` }))}
                required
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Entry Date" required>
                <Controller
                  name="entry_date"
                  control={control}
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => (
                    <DatePicker {...field} format="DD/MM/YYYY" style={{ width: '100%' }} />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Amount (₹)" required
                validateStatus={errors.amount ? 'error' : ''}
                help={errors.amount?.message}>
                <Controller
                  name="amount"
                  control={control}
                  rules={{ required: 'Amount is required', min: { value: 1, message: 'Must be > 0' } }}
                  render={({ field }) => (
                    <InputNumber {...field} min={0} precision={2} style={{ width: '100%' }}
                      formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={v => v.replace(/₹\s?|(,*)/g, '')} />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle">
            <Col span={12}>
              <Form.Item label="On-Account (no specific bill)">
                <Controller
                  name="is_on_account"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onChange={field.onChange} />
                  )}
                />
              </Form.Item>
            </Col>
            {!isOnAccount && (
              <Col span={12}>
                <FormSelect
                  name="vendor_bill_id"
                  label="Link to Vendor Bill"
                  control={control}
                  error={errors.vendor_bill_id}
                  options={bills.map(b => ({
                    value: b.id,
                    label: `${b.booking_reference} — ₹${Number(b.payable_amount).toLocaleString('en-IN')}`
                  }))}
                  loading={loadingBills}
                  placeholder="Select vendor bill"
                />
              </Col>
            )}
          </Row>

          <Form.Item label="Remarks">
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => <Input.TextArea {...field} rows={2} />}
            />
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