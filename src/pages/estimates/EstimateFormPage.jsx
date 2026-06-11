// src/pages/estimates/EstimateFormPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import {
  Form, Button, Card, Col, Row, Space, Input,
  InputNumber, DatePicker, Select, Divider, message, Typography
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import FormSelect from '../../components/common/FormSelect'
import { estimateApi } from '../../api/estimateApi'
import { clientApi } from '../../api/clientApi'
import { campaignApi } from '../../api/campaignApi'

const { Text } = Typography
const { Option } = Select

const GST_RATE = 18
const CGST_SGST_RATE = 9

const EstimateFormPage = () => {
  const navigate = useNavigate()
  const { id }   = useParams()
  const isEdit   = Boolean(id)

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      clientId:     null,
      campaignId:   null,
      estimateDate: dayjs(),
      gstType:      'CGST_SGST',
      notes:        '',
      lineItems:    [{ activityName: '', hsnCode: '', description: '', amount: 0 }],
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' })

  const [clients,   setClients]   = useState([])
  const [campaigns, setCampaigns] = useState([])

  const lineItems = watch('lineItems')
  const gstType   = watch('gstType')

  const subtotal   = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const cgstAmount = gstType === 'CGST_SGST' ? subtotal * CGST_SGST_RATE / 100 : 0
  const sgstAmount = gstType === 'CGST_SGST' ? subtotal * CGST_SGST_RATE / 100 : 0
  const igstAmount = gstType === 'IGST'       ? subtotal * GST_RATE / 100       : 0
  const total      = subtotal + cgstAmount + sgstAmount + igstAmount

  useEffect(() => {
    clientApi.getClients({ page: 0, size: 1000 }).then(r => {
      const list = r.data?.data?.content ?? r.data?.data ?? []
      setClients(Array.isArray(list) ? list : [])
    })
    campaignApi.getCampaigns({ page: 0, size: 1000 }).then(r => {
      const list = r.data?.data?.content ?? r.data?.data ?? []
      setCampaigns(Array.isArray(list) ? list : [])
    })
  }, [])

  useEffect(() => {
    if (isEdit) {
      estimateApi.getEstimateById(id).then(r => {
        const e = r.data?.data
        if (!e) return
        setValue('clientId',     e.clientId)
        setValue('campaignId',   e.campaignId)
        setValue('estimateDate', e.estimateDate ? dayjs(e.estimateDate) : dayjs())
        setValue('gstType',      e.gstType)
        setValue('notes',        e.notes || '')
        setValue('lineItems',    e.lineItems?.map(li => ({
          activityName: li.activityName,
          hsnCode:      li.hsnCode || '',
          description:  li.description,
          amount:       Number(li.amount),
        })) || [])
      }).catch(() => message.error('Failed to load estimate'))
    }
  }, [id])

  const onSubmit = async (data) => {
    try {
      const payload = {
        clientId:     data.clientId,
        campaignId:   data.campaignId || null,
        estimateDate: data.estimateDate?.format('YYYY-MM-DD'),
        gstType:      data.gstType,
        notes:        data.notes,
        lineItems:    data.lineItems.map((li, idx) => ({
          activityName: li.activityName,
          hsnCode:      li.hsnCode || null,
          description:  li.description,
          amount:       Number(li.amount),
          sortOrder:    idx,
        })),
      }
      if (isEdit) {
        await estimateApi.updateEstimate(id, payload)
        message.success('Estimate updated')
      } else {
        await estimateApi.createEstimate(payload)
        message.success('Estimate created')
      }
      navigate('/estimates')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save estimate')
    }
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Estimate' : 'New Estimate'}
        onBack={() => navigate('/estimates')}
      />
      <Card style={{ maxWidth: 960, margin: '0 auto' }}>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>

          {/* Basic Info */}
          <Row gutter={16}>
            <Col span={12}>
              <FormSelect
                name="clientId" label="Client" control={control} error={errors.clientId}
                options={clients.map(c => ({ value: c.id, label: c.clientName }))}
                required showSearch placeholder="Select client"
              />
            </Col>
            <Col span={12}>
              <FormSelect
                name="campaignId" label="Campaign (optional)" control={control}
                options={campaigns.map(c => ({ value: c.id, label: c.campaignName }))}
                placeholder="Select campaign"
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Estimate Date" required>
                <Controller name="estimateDate" control={control}
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => (
                    <DatePicker {...field} format="DD/MM/YYYY" style={{ width: '100%' }} />
                  )} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="GST Type" required>
                <Controller name="gstType" control={control}
                  render={({ field }) => (
                    <Select {...field} style={{ width: '100%' }}>
                      <Option value="CGST_SGST">CGST + SGST (9% + 9%)</Option>
                      <Option value="IGST">IGST (18%)</Option>
                    </Select>
                  )} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Notes">
            <Controller name="notes" control={control}
              render={({ field }) => (
                <Input.TextArea {...field} rows={2} placeholder="Internal notes or terms" />
              )} />
          </Form.Item>

          <Divider>Line Items</Divider>

          {/* Line Items Header */}
          <Row gutter={8} style={{ marginBottom: 8 }}>
            <Col span={5}><Text strong>Activity Name</Text></Col>
            <Col span={4}><Text strong>HSN Code</Text></Col>
            <Col span={8}><Text strong>Description</Text></Col>
            <Col span={4}><Text strong>Amount (₹)</Text></Col>
            <Col span={3}></Col>
          </Row>

          {fields.map((field, index) => (
            <Row gutter={8} key={field.id} style={{ marginBottom: 8 }} align="middle">
              <Col span={5}>
                <Controller name={`lineItems.${index}.activityName`} control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <Input {...field} placeholder="e.g. Instagram Reels"
                      status={errors.lineItems?.[index]?.activityName ? 'error' : ''} />
                  )} />
              </Col>
              <Col span={4}>
                <Controller name={`lineItems.${index}.hsnCode`} control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="e.g. 998361" maxLength={8} />
                  )} />
              </Col>
              <Col span={8}>
                <Controller name={`lineItems.${index}.description`} control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Description" />
                  )} />
              </Col>
              <Col span={4}>
                <Controller name={`lineItems.${index}.amount`} control={control}
                  rules={{ required: 'Required', min: { value: 0, message: 'Min 0' } }}
                  render={({ field }) => (
                    <InputNumber {...field} min={0} precision={2} style={{ width: '100%' }}
                      formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={v => v.replace(/₹\s?|(,*)/g, '')}
                      status={errors.lineItems?.[index]?.amount ? 'error' : ''} />
                  )} />
              </Col>
              <Col span={3} style={{ textAlign: 'center' }}>
                {fields.length > 1 && (
                  <Button danger size="small" icon={<DeleteOutlined />}
                    onClick={() => remove(index)} />
                )}
              </Col>
            </Row>
          ))}

          <Button type="dashed" icon={<PlusOutlined />} onClick={() =>
            append({ activityName: '', hsnCode: '', description: '', amount: 0 })
          } style={{ width: '100%', marginBottom: 16 }}>
            Add Line Item
          </Button>

          {/* Totals */}
          <Divider />
          <Row justify="end">
            <Col span={10}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Subtotal</Text>
                  <Text>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </div>
                {gstType === 'CGST_SGST' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>CGST (9%)</Text>
                      <Text>₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>SGST (9%)</Text>
                      <Text>₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>IGST (18%)</Text>
                    <Text>₹{igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                  </div>
                )}
                <Divider style={{ margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 16 }}>Total</Text>
                  <Text strong style={{ fontSize: 16, color: '#0057FF' }}>
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>

          <Divider />
          <Space>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {isEdit ? 'Update Estimate' : 'Create Estimate'}
            </Button>
            <Button onClick={() => navigate('/estimates')}>Cancel</Button>
          </Space>

        </Form>
      </Card>
    </div>
  )
}

export default EstimateFormPage