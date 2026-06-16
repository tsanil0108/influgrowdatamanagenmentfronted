import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button, Card, Col, Form, Row, Space, App } from 'antd'
import PageHeader from '../../../components/common/PageHeader'
import FormInput from '../../../components/common/FormInput'
import { bankApi } from '../../../api/bankApi'

const BankFormPage = () => {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { id }   = useParams()
  const isEdit   = Boolean(id)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    if (isEdit) {
      bankApi.getBankById(id).then(res => {
        const b = res.data?.data
        if (b) {
          setValue('bankName',      b.bankName)
          setValue('accountNumber', b.accountNumber)
          setValue('ifscCode',      b.ifscCode)
          setValue('branchAddress', b.branchAddress)
        }
      }).catch(err => {
        message.error('Failed to load bank details')
        console.error(err)
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
    <div>
      <PageHeader
        title={isEdit ? 'Edit Bank Account' : 'Add Bank Account'}
        onBack={() => navigate('/banks')}
      />
      <Card style={{ maxWidth: 700, margin: '0 auto' }}>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Row gutter={16}>
            <Col span={12}>
              <FormInput
                name="bankName"
                label="Bank Name"
                register={register('bankName', { required: 'Bank name is required' })}
                error={errors.bankName}
                required
                placeholder="e.g. HDFC Bank"
              />
            </Col>
            <Col span={12}>
              <FormInput
                name="accountNumber"
                label="Account Number"
                register={register('accountNumber', { required: 'Account number is required' })}
                error={errors.accountNumber}
                required
                placeholder="Enter account number"
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <FormInput
                name="ifscCode"
                label="IFSC Code"
                register={register('ifscCode', {
                  pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC format' }
                })}
                error={errors.ifscCode}
                placeholder="e.g. HDFC0001234"
                maxLength={11}
              />
            </Col>
            <Col span={12}>
              <FormInput
                name="branchAddress"
                label="Branch Address"
                register={register('branchAddress')}
                error={errors.branchAddress}
                placeholder="Full branch address"
              />
            </Col>
          </Row>
          <Space style={{ marginTop: 8 }}>
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