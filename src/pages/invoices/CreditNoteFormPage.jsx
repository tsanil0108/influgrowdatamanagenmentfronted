// src/pages/invoices/CreditNoteFormPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import {
  Form, Button, DatePicker, InputNumber, Card,
  Row, Col, Space, Divider, Alert, Typography, Input, Modal, Table, Tag, App
} from 'antd'
import { DeleteOutlined, ExclamationCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import PageHeader from '../../components/common/PageHeader'
import FormSelect from '../../components/common/FormSelect'
import { invoiceApi } from '../../api/invoiceApi'
import { clientApi } from '../../api/clientApi'

const { Text } = Typography
const { TextArea } = Input
const { confirm } = Modal

const CreditNoteFormPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const invoiceIdFromUrl = searchParams.get('invoiceId')
  
  const { message } = App.useApp()
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      clientId: null,
      originalInvoiceId: invoiceIdFromUrl ? Number(invoiceIdFromUrl) : null,
      invoiceDate: dayjs(),
      remarks: '',
      amount: 0,
    }
  })

  const [clients, setClients] = useState([])
  const [invoices, setInvoices] = useState([])
  const [originalInfo, setOriginalInfo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [existingCreditNotes, setExistingCreditNotes] = useState([])
  const [loadingCreditNotes, setLoadingCreditNotes] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [amountError, setAmountError] = useState('')

  const selectedClientId = watch('clientId')
  const selectedInvoiceId = watch('originalInvoiceId')
  const amount = Number(watch('amount')) || 0

  const gstType = originalInfo?.gstType || 'CGST_SGST'
  const cgstRate = originalInfo?.cgstRate || 0
  const sgstRate = originalInfo?.sgstRate || 0
  const igstRate = originalInfo?.igstRate || 0
  const cgstAmount = gstType === 'CGST_SGST' ? amount * cgstRate / 100 : 0
  const sgstAmount = gstType === 'CGST_SGST' ? amount * sgstRate / 100 : 0
  const igstAmount = gstType === 'IGST' ? amount * igstRate / 100 : 0
  const totalCredit = amount + cgstAmount + sgstAmount + igstAmount

  const getRemainingAmount = () => {
    if (!originalInfo) return 0
    
    const totalCreditUsed = existingCreditNotes.reduce((sum, cn) => {
      const cnAmount = Number(cn.totalAmount || 0)
      return sum + Math.abs(cnAmount)
    }, 0)
    
    const originalTotal = Number(originalInfo.totalAmount || 0)
    return Math.max(0, originalTotal - totalCreditUsed)
  }

  const remainingAmount = getRemainingAmount()
  const isFullyCredited = remainingAmount <= 0

  useEffect(() => {
    clientApi.getClients({ page: 0, size: 1000 })
      .then(r => {
        const list = r.data?.data?.content ?? r.data?.data ?? []
        setClients(Array.isArray(list) ? list : [])
      })
      .catch(() => message.error('Failed to load clients'))
  }, [message])

  useEffect(() => {
    if (!selectedClientId) {
      setInvoices([])
      return
    }
    invoiceApi.getInvoices({ clientId: selectedClientId, page: 0, size: 200 })
      .then(r => {
        const list = r.data?.data?.content ?? r.data?.data ?? []
        setInvoices((Array.isArray(list) ? list : []).filter(inv => inv.invoiceType !== 'CREDIT_NOTE'))
      })
      .catch(() => message.error('Failed to load invoices'))
  }, [selectedClientId, message])

  useEffect(() => {
    if (invoiceIdFromUrl && !selectedClientId) {
      // If invoiceId is passed in URL, auto-select client
      invoiceApi.getInvoiceById(invoiceIdFromUrl)
        .then(r => {
          const inv = r.data?.data
          if (inv) {
            setValue('clientId', inv.clientId)
            setValue('originalInvoiceId', Number(invoiceIdFromUrl))
          }
        })
        .catch(() => {})
    }
  }, [invoiceIdFromUrl])

  useEffect(() => {
    if (!selectedInvoiceId) {
      setOriginalInfo(null)
      setExistingCreditNotes([])
      setAmountError('')
      return
    }
    
    loadInvoiceData(selectedInvoiceId)
  }, [selectedInvoiceId, refreshTrigger])

  const loadInvoiceData = async (invoiceId) => {
    try {
      const invoiceRes = await invoiceApi.getInvoiceById(invoiceId)
      const inv = invoiceRes.data?.data ?? null
      setOriginalInfo(inv)
      
      await loadCreditNotes(invoiceId)
      
    } catch (error) {
      message.error('Failed to load invoice data')
    }
  }

  const loadCreditNotes = async (invoiceId) => {
    setLoadingCreditNotes(true)
    try {
      const response = await invoiceApi.getCreditNotesByInvoiceId(invoiceId)
      const notes = response.data?.data ?? []
      setExistingCreditNotes(Array.isArray(notes) ? notes : [])
      
      // ✅ Update amount to remaining balance
      if (originalInfo) {
        const remaining = getRemainingAmount()
        setValue('amount', Math.min(remaining, Number(originalInfo.totalAmount || 0)))
        setAmountError('')
      }
    } catch (error) {
      message.error('Failed to load existing credit notes')
    } finally {
      setLoadingCreditNotes(false)
    }
  }

  const handleDeleteCreditNote = (creditNoteId, creditNoteNumber) => {
    confirm({
      title: 'Delete Credit Note',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to delete credit note <strong>{creditNoteNumber}</strong>?</p>
          <p style={{ color: '#ff4d4f', marginTop: 8 }}>
            This action cannot be undone and will restore the amount to the original invoice.
          </p>
        </div>
      ),
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setDeleting(true)
        try {
          await invoiceApi.deleteCreditNote(creditNoteId)
          message.success(`Credit note ${creditNoteNumber} deleted successfully`)
          setRefreshTrigger(prev => prev + 1)
        } catch (err) {
          message.error(err.response?.data?.message || 'Failed to delete credit note')
        } finally {
          setDeleting(false)
        }
      }
    })
  }

  // ✅ Handle amount change with validation
  const handleAmountChange = (value) => {
    setAmountError('')
    if (value > remainingAmount && remainingAmount > 0) {
      setAmountError(`Amount cannot exceed ${fmt(remainingAmount)}`)
      message.warning(`Maximum allowed amount is ${fmt(remainingAmount)}`)
    }
  }

  const onSubmit = async (data) => {
    // ✅ Clear previous errors
    setAmountError('')

    // ✅ Validation 1: Amount must be greater than zero
    if (amount <= 0) {
      setAmountError('Amount must be greater than zero')
      message.error('❌ Amount must be greater than zero')
      return
    }

    // ✅ Validation 2: Amount exceeds remaining balance
    if (amount > remainingAmount) {
      setAmountError(`Amount cannot exceed ${fmt(remainingAmount)}`)
      message.error(
        `❌ Credit note amount (${fmt(amount)}) exceeds remaining invoice balance (${fmt(remainingAmount)}). ` +
        `Please reduce the amount or check existing credit notes.`
      )
      return
    }

    // ✅ Validation 3: Invoice fully credited
    if (isFullyCredited) {
      setAmountError('This invoice is already fully credited')
      message.error('❌ This invoice is already fully credited. No more credit can be applied.')
      return
    }

    // ✅ Validation 4: Minimum amount check
    if (amount > 0 && amount < 1) {
      setAmountError('Minimum amount is ₹1.00')
      message.error('❌ Minimum credit note amount is ₹1.00')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        clientId: data.clientId,
        originalInvoiceId: data.originalInvoiceId,
        invoiceType: 'CREDIT_NOTE',
        invoiceDate: data.invoiceDate?.format('YYYY-MM-DD'),
        remarks: data.remarks || null,
        lineItems: [{
          activityName: 'Credit Note',
          description: data.remarks || 'Credit Note',
          hsnCode: null,
          amount: Math.abs(Number(data.amount) || 0),
          sortOrder: 0,
        }],
      }
      
      const res = await invoiceApi.createCreditNote(payload)
      const cnData = res?.data?.data
      const cnNumber = cnData?.invoiceNumber
      const cnId = cnData?.id
      
      message.success(`✅ ${cnNumber ? `Credit note ${cnNumber}` : 'Credit note'} created successfully`)
      
      // ✅ Redirect to Credit Note Detail Page
      if (cnId) {
        navigate(`/invoices/credit-note/${cnId}`)
      } else {
        navigate('/invoices/credit-notes')
      }
      
    } catch (err) {
      let errorMessage = '❌ Failed to create credit note'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors
        if (Array.isArray(errors)) {
          errorMessage = errors.join(', ')
        } else if (typeof errors === 'string') {
          errorMessage = errors
        }
      }
      
      message.error({
        content: errorMessage,
        duration: 6,
        style: { 
          whiteSpace: 'pre-line',
          fontSize: 14,
          fontWeight: 500,
        }
      })
      console.error('Credit note creation error:', err.response?.data || err)
    } finally {
      setSubmitting(false)
    }
  }

  const fmt = v => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  const creditNoteColumns = [
    {
      title: 'CN Number',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => (
        <Text type="danger" strong>{fmt(Math.abs(val || 0))}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ISSUED' ? 'blue' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteCreditNote(record.id, record.invoiceNumber)}
          loading={deleting}
        >
          Delete
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader 
        title="Generate Credit Note" 
        onBack={() => navigate('/invoices')}
        extra={
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/invoices')}
          >
            Back to Invoices
          </Button>
        }
      />
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}
        style={{ maxWidth: 900, margin: '0 auto' }}>

        <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 24 } }}>
          <Alert
            title="This credit note will reduce the original invoice's outstanding balance. It will appear in the Sales Register/Reports in red with a 'Credit Note' tag. The CN number is auto-generated (e.g. IG/CN/2627/04/KIN/01)."
            type="warning" 
            showIcon 
            style={{ marginBottom: 16 }}
          />

          <Row gutter={16}>
            <Col span={24}>
              <FormSelect
                name="clientId"
                label="Client"
                control={control}
                error={errors.clientId}
                options={clients.map(c => ({ value: c.id, label: c.clientName }))}
                required
                showSearch
                placeholder="Select client"
                onChange={() => { 
                  setValue('originalInvoiceId', null)
                  setValue('amount', 0)
                  setOriginalInfo(null)
                  setExistingCreditNotes([])
                  setAmountError('')
                }}
              />
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={24}>
              <FormSelect
                name="originalInvoiceId"
                label="Select Invoice"
                control={control}
                error={errors.originalInvoiceId}
                options={invoices.map(inv => ({
                  value: inv.id,
                  label: `${inv.invoiceNumber} — ${fmt(inv.totalAmount)} [${inv.status}]`
                }))}
                required
                showSearch
                placeholder={selectedClientId ? 'Select invoice' : 'Select client first'}
                disabled={!selectedClientId}
              />
            </Col>
          </Row>
        </Card>

        {selectedInvoiceId && (
          <Card 
            title="Existing Credit Notes" 
            style={{ marginBottom: 16 }}
            styles={{ body: { padding: 24 } }}
            extra={
              <Space>
                <Text type="secondary">
                  Total Credit: {fmt(existingCreditNotes.reduce((sum, cn) => sum + Math.abs(Number(cn.totalAmount || 0)), 0))}
                </Text>
                <Text strong style={{ color: isFullyCredited ? '#ff4d4f' : '#52c41a' }}>
                  Remaining: {fmt(remainingAmount)}
                </Text>
              </Space>
            }
          >
            {existingCreditNotes.length > 0 ? (
              <Table
                dataSource={existingCreditNotes}
                columns={creditNoteColumns}
                rowKey="id"
                size="small"
                pagination={false}
                loading={loadingCreditNotes}
              />
            ) : (
              <Alert
                title="No credit notes created yet"
                description="You can create a credit note for this invoice using the form below."
                type="info"
                showIcon
              />
            )}
            
            {isFullyCredited && existingCreditNotes.length > 0 && (
              <Alert
                title="⚠️ This invoice is fully credited"
                description="No more credit can be applied to this invoice as the remaining balance is zero."
                type="warning"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </Card>
        )}

        <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 24 } }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Credit Note Date" 
                required
                tooltip="Aaj ki date by default hai — neeche se back date bhi select kar sakte hain"
              >
                <Controller 
                  name="invoiceDate" 
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      format="DD/MM/YYYY"
                      style={{ width: '100%' }}
                      disabledDate={(d) => d && d.isAfter(dayjs(), 'day')}
                    />
                  )} 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Credit Note Amount (₹)" 
                required
                tooltip="Selected invoice se fetch hota hai, aap edit kar sakte hain"
                extra={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Max allowed: {fmt(remainingAmount)}
                  </Text>
                }
                validateStatus={amountError ? 'error' : (amount > remainingAmount && remainingAmount > 0 ? 'error' : '')}
                help={amountError || (amount > remainingAmount && remainingAmount > 0 ? `Amount cannot exceed ${fmt(remainingAmount)}` : '')}
              >
                <Controller 
                  name="amount" 
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      min={0}
                      precision={2}
                      style={{ 
                        width: '100%',
                        ...(amountError ? { borderColor: '#ff4d4f' } : {})
                      }}
                      disabled={!selectedInvoiceId || isFullyCredited}
                      formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={v => v.replace(/₹\s?|(,*)/g, '')}
                      max={remainingAmount}
                      onChange={(value) => {
                        field.onChange(value)
                        handleAmountChange(value)
                      }}
                    />
                  )} 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Remarks">
                <Controller 
                  name="remarks" 
                  control={control}
                  render={({ field }) => (
                    <TextArea 
                      {...field} 
                      rows={3} 
                      placeholder="Reason for credit note (e.g. campaign cancelled, billing correction, etc.)" 
                    />
                  )} 
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 24 } }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400, marginLeft: 'auto' }}>
            <Row justify="space-between">
              <Text>Amount</Text>
              <Text>{fmt(amount)}</Text>
            </Row>
            {gstType === 'CGST_SGST' ? (
              <>
                <Row justify="space-between">
                  <Text type="secondary">CGST ({cgstRate}%)</Text>
                  <Text type="secondary">{fmt(cgstAmount)}</Text>
                </Row>
                <Row justify="space-between">
                  <Text type="secondary">SGST ({sgstRate}%)</Text>
                  <Text type="secondary">{fmt(sgstAmount)}</Text>
                </Row>
              </>
            ) : (
              <Row justify="space-between">
                <Text type="secondary">IGST ({igstRate}%)</Text>
                <Text type="secondary">{fmt(igstAmount)}</Text>
              </Row>
            )}
            <Divider style={{ margin: '4px 0' }} />
            <Row justify="space-between">
              <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>Total Credit</Text>
              <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>{fmt(totalCredit)}</Text>
            </Row>
          </div>
        </Card>

        <Card styles={{ body: { padding: 24 } }}>
          <Space>
            <Button 
              type="primary" 
              danger 
              htmlType="submit" 
              loading={submitting}
              disabled={!selectedInvoiceId || amount <= 0 || amount > remainingAmount || isFullyCredited}
            >
              Save Credit Note
            </Button>
            <Button onClick={() => navigate('/invoices')}>Cancel</Button>
          </Space>
        </Card>
      </Form>
    </div>
  )
}

export default CreditNoteFormPage