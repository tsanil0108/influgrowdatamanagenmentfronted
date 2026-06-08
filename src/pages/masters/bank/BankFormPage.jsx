import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button, Card, Col, Form, Row, Space, message } from 'antd'
import PageHeader from '../../../components/common/PageHeader'
import FormInput from '../../../components/common/FormInput'
import { bankApi } from '../../../api/bankApi'

const BankFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    if (isEdit) {
      bankApi.getBankById(id).then(r => {
        const b = r.data
        Object.keys(b).forEach(k => setValue(k, b[k]))
      })
    }
  }, [id])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await bankApi.updateBank(id, data)
        message.success('Bank account updated')
      } else {
        await bankApi.createBank(data)
        message.success('Bank account added')
      }
      navigate('/banks')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save bank')
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <PageHeader title={isEdit ? 'Edit Bank Account' : 'Add Bank Account'} onBack={() => navigate('/banks')} />
      <Card>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Row gutter={16}>
            <Col span={12}>
              <FormInput
                name="bank_name"
                label="Bank Name"
                register={register('bank_name', { required: 'Bank name is required' })}
                error={errors.bank_name}
                required
                placeholder="e.g. HDFC Bank"
              />
            </Col>
            <Col span={12}>
              <FormInput
                name="account_number"
                label="Account Number"
                register={register('account_number', { required: 'Account number is required' })}
                error={errors.account_number}
                required
                placeholder="Enter account number"
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <FormInput
                name="ifsc_code"
                label="IFSC Code"
                register={register('ifsc_code', {
                  pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC format' }
                })}
                error={errors.ifsc_code}
                placeholder="e.g. HDFC0001234"
                maxLength={11}
              />
            </Col>
          </Row>
          <FormInput
            name="branch_address"
            label="Branch Address"
            register={register('branch_address')}
            error={errors.branch_address}
            placeholder="Full branch address"
          />

          <Space>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {isEdit ? 'Update' : 'Save'}
            </Button>
            <Button onClick={() => navigate('/banks')}>Cancel</Button>
          </Space>
        </Form>
      </Card>
    </div>
  )
}

export default BankFormPage