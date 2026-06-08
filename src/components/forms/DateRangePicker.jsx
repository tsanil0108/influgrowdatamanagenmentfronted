import React from 'react'
import { DatePicker, Form } from 'antd'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function DateRangePicker({ startName = 'startDate', endName = 'endDate', label = 'Date Range', required, disabled }) {
  return (
    <Form.Item label={label} required={required}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Form.Item name={startName} noStyle rules={required ? [{ required: true, message: 'Start date required' }] : []}>
          <DatePicker placeholder="Start Date" style={{ width: '100%' }} disabled={disabled} />
        </Form.Item>
        <Form.Item name={endName} noStyle rules={required ? [{ required: true, message: 'End date required' }] : []}>
          <DatePicker placeholder="End Date" style={{ width: '100%' }} disabled={disabled} />
        </Form.Item>
      </div>
    </Form.Item>
  )
}

export function DateRangeFilter({ onChange, value }) {
  return (
    <RangePicker
      value={value}
      onChange={onChange}
      format="DD MMM YYYY"
      style={{ fontFamily: 'var(--font-body)' }}
    />
  )
}