// src/pages/masters/vendor/VendorFormPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Col, Form, Input, Row, Space, Select, message, Divider, Tag, Alert } from 'antd'
import PageHeader from '../../../components/common/PageHeader'
import FileUpload from '../../../components/common/FileUpload'
import { vendorApi } from '../../../api/vendorApi'
import { INDIA_STATES } from '../../../utils/constants'
import { getDocUrl } from '../../../utils/fileUtils'

const { Option } = Select

const VendorFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form] = Form.useForm()
  const [existingDocs, setExistingDocs] = useState([])
  const [vendorCodeError, setVendorCodeError] = useState('')

  useEffect(() => {
    if (isEdit) {
      vendorApi.getVendorById(id).then(r => {
        const data = r.data?.data
        if (data) {
          form.setFieldsValue({
            vendorName:     data.vendorName,
            vendorCode:     data.vendorCode,  // ✅ Show existing code
            contactPerson:  data.contactPerson,
            mobile:         data.mobile,
            email:          data.email,
            address:        data.address,
            city:           data.city,
            state:          data.state,
            stateCode:      data.stateCode,
            pinCode:        data.pinCode,
            panNumber:      data.panNumber,
            gstNumber:      data.gstNumber,
            bankName:       data.bankName,
            accountNumber:  data.accountNumber,
            ifscCode:       data.ifscCode,
          })
          setExistingDocs(data.documents || [])
        }
      }).catch(() => message.error('Failed to load vendor'))
    }
  }, [id])

  const handleStateChange = (stateName) => {
    const matched = INDIA_STATES.find(s => s.name === stateName)
    if (matched?.code) {
      form.setFieldsValue({ stateCode: matched.code })
    }
  }

  // ✅ Handle vendor code change - auto uppercase and remove special chars
  const handleVendorCodeChange = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10)
    form.setFieldsValue({ vendorCode: value })
    setVendorCodeError('')
  }

  const onFinish = async (values) => {
    // ✅ Vendor Code validation for new vendors
    if (!isEdit) {
      if (!values.vendorCode) {
        setVendorCodeError('Vendor Code is required')
        form.setFields([{
          name: 'vendorCode',
          errors: ['Vendor Code is required']
        }])
        return
      }
      
      const code = values.vendorCode.toUpperCase()
      if (!/^[A-Z0-9]{2,10}$/.test(code)) {
        setVendorCodeError('Vendor code must be 2-10 alphanumeric characters (A-Z, 0-9)')
        form.setFields([{
          name: 'vendorCode',
          errors: ['Vendor code must be 2-10 alphanumeric characters (A-Z, 0-9)']
        }])
        return
      }
      
      setVendorCodeError('')
    }

    const payload = {
      vendorName:     values.vendorName,
      vendorCode:     values.vendorCode,  // ✅ Send vendor code
      contactPerson:  values.contactPerson,
      mobile:         values.mobile,
      email:          values.email,
      address:        values.address,
      city:           values.city,
      state:          values.state,
      stateCode:      values.stateCode,
      pinCode:        values.pinCode,
      panNumber:      values.panNumber,
      gstNumber:      values.gstNumber,
      bankName:       values.bankName,
      accountNumber:  values.accountNumber,
      ifscCode:       values.ifscCode,
      isActive:       true,
    }

    try {
      if (isEdit) {
        await vendorApi.updateVendor(id, payload)
        message.success('Vendor updated successfully')
      } else {
        await vendorApi.createVendor(payload)
        message.success('Vendor added successfully')
      }
      navigate('/vendors')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save vendor')
    }
  }

  const handleDocUpload = async (file, docType) => {
    if (!id) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('docType', docType)
    try {
      await vendorApi.uploadDocument(id, formData)
      message.success(`${docType} uploaded successfully`)
      const r = await vendorApi.getVendorById(id)
      setExistingDocs(r.data?.data?.documents || [])
    } catch {
      message.error('Upload failed')
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <PageHeader title={isEdit ? 'Edit Vendor' : 'Add Vendor'} onBack={() => navigate('/vendors')} />
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card title="Basic Information" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    name="vendorName" 
                    label="Vendor Name" 
                    rules={[{ required: true, message: 'Vendor name is required' }]}
                  >
                    <Input placeholder="Vendor Name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    name="vendorCode" 
                    label="Vendor Code" 
                    rules={[
                      { required: !isEdit, message: 'Vendor code is required' },
                      { pattern: /^[A-Z0-9]{2,10}$/, message: '2-10 alphanumeric characters (A-Z, 0-9)' }
                    ]}
                    tooltip="Unique code for vendor (e.g. VEN01, SUP02). Cannot be changed after creation."
                    validateStatus={vendorCodeError ? 'error' : ''}
                    help={vendorCodeError || '2-10 alphanumeric characters (A-Z, 0-9)'}
                  >
                    <Input 
                      placeholder="Enter unique vendor code" 
                      disabled={isEdit}
                      onChange={handleVendorCodeChange}
                      style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600 }}
                      maxLength={10}
                    />
                  </Form.Item>
                  {isEdit && (
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      Vendor code cannot be changed after creation
                    </div>
                  )}
                </Col>
                <Col span={12}>
                  <Form.Item name="contactPerson" label="Contact Person">
                    <Input placeholder="Contact Person" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="mobile" label="Mobile" rules={[{ pattern: /^[6-9]\d{9}$/, message: 'Invalid mobile' }]}>
                    <Input placeholder="9876543210" maxLength={10} />
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
                <Input.TextArea rows={2} />
              </Form.Item>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name="city" label="City"><Input /></Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="state" label="State">
                    <Select
                      showSearch
                      optionFilterProp="children"
                      placeholder="Select state"
                      allowClear
                      onChange={handleStateChange}
                    >
                      {INDIA_STATES.map(s => <Option key={s.code} value={s.name}>{s.name}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="stateCode"
                    label="State Code"
                    rules={[{ pattern: /^\d{1,2}$/, message: 'Must be 1-2 digits' }]}
                  >
                    <Input maxLength={2} placeholder="e.g. 27" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="pinCode" label="PIN Code" rules={[{ pattern: /^\d{6}$/, message: 'Must be 6 digits' }]}>
                    <Input maxLength={6} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Tax Information" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="panNumber" label="PAN Number">
                    <Input placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="gstNumber" label="GST Number">
                    <Input placeholder="27ABCDE1234F1Z5" maxLength={15} style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Bank Details" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="bankName" label="Bank Name"><Input /></Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="accountNumber" label="Account Number"><Input /></Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="ifscCode" label="IFSC Code">
                    <Input maxLength={11} style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Right column - Documents */}
          <Col xs={24} lg={8}>
            <Card title="Documents" style={{ marginBottom: 16 }}>
              <p style={{ color: '#aaa', fontSize: 12, marginBottom: 16 }}>
                {isEdit ? 'Manage vendor documents below.' : 'Documents can be uploaded after creating the vendor.'}
              </p>

              {existingDocs.length > 0 && (
                <>
                  <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Uploaded Documents</p>
                  <Space direction="vertical" style={{ width: '100%', marginBottom: 12 }}>
                    {existingDocs.map(doc => (
                      <div key={doc.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', background: '#f6f8fa', borderRadius: 8, border: '1px solid #e2e6f0',
                      }}>
                        <Space size={8}>
                          <span>📄</span>
                          <div>
                            <Tag color="blue">{doc.docType}</Tag>
                            <div style={{ fontSize: 12, color: '#555', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {doc.fileName}
                            </div>
                          </div>
                        </Space>
                        <a href={getDocUrl(doc.downloadUrl)} target="_blank" rel="noreferrer"
                          style={{ fontSize: 12, color: '#1677ff', whiteSpace: 'nowrap' }}>
                          Download
                        </a>
                      </div>
                    ))}
                  </Space>
                  <Divider style={{ margin: '12px 0' }} />
                </>
              )}

              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>PAN Card</p>
                  <FileUpload label="Upload PAN" onUpload={(file) => handleDocUpload(file, 'PAN')} disabled={!isEdit} />
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>GST Certificate</p>
                  <FileUpload label="Upload GST" onUpload={(file) => handleDocUpload(file, 'GST')} disabled={!isEdit} />
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Bank Proof</p>
                  <FileUpload label="Upload Bank Proof" onUpload={(file) => handleDocUpload(file, 'BANK_PROOF')} disabled={!isEdit} />
                </div>
              </Space>
            </Card>

            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" htmlType="submit" block size="large">
                  {isEdit ? 'Update Vendor' : 'Add Vendor'}
                </Button>
                <Button block onClick={() => navigate('/vendors')}>Cancel</Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default VendorFormPage