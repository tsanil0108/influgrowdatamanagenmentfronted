import React from 'react'
import { Tag } from 'antd'
import { STATUS_COLORS } from '../../utils/constants'

export default function StatusBadge({ status }) {
  if (!status) return null
  const color = STATUS_COLORS[status] || 'default'
  return <Tag color={color} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, letterSpacing: '0.04em' }}>{status}</Tag>
}