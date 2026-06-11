import React from 'react'
import { Form, Input } from 'antd'

const FormInput = ({
  name,
  label,
  register,
  error,
  required = false,
  placeholder,
  disabled = false,
  type = 'text',
  maxLength,
  prefix,
  suffix,
  style,
  inputStyle,
  helpText,
}) => {
  const { ref, onChange, onBlur, name: fieldName } = register || {}

  return (
    <Form.Item
      label={label}
      required={required}
      validateStatus={error ? 'error' : ''}
      help={error?.message || helpText || ''}
      style={{ marginBottom: 20, ...style }}
    >
      <Input
        id={name || fieldName}
        ref={ref}
        name={fieldName || name}
        onChange={(e) => onChange?.({ target: { name: fieldName || name, value: e.target.value } })}
        onBlur={onBlur}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        prefix={prefix}
        suffix={suffix}
        style={inputStyle}
        status={error ? 'error' : ''}
      />
    </Form.Item>
  )
}

export default FormInput