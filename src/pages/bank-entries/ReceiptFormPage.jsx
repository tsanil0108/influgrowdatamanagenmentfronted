// src/pages/bank-entries/ReceiptFormPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { Form, Button, DatePicker, InputNumber, Input, Switch, Card, Row, Col, Space, message } from 'antd'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import FormSelect from '../../components/common/FormSelect'
import { bankEntryApi } from '../../api/bankEntryApi'
import { clientApi } from '../../api/clientApi'
import { invoiceApi } from '../../api/invoiceApi'
import { bankApi } from '../../api/bankApi'

const ReceiptFormPage = () => {
  const navigate = useNavigate()
  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { entryDate: dayjs(), isOnAccount: false }
  })

  const [clients,  setClients]  = useState([])
  const [invoices, setInvoices] = useState([])
  const [banks,    setBanks]    = useState([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

  const selectedClientId = watch('clientId')
  const isOnAccount      = watch('isOnAccount')

  useEffect(() => {
    // Clients: { success, message, data: { content: [...] } }
    clientApi.getClients({ page: 0, size: 1000 }).then(r => {
      const list = r.data?.data?.content ?? r.data?.data ?? []
      setClients(Array.isArray(list) ? list : [])
    })
    // Banks: { success, message, data: [...] }
    bankApi.getBanks().then(r => {
      const list = r.data?.data
      setBanks(Array.isArray(list) ? list : [])
    })
  }, [])

  useEffect(() => {
    if (selectedClientId) {
      setLoadingInvoices(true)
      invoiceApi.getInvoices({ clientId: selectedClientId, status: 'UNPAID,PARTIAL', page: 0, size: 1000 })
        .then(r => {
          const list = r.data?.data?.content ?? r.data?.data ?? []
          setInvoices(Array.isArray(list) ? list : [])
        })
        .finally(() => setLoadingInvoices(false))
      setValue('invoiceId', null)
    } else {
      setInvoices([])
    }
  }, [selectedClientId])

  const onSubmit = async (data) => {
    try {
      const payload = {
        entryDate:   data.entryDate?.format('YYYY-MM-DD'),
        amount:      data.amount,
        bankId:      data.bankId,
        clientId:    data.clientId,
        invoiceId:   data.isOnAccount ? null : data.invoiceId,
        isOnAccount: data.isOnAccount,
        remarks:     data.remarks,
      }
      await bankEntryApi.createReceipt(payload)
      message.success('Receipt entry created')
      navigate('/bank-entries')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create receipt')
    }
  }

  return (
    <div>
      <PageHeader title="New Receipt Entry" onBack={() => navigate('/bank-entries')} />
      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Row gutter={16}>
            <Col span={12}>
              <FormSelect
                name="clientId" label="Client" control={control} error={errors.clientId}
                options={clients.map(c => ({ value: c.id, label: c.clientName }))}
                required showSearch
              />
            </Col>
            <Col span={12}>
              <FormSelect
                name="bankId" label="Receiving Bank" control={control} error={errors.bankId}
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
              <Form.Item label="On-Account (no specific invoice)">
                <Controller name="isOnAccount" control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onChange={field.onChange} />
                  )} />
              </Form.Item>
            </Col>
            {!isOnAccount && (
              <Col span={12}>
                <FormSelect
                  name="invoiceId" label="Link to Invoice"
                  control={control} error={errors.invoiceId}
                  options={invoices.map(i => ({
                    value: i.id,
                    label: `${i.invoiceNumber} — ₹${Number(i.totalAmount).toLocaleString('en-IN')} (${i.status})`
                  }))}
                  loading={loadingInvoices} placeholder="Select invoice"
                />
              </Col>
            )}
          </Row>

          <Form.Item label="Remarks">
            <Controller name="remarks" control={control}
              render={({ field }) => <Input.TextArea {...field} rows={2} />} />
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