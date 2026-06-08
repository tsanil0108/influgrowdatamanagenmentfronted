import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { Form, Button, DatePicker, InputNumber, Input, Card, Row, Col, Space, message } from 'antd'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import FormSelect from '../../components/common/FormSelect'
import { bankEntryApi } from '../../api/bankEntryApi'
import { bankApi } from '../../api/bankApi'

const ContraFormPage = () => {
  const navigate = useNavigate()
  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { entry_date: dayjs() }
  })

  const [banks, setBanks] = useState([])
  const sourceBankId = watch('bank_id')

  useEffect(() => {
    bankApi.getBanks().then(r => setBanks(r.data || []))
  }, [])

  const destinationBanks = banks.filter(b => b.id !== sourceBankId)

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        entry_type: 'CONTRA',
        entry_date: data.entry_date?.format('YYYY-MM-DD'),
      }
      await bankEntryApi.createContra(payload)
      message.success('Contra entry created')
      navigate('/bank-entries')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create contra entry')
    }
  }

  const bankOptions = banks.map(b => ({
    value: b.id,
    label: `${b.bank_name} — ${b.account_number}`
  }))

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <PageHeader title="New Contra Entry" onBack={() => navigate('/bank-entries')} />
      <Card>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Row gutter={16}>
            <Col span={12}>
              <FormSelect
                name="bank_id"
                label="Source Bank"
                control={control}
                error={errors.bank_id}
                options={bankOptions}
                required
              />
            </Col>
            <Col span={12}>
              <FormSelect
                name="to_bank_id"
                label="Destination Bank"
                control={control}
                error={errors.to_bank_id}
                options={destinationBanks.map(b => ({
                  value: b.id,
                  label: `${b.bank_name} — ${b.account_number}`
                }))}
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

          <Form.Item label="Remarks">
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => <Input.TextArea {...field} rows={2} placeholder="Transfer reason or reference" />}
            />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>Save Contra</Button>
            <Button onClick={() => navigate('/bank-entries')}>Cancel</Button>
          </Space>
        </Form>
      </Card>
    </div>
  )
}

export default ContraFormPage