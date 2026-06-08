import React from 'react'
import { Form, Input } from 'antd'

/**
 * FormInput — Label + Input + validation error message wrapper
 *
 * Props (all React Hook Form compatible):
 *  name        - Field name
 *  label       - Display label
 *  register    - RHF register function (spread onto input)
 *  error       - RHF error object for this field (e.g. errors.fieldName)
 *  required    - Show asterisk
 *  placeholder
 *  disabled
 *  type        - input type (text, email, number, etc.)
 *  maxLength
 *  prefix      - Ant Design Input prefix (icon/text)
 *  suffix
 *  style       - Style override for Form.Item
 *  inputStyle  - Style override for Input
 *  helpText    - Additional help text below field
 *
 * Usage with React Hook Form:
 *   <FormInput
 *     name="pan_number"
 *     label="PAN Number"
 *     register={register('pan_number', { required: 'PAN is required' })}
 *     error={errors.pan_number}
 *     placeholder="ABCDE1234F"
 *     maxLength={10}
 *   />
 */
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
        onChange={onChange}
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