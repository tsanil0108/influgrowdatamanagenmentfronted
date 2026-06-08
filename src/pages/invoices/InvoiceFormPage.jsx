import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import {
  Form, Button, DatePicker, InputNumber, Select, Card,
  Row, Col, Space, Divider, Table, message, Alert, Typography
} from 'antd'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import FormSelect from '../../components/common/FormSelect'
import GSTBreakdownCard from '../../components/forms/GSTBreakdownCard'
import { invoiceApi } from '../../api/invoiceApi'
import { estimateApi } from '../../api/estimateApi'

const { Option } = Select
const { Text } = Typography

const InvoiceFormPage = () => {
  const navigate = useNavigate()
  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      invoice_date: dayjs(),
      due_date: dayjs().add(30, 'day'),
      gst_type: 'CGST_SGST',
      cgst_rate: 9,
      sgst_rate: 9,
      igst_rate: 18,
      line_items: [],
    }
  })

  const { fields, replace } = useFieldArray({ control, name: 'line_items' })

  const [estimates, setEstimates] = useState([])
  const [loadingEstimate, setLoadingEstimate] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const watchedItems = watch('line_items')
  const gstType = watch('gst_type')
  const cgstRate = watch('cgst_rate')
  const sgstRate = watch('sgst_rate')
  const igstRate = watch('igst_rate')
  const selectedEstimateId = watch('estimate_id')

  const subtotal = watchedItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const cgstAmt = gstType === 'CGST_SGST' ? subtotal * (cgstRate / 100) : 0
  const sgstAmt = gstType === 'CGST_SGST' ? subtotal * (sgstRate / 100) : 0
  const igstAmt = gstType === 'IGST' ? subtotal * (igstRate / 100) : 0
  const totalAmount = subtotal + cgstAmt + sgstAmt + igstAmt

  useEffect(() => {
    estimateApi.getEstimates({ status: 'APPROVED' })
      .then(r => setEstimates(r.data || []))
  }, [])

  useEffect(() => {
    if (selectedEstimateId) {
      setLoadingEstimate(true)
      estimateApi.getEstimateById(selectedEstimateId).then(r => {
        const e = r.data
        setValue('client_id', e.client_id)
        setValue('campaign_id', e.campaign_id)
        setValue('gst_type', e.gst_type)
        setValue('cgst_rate', e.cgst_rate)
        setValue('sgst_rate', e.sgst_rate)
        setValue('igst_rate', e.igst_rate)
        replace(e.line_items || [])
      }).finally(() => setLoadingEstimate(false))
    }
  }, [selectedEstimateId])

  const lineItemColumns = [
    { title: '#', key: 'idx', width: 40, render: (_, __, i) => i + 1 },
    { title: 'Activity', dataIndex: 'activity_name', key: 'activity_name' },
    {
      title: 'Amount (₹)', key: 'amount', width: 160,
      render: (_, __, index) => (
        <Controller
          name={`line_items.${index}.amount`}
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              min={0}
              precision={2}
              style={{ width: '100%' }}
              formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={v => v.replace(/₹\s?|(,*)/g, '')}
            />
          )}
        />
      ),
    },
  ]

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        invoice_date: data.invoice_date?.format('YYYY-MM-DD'),
        due_date: data.due_date?.format('YYYY-MM-DD'),
        subtotal,
        cgst_amount: cgstAmt,
        sgst_amount: sgstAmt,
        igst_amount: igstAmt,
        total_amount: totalAmount,
      }
      await invoiceApi.createInvoice(payload)
      message.success('Invoice created')
      navigate('/invoices')
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create invoice')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <PageHeader title="New Invoice" onBack={() => navigate('/invoices')} />
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Card style={{ marginBottom: 16 }}>
          <Alert
            message="Select an approved estimate to auto-populate all fields. You can then modify amounts."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Row gutter={16}>
            <Col span={12}>
              <FormSelect
                name="estimate_id"
                label="Source Estimate"
                control={control}
                error={errors.estimate_id}
                options={estimates.map(e => ({ value: e.id, label: `${e.estimate_number} — ${e.client_name}` }))}
                required
                showSearch
              />
            </Col>
            <Col span={12}>
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item label="Invoice Date" required>
                    <Controller
                      name="invoice_date"
                      control={control}
                      render={({ field }) => <DatePicker {...field} format="DD/MM/YYYY" style={{ width: '100%' }} />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Due Date">
                    <Controller
                      name="due_date"
                      control={control}
                      render={({ field }) => <DatePicker {...field} format="DD/MM/YYYY" style={{ width: '100%' }} />}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        {fields.length > 0 && (
          <Card title="Line Items (editable)" style={{ marginBottom: 16 }}>
            <Table
              dataSource={fields}
              columns={lineItemColumns}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loadingEstimate}
            />
          </Card>
        )}

        {fields.length > 0 && (
          <Card>
            <GSTBreakdownCard
              subtotal={subtotal}
              gstType={gstType}
              cgstRate={cgstRate}
              sgstRate={sgstRate}
              igstRate={igstRate}
              cgstAmount={cgstAmt}
              sgstAmount={sgstAmt}
              igstAmount={igstAmt}
              totalAmount={totalAmount}
            />
            <Divider />
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>Create Invoice</Button>
              <Button onClick={() => navigate('/invoices')}>Cancel</Button>
            </Space>
          </Card>
        )}
      </Form>
    </div>
  )
}

export default InvoiceFormPage