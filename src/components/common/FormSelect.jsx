import React from 'react'
import { Form, Select, Spin } from 'antd'
import { Controller } from 'react-hook-form'

const { Option } = Select

/**
 * FormSelect — Dropdown with async options loading, RHF compatible
 *
 * Props:
 *  name          - Field name (used with RHF Controller)
 *  label         - Display label
 *  control       - RHF control object
 *  error         - RHF error for this field
 *  options       - Array of { value, label } objects
 *  loading       - Show spinner while options load
 *  required
 *  placeholder
 *  disabled
 *  allowClear
 *  showSearch    - Enable option filtering
 *  mode          - 'multiple' for multi-select
 *  onChange      - Optional extra onChange callback (besides RHF)
 *  style         - Form.Item style override
 *
 * Usage:
 *   <FormSelect
 *     name="client_id"
 *     label="Client"
 *     control={control}
 *     error={errors.client_id}
 *     options={clients.map(c => ({ value: c.id, label: c.client_name }))}
 *     loading={clientsLoading}
 *     required
 *     showSearch
 *   />
 */
const FormSelect = ({
  name,
  label,
  control,
  error,
  options = [],
  loading = false,
  required = false,
  placeholder,
  disabled = false,
  allowClear = true,
  showSearch = false,
  mode,
  onChange: externalOnChange,
  style,
}) => {
  return (
    <Form.Item
      label={label}
      required={required}
      validateStatus={error ? 'error' : ''}
      help={error?.message || ''}
      style={{ marginBottom: 20, ...style }}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            placeholder={placeholder || `Select ${label || ''}`}
            disabled={disabled}
            allowClear={allowClear}
            showSearch={showSearch}
            mode={mode}
            loading={loading}
            status={error ? 'error' : ''}
            optionFilterProp="label"
            notFoundContent={loading ? <Spin size="small" /> : 'No options'}
            onChange={(val) => {
              field.onChange(val)
              externalOnChange?.(val)
            }}
            style={{ width: '100%' }}
          >
            {options.map(opt => (
              <Option key={opt.value} value={opt.value} label={opt.label}>
                {opt.label}
              </Option>
            ))}
          </Select>
        )}
      />
    </Form.Item>
  )
}

export default FormSelect