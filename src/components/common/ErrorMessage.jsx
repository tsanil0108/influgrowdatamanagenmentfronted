import React from 'react'
import { Result, Button } from 'antd'

export default function ErrorMessage({ message, onRetry }) {
  return (
    <Result
      status="error"
      title="Something went wrong"
      subTitle={message || 'An unexpected error occurred. Please try again.'}
      extra={onRetry && (
        <Button type="primary" onClick={onRetry}>Retry</Button>
      )}
    />
  )
}