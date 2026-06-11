import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Col, Form, Input, Row, Space, DatePicker, Select, message } from 'antd'
import dayjs from 'dayjs'
import PageHeader from '../../../components/common/PageHeader'
import { campaignApi } from '../../../api/campaignApi'
import { getClients } from '../../../api/clientApi'

const { Option } = Select

const CampaignFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form] = Form.useForm()
  const [clients, setClients] = useState([])

  useEffect(() => {
    getClients({ page: 0, size: 100 }).then(r => {
      const data = r.data?.data?.content ?? []
      setClients(data)
    })
  }, [])

  useEffect(() => {
    if (isEdit) {
      campaignApi.getCampaignById(id).then(r => {
        const c = r.data?.data
        form.setFieldsValue({
          clientId:     c.clientId,
          campaignName: c.campaignName,
          startDate:    c.startDate ? dayjs(c.startDate) : null,
          endDate:      c.endDate   ? dayjs(c.endDate)   : null,
        })
      })
    }
  }, [id])

  const onFinish = async (values) => {
    const payload = {
      clientId:     values.clientId,
      campaignName: values.campaignName,
      startDate:    values.startDate?.format('YYYY-MM-DD'),
      endDate:      values.endDate?.format('YYYY-MM-DD'),
    }
    try {
      if (isEdit) {
        await campaignApi.updateCampaign(id, payload)
        message.success('Campaign updated')
      } else {
        await campaignApi.createCampaign(payload)
        message.success('Campaign created')
      }
      navigate('/campaigns')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save campaign')
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <PageHeader title={isEdit ? 'Edit Campaign' : 'New Campaign'} onBack={() => navigate('/campaigns')} />
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>

          <Form.Item name="clientId" label="Client" rules={[{ required: true, message: 'Please select a client' }]}>
            <Select showSearch placeholder="Select client" optionFilterProp="children">
              {clients.map(c => <Option key={c.id} value={c.id}>{c.clientName}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="campaignName" label="Campaign Name" rules={[{ required: true, message: 'Campaign name is required' }]}>
            <Input placeholder="Enter campaign name" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="Start Date" rules={[{ required: true, message: 'Start date is required' }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="End Date" rules={[{ required: true, message: 'End date is required' }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Space>
            <Button type="primary" htmlType="submit">
              {isEdit ? 'Update' : 'Save'}
            </Button>
            <Button onClick={() => navigate('/campaigns')}>Cancel</Button>
          </Space>

        </Form>
      </Card>
    </div>
  )
}

export default CampaignFormPage