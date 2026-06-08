import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { Button, Card, Col, Form, Row, Space, Select, message, Divider } from 'antd'
import PageHeader from '../../../components/common/PageHeader'
import FormInput from '../../../components/common/FormInput'
import { vendorApi } from '../../../api/vendorApi'
import { INDIA_STATES } from '../../../utils/constants'

const { Option } = Select

const VendorFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { is_active: true }
  })

  useEffect(() => {
    if (isEdit) {
      vendorApi.getVendorById(id).then(r => {
        const v = r.data
        Object.keys(v).forEach(k => setValue(k, v[k]))
      })
    }
  }, [id])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await vendorApi.updateVendor(id, data)
        message.success('Vendor updated')
      } else {
        await vendorApi.createVendor(data)
        message.success('Vendor added')
      }
      navigate('/vendors')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save vendor')
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <PageHeader title={isEdit ? 'Edit Vendor' : 'Add Vendor'} onBack={() => navigate('/vendors')} />
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Card title="Basic Information" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <FormInput name="vendor_name" label="Vendor Name"
                register={register('vendor_name', { required: 'Vendor name is required' })}
                error={errors.vendor_name} required />
            </Col>
            <Col span={12}>
              <FormInput name="contact_person" label="Contact Person"
                register={register('contact_person')} error={errors.contact_person} />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <FormInput name="mobile" label="Mobile"
                register={register('mobile', {
                  pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile number' }
                })}
                error={errors.mobile} placeholder="10-digit mobile" maxLength={10} />
            </Col>
            <Col span={12}>
              <FormInput name="email" label="Email"
                register={register('email', {
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                })}
                error={errors.email} type="email" />
            </Col>
          </Row>
        </Card>

        <Card title="Address" style={{ marginBottom: 16 }}>
          <FormInput name="address" label="Address"
            register={register('address')} error={errors.address} />
          <Row gutter={16}>
            <Col span={8}>
              <FormInput name="city" label="City" register={register('city')} error={errors.city} />
            </Col>
            <Col span={8}>
              <Form.Item label="State">
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} showSearch optionFilterProp="children" placeholder="Select state" allowClear>
                      {INDIA_STATES.map(s => <Option key={s.code} value={s.name}>{s.name}</Option>)}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <FormInput name="pin_code" label="PIN Code"
                register={register('pin_code', {
                  pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' }
                })}
                error={errors.pin_code} maxLength={6} />
            </Col>
          </Row>
        </Card>

        <Card title="Tax Information" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <FormInput name="pan_number" label="PAN Number"
                register={register('pan_number', {
                  pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format' }
                })}
                error={errors.pan_number} maxLength={10} placeholder="ABCDE1234F" />
            </Col>
            <Col span={12}>
              <FormInput name="gst_number" label="GST Number"
                register={register('gst_number', {
                  pattern: { value: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invalid GST format' }
                })}
                error={errors.gst_number} maxLength={15} placeholder="27ABCDE1234F1Z5" />
            </Col>
          </Row>
        </Card>

        <Card title="Bank Details" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <FormInput name="bank_name" label="Bank Name"
                register={register('bank_name')} error={errors.bank_name} />
            </Col>
            <Col span={12}>
              <FormInput name="account_number" label="Account Number"
                register={register('account_number')} error={errors.account_number} />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <FormInput name="ifsc_code" label="IFSC Code"
                register={register('ifsc_code', {
                  pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC' }
                })}
                error={errors.ifsc_code} maxLength={11} placeholder="HDFC0001234" />
            </Col>
          </Row>
        </Card>

        <Space>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {isEdit ? 'Update Vendor' : 'Add Vendor'}
          </Button>
          <Button onClick={() => navigate('/vendors')}>Cancel</Button>
        </Space>
      </Form>
    </div>
  )
}

export default VendorFormPage