import React from 'react'
import { Button } from 'antd'
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, subtitle, onAdd, addLabel = 'Add New', backUrl, extra }) {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {backUrl && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(backUrl)}
            style={{ color: 'var(--color-text-secondary)' }}
          />
        )}
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}>{title}</h1>
          {subtitle && (
            <p style={{
              color: 'var(--color-text-secondary)',
              margin: '4px 0 0',
              fontSize: 14,
            }}>{subtitle}</p>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {extra}
        {onAdd && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  )
}