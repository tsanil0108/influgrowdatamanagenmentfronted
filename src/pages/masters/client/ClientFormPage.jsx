// src/pages/masters/client/ClientFormPage.jsx
import React, { useEffect, useState } from 'react'
import { Card, Form, Input, Select, Row, Col, Button, Space, Divider, Tag, Alert } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useClients } from '../../../hooks/useClients'
import PageHeader from '../../../components/common/PageHeader'
import FileUpload from '../../../components/common/FileUpload'
import { getDocUrl } from '../../../utils/fileUtils'
import { INDIA_STATES } from '../../../utils/constants'
import { validatePAN, validateGST, validateMobile } from '../../../utils/validators'
import { uploadClientDoc } from '../../../api/clientApi'

const { Option } = Select

export default function ClientFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loadClient, saveClient, detail } = useClients()
  const [form] = Form.useForm()
  const [existingDocs, setExistingDocs] = useState([])
  const [clientCodeError, setClientCodeError] = useState('')
  const isEdit = !!id

  useEffect(() => {
    if (isEdit) {
      loadClient(id).then(data => {
        if (data) {
          form.setFieldsValue({
            ...data,
            clientCode: data.clientCode // Show existing code but disabled
          })
          setExistingDocs(data.documents || [])
        }
      })
    }
  }, [id])

  const onFinish = async (values) => {
    // ✅ Client Code validation for new clients
    if (!isEdit) {
      if (!values.clientCode) {
        setClientCodeError('Client Code is required')
        form.setFields([{
          name: 'clientCode',
          errors: ['Client Code is required']
        }])
        return
      }
      
      // ✅ Format validation
      const code = values.clientCode.toUpperCase()
      if (!/^[A-Z0-9]{2,10}$/.test(code)) {
        setClientCodeError('Client code must be 2-10 alphanumeric characters (A-Z, 0-9)')
        form.setFields([{
          name: 'clientCode',
          errors: ['Client code must be 2-10 alphanumeric characters (A-Z, 0-9)']
        }])
        return
      }
      
      // Clear any previous errors
      setClientCodeError('')
    }
    
    const ok = await saveClient(values, isEdit ? id : null)
    if (ok) navigate('/clients')
  }

  const handleDocUpload = async (file, docType) => {
    if (!id) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('docType', docType)
    await uploadClientDoc(id, formData)
    const data = await loadClient(id)
    if (data) setExistingDocs(data.documents || [])
  }

  // ✅ Handle client code change - auto uppercase and remove special chars
  const handleClientCodeChange = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10) // Max 10 characters
    form.setFieldsValue({ clientCode: value })
    setClientCodeError('')
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Client' : 'Add New Client'}
        subtitle={isEdit ? `Editing ${detail?.clientName || ''}` : 'Create a new client profile'}
        backUrl="/clients"
      />
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card
              title={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Basic Information</span>}
              style={{ marginBottom: 16, borderRadius: 'var(--radius-lg)' }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="clientName" 
                    label="Client Name" 
                    rules={[{ required: true, message: 'Client name is required' }]}
                  >
                    <Input placeholder="Legal name as per PAN" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="clientCode" 
                    label="Client Code" 
                    rules={[
                      { required: !isEdit, message: 'Client code is required' },
                      { pattern: /^[A-Z0-9]{2,10}$/, message: '2-10 alphanumeric characters (A-Z, 0-9)' }
                    ]}
                    tooltip="Unique code for client (e.g. THA01, ANI13, KIN01). Cannot be changed after creation."
                    validateStatus={clientCodeError ? 'error' : ''}
                    help={clientCodeError || '2-10 alphanumeric characters (A-Z, 0-9)'}
                  >
                    <Input 
                      placeholder="Enter unique client code" 
                      disabled={isEdit}
                      onChange={handleClientCodeChange}
                      style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600 }}
                      maxLength={10}
                    />
                  </Form.Item>
                  {isEdit && (
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      Client code cannot be changed after creation
                    </div>
                  )}
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="contactPerson" label="Contact Person">
                    <Input placeholder="Primary contact name" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Address is required' }]}>
                    <Input.TextArea rows={2} placeholder="Full address" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="city" label="City" rules={[{ required: true, message: 'City is required' }]}>
                    <Input placeholder="City" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="state" label="State" rules={[{ required: true, message: 'State is required' }]}>
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
                  <Form.Item name="stateCode" label="State Code" rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="27" maxLength={4} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={4}>
                  <Form.Item name="pinCode" label="PIN Code" rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="400001" maxLength={10} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
            <Card
              title={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Tax & Contact Details</span>}
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="panNumber"
                    label="PAN Number"
                    rules={[
                      { required: true, message: 'PAN number is required' },
                      { validator: (_, v) => { const err = validatePAN(v); return err ? Promise.reject(err) : Promise.resolve() } },
                    ]}
                  >
                    <Input placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="gstNumber"
                    label="GST Number"
                    rules={[
                      { validator: (_, v) => { if (!v) return Promise.resolve(); const err = validateGST(v); return err ? Promise.reject(err) : Promise.resolve() } },
                    ]}
                  >
                    <Input placeholder="27ABCDE1234F1Z5" maxLength={15} style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="mobile"
                    label="Mobile"
                    rules={[
                      { validator: (_, v) => { if (!v) return Promise.resolve(); const err = validateMobile(v); return err ? Promise.reject(err) : Promise.resolve() } },
                    ]}
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
          <Col xs={24} lg={8}>
            <Card
              title={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Documents</span>}
              style={{ borderRadius: 'var(--radius-lg)', marginBottom: 16 }}
            >
              <p style={{ color: 'var(--color-text-muted)', fontSize: 12, marginBottom: 16 }}>
                {isEdit ? 'Manage and upload client documents below.' : 'Documents can be uploaded after creating the client.'}
              </p>
              {existingDocs.length > 0 && (
                <>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                    Uploaded Documents
                  </p>
                  <Space direction="vertical" style={{ width: '100%', marginBottom: 12 }}>
                    {existingDocs.map(doc => (
                      <div
                        key={doc.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#f6f8fa',
                          borderRadius: 8,
                          border: '1px solid #e2e6f0',
                        }}
                      >
                        <Space size={8}>
                          <span style={{ fontSize: 16 }}>📄</span>
                          <div>
                            <Tag color="blue" style={{ marginBottom: 2 }}>{doc.docType}</Tag>
                            <div style={{ fontSize: 12, color: '#555', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {doc.fileName}
                            </div>
                          </div>
                        </Space>
                        <a
                          href={getDocUrl(doc.downloadUrl)}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12, color: 'var(--color-primary, #1677ff)', whiteSpace: 'nowrap' }}
                        >
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
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>PAN Card</p>
                  <FileUpload label="Upload PAN" onUpload={(file) => handleDocUpload(file, 'PAN')} disabled={!isEdit} />
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>GST Certificate</p>
                  <FileUpload label="Upload GST" onUpload={(file) => handleDocUpload(file, 'GST')} disabled={!isEdit} />
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