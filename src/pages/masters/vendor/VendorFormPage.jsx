import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Col, Form, Input, Row, Space, Select, message } from 'antd'
import PageHeader from '../../../components/common/PageHeader'
import { vendorApi } from '../../../api/vendorApi'
import { INDIA_STATES } from '../../../utils/constants'

const { Option } = Select

const VendorFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form] = Form.useForm()

  useEffect(() => {
    if (isEdit) {
      vendorApi.getVendorById(id).then(r => {
        form.setFieldsValue(r.data?.data)
      }).catch(() => message.error('Failed to load vendor'))
    }
  }, [id])

  const onFinish = async (values) => {
    const payload = {
      vendorName:    values.vendor_name,
      contactPerson: values.contact_person,
      mobile:        values.mobile,
      email:         values.email,
      address:       values.address,
      city:          values.city,
      state:         values.state,
      pinCode:       values.pin_code,
      panNumber:     values.pan_number,
      gstNumber:     values.gst_number,
      bankName:      values.bank_name,
      accountNumber: values.account_number,
      ifscCode:      values.ifsc_code,
      isActive:      true,
    }
    try {
      if (isEdit) {
        await vendorApi.updateVendor(id, payload)
        message.success('Vendor updated')
      } else {
        await vendorApi.createVendor(payload)
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
      <Form form={form} layout="vertical" onFinish={onFinish}>

        <Card title="Basic Information" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="vendor_name" label="Vendor Name" rules={[{ required: true, message: 'Vendor name is required' }]}>
                <Input placeholder="Vendor Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contact_person" label="Contact Person">
                <Input placeholder="Contact Person" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="mobile" label="Mobile" rules={[{ pattern: /^[6-9]\d{9}$/, message: 'Invalid mobile number' }]}>
                <Input placeholder="10-digit mobile" maxLength={10} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Invalid email' }]}>
                <Input placeholder="email@example.com" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Address" style={{ marginBottom: 16 }}>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} placeholder="Full address" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="city" label="City">
                <Input placeholder="City" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="state" label="State">
                <Select showSearch optionFilterProp="children" placeholder="Select state" allowClear>
                  {INDIA_STATES.map(s => <Option key={s.code} value={s.name}>{s.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pin_code" label="PIN Code" rules={[{ pattern: /^\d{6}$/, message: 'Must be 6 digits' }]}>
                <Input placeholder="400001" maxLength={6} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Tax Information" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pan_number" label="PAN Number" rules={[{ pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format' }]}>
                <Input placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gst_number" label="GST Number" rules={[{ pattern: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invalid GST format' }]}>
                <Input placeholder="27ABCDE1234F1Z5" maxLength={15} style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Bank Details" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bank_name" label="Bank Name">
                <Input placeholder="Bank Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="account_number" label="Account Number">
                <Input placeholder="Account Number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ifsc_code" label="IFSC Code" rules={[{ pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC' }]}>
                <Input placeholder="HDFC0001234" maxLength={11} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Space>
          <Button type="primary" htmlType="submit">
            {isEdit ? 'Update Vendor' : 'Add Vendor'}
          </Button>
          <Button onClick={() => navigate('/vendors')}>Cancel</Button>
        </Space>
      </Form>
    </div>
  )
}

export default VendorFormPage