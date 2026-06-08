import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { Button, Card, Col, Form, Row, Space, DatePicker, message } from 'antd'
import dayjs from 'dayjs'
import PageHeader from '../../../components/common/PageHeader'
import FormInput from '../../../components/common/FormInput'
import FormSelect from '../../../components/common/FormSelect'
import { campaignApi } from '../../../api/campaignApi'
import { clientApi } from '../../../api/clientApi'

const CampaignFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm()
  const [clients, setClients] = useState([])

  useEffect(() => {
    clientApi.getClients().then(r => setClients(r.data || []))
  }, [])

  useEffect(() => {
    if (isEdit) {
      campaignApi.getCampaignById(id).then(r => {
        const c = r.data
        setValue('campaign_name', c.campaign_name)
        setValue('client_id', c.client_id)
        if (c.start_date) setValue('start_date', dayjs(c.start_date))
        if (c.end_date) setValue('end_date', dayjs(c.end_date))
      })
    }
  }, [id])

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        start_date: data.start_date?.format('YYYY-MM-DD'),
        end_date: data.end_date?.format('YYYY-MM-DD'),
      }
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
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <FormSelect
            name="client_id"
            label="Client"
            control={control}
            error={errors.client_id}
            options={clients.map(c => ({ value: c.id, label: c.client_name }))}
            required
            showSearch
          />
          <FormInput
            name="campaign_name"
            label="Campaign Name"
            register={register('campaign_name', { required: 'Campaign name is required' })}
            error={errors.campaign_name}
            required
            placeholder="Enter campaign name"
          />
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Start Date" required>
                <Controller
                  name="start_date"
                  control={control}
                  rules={{ required: 'Start date is required' }}
                  render={({ field }) => (
                    <DatePicker {...field} format="DD/MM/YYYY" style={{ width: '100%' }} />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="End Date" required>
                <Controller
                  name="end_date"
                  control={control}
                  rules={{ required: 'End date is required' }}
                  render={({ field }) => (
                    <DatePicker {...field} format="DD/MM/YYYY" style={{ width: '100%' }} />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Space>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
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