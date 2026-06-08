import React from 'react'
import { Input, InputNumber, Button, Table } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { formatCurrency } from '../../utils/formatters'

export default function LineItemsTable({ items = [], onChange, readOnly = false }) {
  const addItem = () => {
    onChange([...items, { id: Date.now(), activityName: '', description: '', amount: '', sortOrder: items.length + 1 }])
  }

  const removeItem = (idx) => {
    onChange(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx, field, value) => {
    const updated = items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    onChange(updated)
  }

  const columns = [
    {
      title: '#',
      width: 48,
      render: (_, __, idx) => (
        <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          {idx + 1}
        </span>
      ),
    },
    {
      title: 'Activity Name',
      dataIndex: 'activityName',
      render: (val, _, idx) =>
        readOnly ? val : (
          <Input
            value={val}
            placeholder="e.g. Instagram Reel"
            onChange={(e) => updateItem(idx, 'activityName', e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: 0, fontFamily: 'var(--font-body)' }}
          />
        ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: (val, _, idx) =>
        readOnly ? (val || '—') : (
          <Input
            value={val}
            placeholder="Optional details"
            onChange={(e) => updateItem(idx, 'description', e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: 0, fontFamily: 'var(--font-body)' }}
          />
        ),
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'amount',
      width: 160,
      align: 'right',
      render: (val, _, idx) =>
        readOnly ? (
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{formatCurrency(val)}</span>
        ) : (
          <InputNumber
            value={val}
            min={0}
            precision={2}
            placeholder="0.00"
            onChange={(v) => updateItem(idx, 'amount', v)}
            style={{ width: '100%', fontFamily: 'var(--font-body)' }}
            controls={false}
          />
        ),
    },
    !readOnly && {
      title: '',
      width: 48,
      render: (_, __, idx) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(idx)}
          disabled={items.length === 1}
        />
      ),
    },
  ].filter(Boolean)

  const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

  return (
    <div>
      <Table
        dataSource={items}
        columns={columns}
        rowKey={(_, idx) => idx}
        pagination={false}
        size="small"
        style={{ fontFamily: 'var(--font-body)' }}
        summary={() => (
          <Table.Summary.Row style={{ background: 'var(--color-surface-2)' }}>
            <Table.Summary.Cell index={0} colSpan={readOnly ? 3 : 3}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>Subtotal</span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right">
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--color-brand)' }}>
                {formatCurrency(total)}
              </span>
            </Table.Summary.Cell>
            {!readOnly && <Table.Summary.Cell index={2} />}
          </Table.Summary.Row>
        )}
      />
      {!readOnly && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addItem}
          style={{ width: '100%', marginTop: 8, fontFamily: 'var(--font-body)', borderColor: 'var(--color-brand)', color: 'var(--color-brand)' }}
        >
          Add Activity
        </Button>
      )}
    </div>
  )
}