import React from 'react'
import { Spin } from 'antd'

export default function LoadingSpinner({ tip = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
      flexDirection: 'column',
      gap: 12,
    }}>
      <Spin size="large" />
      <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: 13 }}>{tip}</span>
    </div>
  )
}