import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { Form, Button, Select, DatePicker, InputNumber, Input, Switch, Card, Row, Col, Space, message } from 'antd'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import FormSelect from '../../components/common/FormSelect'
import { bankEntryApi } from '../../api/bankEntryApi'
import { clientApi } from '../../api/clientApi'
import { invoiceApi } from '../../api/invoiceApi'
import { bankApi } from '../../api/bankApi'

const { Option } = Select

const ReceiptFormPage = () => {
  const navigate = useNavigate()
  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { entry_date: dayjs(), is_on_account: false }
  })

  const [clients, setClients] = useState([])
  const [invoices, setInvoices] = useState([])
  const [banks, setBanks] = useState([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

  const selectedClientId = watch('client_id')
  const isOnAccount = watch('is_on_account')

  useEffect(() => {
    clientApi.getClients().then(r => setClients(r.data || []))
    bankApi.getBanks().then(r => setBanks(r.data || []))
  }, [])

  useEffect(() => {
    if (selectedClientId) {
      setLoadingInvoices(true)
      invoiceApi.getInvoices({ client_id: selectedClientId, status: 'UNPAID,PARTIAL' })
        .then(r => setInvoices(r.data || []))
        .finally(() => setLoadingInvoices(false))
      setValue('invoice_id', null)
    } else {
      setInvoices([])
    }
  }, [selectedClientId])

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        entry_type: 'RECEIPT',
        entry_date: data.entry_date?.format('YYYY-MM-DD'),
      }
      await bankEntryApi.createReceipt(payload)
      message.success('Receipt entry created')
      navigate('/bank-entries')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create receipt')
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <PageHeader title="New Receipt Entry" onBack={() => navigate('/bank-entries')} />
      <Card>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
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
                name="bank_id"
                label="Receiving Bank"
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
              <Form.Item label="On-Account (no specific invoice)">
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
                  name="invoice_id"
                  label="Link to Invoice"
                  control={control}
                  error={errors.invoice_id}
                  options={invoices.map(i => ({
                    value: i.id,
                    label: `${i.invoice_number} — ₹${Number(i.total_amount).toLocaleString('en-IN')} (${i.status})`
                  }))}
                  loading={loadingInvoices}
                  placeholder="Select invoice"
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
            <Button type="primary" htmlType="submit" loading={isSubmitting}>Save Receipt</Button>
            <Button onClick={() => navigate('/bank-entries')}>Cancel</Button>
          </Space>
        </Form>
      </Card>
    </div>
  )
}

export default ReceiptFormPage