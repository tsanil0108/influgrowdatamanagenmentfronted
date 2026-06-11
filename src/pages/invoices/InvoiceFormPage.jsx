// src/pages/invoices/InvoiceFormPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import {
  Form, Button, DatePicker, InputNumber, Card,
  Row, Col, Space, Divider, Table, message, Alert, Typography
} from 'antd'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import FormSelect from '../../components/common/FormSelect'
import GSTBreakdownCard from '../../components/forms/GSTBreakdownCard'
import { invoiceApi } from '../../api/invoiceApi'
import { estimateApi, getEstimateById } from '../../api/estimateApi'
import { clientApi } from '../../api/clientApi'

const { Text } = Typography

const InvoiceFormPage = () => {
  const navigate = useNavigate()
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      clientId:    null,
      estimateId:  null,
      invoiceDate: dayjs(),
      dueDate:     dayjs().add(30, 'day'),
      lineItems:   [],
    }
  })

  const { fields, replace } = useFieldArray({ control, name: 'lineItems' })

  const [estimates,       setEstimates]       = useState([])
  const [clients,         setClients]         = useState([])
  const [loadingEstimate, setLoadingEstimate] = useState(false)
  const [submitting,      setSubmitting]      = useState(false)
  const [estimateInfo,    setEstimateInfo]    = useState(null)

  const watchedItems       = watch('lineItems')
  const selectedEstimateId = watch('estimateId')
  const selectedClientId   = watch('clientId')

  // Totals
  const subtotal    = watchedItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const gstType     = estimateInfo?.gstType  || 'CGST_SGST'
  const cgstRate    = estimateInfo?.cgstRate || 9
  const sgstRate    = estimateInfo?.sgstRate || 9
  const igstRate    = estimateInfo?.igstRate || 18
  const cgstAmount  = gstType === 'CGST_SGST' ? subtotal * cgstRate / 100 : 0
  const sgstAmount  = gstType === 'CGST_SGST' ? subtotal * sgstRate / 100 : 0
  const igstAmount  = gstType === 'IGST'      ? subtotal * igstRate / 100 : 0
  const totalAmount = subtotal + cgstAmount + sgstAmount + igstAmount

  useEffect(() => {
    clientApi.getClients({ page: 0, size: 1000 })
      .then(r => {
        const list = r.data?.data?.content ?? r.data?.data ?? []
        setClients(Array.isArray(list) ? list : [])
      })
      .catch(() => message.error('Failed to load clients'))

    estimateApi.getEstimates({ page: 0, size: 1000 })
      .then(r => {
        const list = r.data?.data?.content ?? r.data?.data ?? []
        setEstimates(Array.isArray(list) ? list : [])
      })
      .catch(() => message.error('Failed to load estimates'))
  }, [])

  const filteredEstimates = selectedClientId
    ? estimates.filter(e => e.clientId === selectedClientId)
    : estimates

  useEffect(() => {
    if (selectedEstimateId) {
      setLoadingEstimate(true)
      getEstimateById(selectedEstimateId)
        .then(r => {
          const e = r.data?.data
          if (!e) return
          setEstimateInfo(e)
          if (!selectedClientId) setValue('clientId', e.clientId)
          setValue('campaignId', e.campaignId)
          replace(e.lineItems?.map(li => ({
            id:           li.id,
            activityName: li.activityName,
            hsnCode:      li.hsnCode || '',
            description:  li.description,
            amount:       Number(li.amount),
            sortOrder:    li.sortOrder,
          })) || [])
        })
        .catch(() => message.error('Failed to load estimate details'))
        .finally(() => setLoadingEstimate(false))
    } else {
      setEstimateInfo(null)
      replace([])
    }
  }, [selectedEstimateId])

  const lineItemColumns = [
    { title: '#',           key: 'idx',          width: 40,  render: (_, __, i) => i + 1 },
    { title: 'Activity',    dataIndex: 'activityName', key: 'activityName' },
    { title: 'HSN Code',    dataIndex: 'hsnCode', key: 'hsnCode', width: 110,
      render: v => v || '-' },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Amount (₹)', key: 'amount', width: 180,
      render: (_, __, index) => (
        <Controller
          name={`lineItems.${index}.amount`}
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field} min={0} precision={2} style={{ width: '100%' }}
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
        estimateId:  data.estimateId,
        clientId:    data.clientId,
        campaignId:  data.campaignId || null,
        invoiceDate: data.invoiceDate?.format('YYYY-MM-DD'),
        dueDate:     data.dueDate?.format('YYYY-MM-DD'),
        lineItems:   data.lineItems.map((li, idx) => ({
          activityName: li.activityName,
          hsnCode:      li.hsnCode || null,
          description:  li.description,
          amount:       Number(li.amount),
          sortOrder:    idx,
        })),
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

  const gstData = estimateInfo ? {
    gstType, subtotal, cgstRate, sgstRate, igstRate,
    cgstAmount, sgstAmount, igstAmount, totalAmount,
  } : null

  return (
    <div>
      <PageHeader title="New Invoice" onBack={() => navigate('/invoices')} />
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}
        style={{ maxWidth: 900, margin: '0 auto' }}>

        <Card style={{ marginBottom: 16 }}>
          <Alert
            message="Select client first, then choose an estimate — line items will auto-populate."
            type="info" showIcon style={{ marginBottom: 16 }}
          />

          <Row gutter={16}>
            <Col span={12}>
              <FormSelect
                name="clientId"
                label="Client"
                control={control}
                error={errors.clientId}
                options={clients.map(c => ({ value: c.id, label: c.clientName }))}
                required
                showSearch
                placeholder="Select client"
                onChange={() => setValue('estimateId', null)}
              />
            </Col>
            <Col span={12}>
              <FormSelect
                name="estimateId"
                label="Source Estimate"
                control={control}
                error={errors.estimateId}
                options={filteredEstimates.map(e => ({
                  value: e.id,
                  label: `${e.estimateNumber} [${e.status ?? 'DRAFT'}]`
                }))}
                required
                showSearch
                placeholder={selectedClientId ? 'Select estimate' : 'Select client first'}
                disabled={!selectedClientId}
              />
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={12}>
              <Form.Item label="Invoice Date" required>
                <Controller name="invoiceDate" control={control}
                  render={({ field }) => (
                    <DatePicker {...field} format="DD/MM/YYYY" style={{ width: '100%' }} />
                  )} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Due Date">
                <Controller name="dueDate" control={control}
                  render={({ field }) => (
                    <DatePicker {...field} format="DD/MM/YYYY" style={{ width: '100%' }} />
                  )} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {fields.length > 0 && (
          <>
            <Card title="Line Items" style={{ marginBottom: 16 }}>
              <Table
                dataSource={fields}
                columns={lineItemColumns}
                rowKey={(_, i) => i}
                pagination={false}
                size="small"
                loading={loadingEstimate}
              />
            </Card>

            <Card style={{ marginBottom: 16 }}>
              <GSTBreakdownCard gstData={gstData} />
            </Card>

            <Card>
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Create Invoice
                </Button>
                <Button onClick={() => navigate('/invoices')}>Cancel</Button>
              </Space>
            </Card>
          </>
        )}

        {fields.length === 0 && (
          <Card>
            <Button onClick={() => navigate('/invoices')}>Cancel</Button>
          </Card>
        )}

      </Form>
    </div>
  )
}

export default InvoiceFormPage