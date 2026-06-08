import React, { useEffect } from 'react'
import { Card, Form, Input, Select, Row, Col, Button, Space, Divider } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useClients } from '../../../hooks/useClients'
import PageHeader from '../../../components/common/PageHeader'
import FileUpload from '../../../components/common/FileUpload'
import { INDIA_STATES } from '../../../utils/constants'
import { validatePAN, validateGST, validateMobile } from '../../../utils/validators'
import { uploadClientDoc } from '../../../api/clientApi'

const { Option } = Select

export default function ClientFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loadClient, saveClient, detail } = useClients()
  const [form] = Form.useForm()
  const isEdit = !!id

  useEffect(() => {
    if (isEdit) loadClient(id).then(data => { if (data) form.setFieldsValue(data) })
  }, [id])

  const onFinish = async (values) => {
    const ok = await saveClient(values, isEdit ? id : null)
    if (ok) navigate('/clients')
  }

  const handleDocUpload = async (file, docType) => {
    if (!id) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('docType', docType)
    await uploadClientDoc(id, formData)
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Client' : 'Add New Client'}
        subtitle={isEdit ? `Editing ${detail?.clientName || ''}` : 'Create a new client profile'}
        backUrl="/clients"
      />

      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">
        <Row gutter={24}>
          {/* Basic Info */}
          <Col xs={24} lg={16}>
            <Card title={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Basic Information</span>} style={{ marginBottom: 16, borderRadius: 'var(--radius-lg)' }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="clientName" label="Client Name" rules={[{ required: true }]}>
                    <Input placeholder="Legal name as per PAN" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="contactPerson" label="Contact Person">
                    <Input placeholder="Primary contact name" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="address" label="Address">
                    <Input.TextArea rows={2} placeholder="Full address" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="city" label="City">
                    <Input placeholder="City" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="state" label="State">
                    <Select
                      placeholder="Select state"
                      showSearch
                      optionFilterProp="children"
                      onChange={(_, opt) => form.setFieldValue('stateCode', opt?.key)}
                    >
                      {INDIA_STATES.map(s => (
                        <Option key={s.code} value={s.name}>{s.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={4}>
                  <Form.Item name="stateCode" label="State Code">
                    <Input placeholder="27" maxLength={4} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={4}>
                  <Form.Item name="pinCode" label="PIN Code">
                    <Input placeholder="400001" maxLength={10} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Tax & Contact Details</span>} style={{ borderRadius: 'var(--radius-lg)' }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="panNumber"
                    label="PAN Number"
                    rules={[
                      { required: true },
                      {
                        validator: (_, v) => {
                          const err = validatePAN(v)
                          return err ? Promise.reject(err) : Promise.resolve()
                        },
                      },
                    ]}
                  >
                    <Input placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="gstNumber"
                    label="GST Number"
                    rules={[{
                      validator: (_, v) => {
                        if (!v) return Promise.resolve()
                        const err = validateGST(v)
                        return err ? Promise.reject(err) : Promise.resolve()
                      },
                    }]}
                  >
                    <Input placeholder="27ABCDE1234F1Z5" maxLength={15} style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="mobile"
                    label="Mobile"
                    rules={[{
                      validator: (_, v) => {
                        const err = validateMobile(v)
                        return err ? Promise.reject(err) : Promise.resolve()
                      },
                    }]}
                  >
                    <Input placeholder="9876543210" maxLength={15} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Invalid email' }]}>
                    <Input placeholder="contact@company.com" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Documents */}
          <Col xs={24} lg={8}>
            <Card title={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Documents</span>} style={{ borderRadius: 'var(--radius-lg)', marginBottom: 16 }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 12, marginBottom: 16 }}>
                {isEdit ? 'Upload client documents below.' : 'Documents can be uploaded after creating the client.'}
              </p>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>PAN Card</p>
                  <FileUpload
                    label="Upload PAN"
                    onUpload={(file) => handleDocUpload(file, 'PAN')}
                    disabled={!isEdit}
                  />
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>GST Certificate</p>
                  <FileUpload
                    label="Upload GST"
                    onUpload={(file) => handleDocUpload(file, 'GST')}
                    disabled={!isEdit}
                  />
                </div>
              </Space>
            </Card>

            <Card style={{ borderRadius: 'var(--radius-lg)' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" htmlType="submit" block size="large" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  {isEdit ? 'Update Client' : 'Create Client'}
                </Button>
                <Button block onClick={() => navigate('/clients')} style={{ fontFamily: 'var(--font-body)' }}>
                  Cancel
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}