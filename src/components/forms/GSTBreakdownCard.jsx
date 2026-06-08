import React from 'react'
import { Card, Divider } from 'antd'
import { formatCurrency } from '../../utils/formatters'
import { GST_TYPE } from '../../utils/constants'

export default function GSTBreakdownCard({ gstData, style }) {
  if (!gstData) return null
  const { gstType, subtotal, cgstRate, sgstRate, igstRate, cgstAmount, sgstAmount, igstAmount, totalAmount } = gstData

  return (
    <Card
      size="small"
      style={{
        background: 'var(--color-brand-light)',
        border: '1px solid rgba(0,87,255,0.2)',
        borderRadius: 'var(--radius-md)',
        ...style,
      }}
      bodyStyle={{ padding: '12px 16px' }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--color-brand)', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        GST Breakdown
      </div>

      <Row label="Subtotal" value={formatCurrency(subtotal)} />

      {gstType === GST_TYPE.CGST_SGST ? (
        <>
          <Row label={`CGST (${cgstRate}%)`} value={formatCurrency(cgstAmount)} muted />
          <Row label={`SGST (${sgstRate}%)`} value={formatCurrency(sgstAmount)} muted />
        </>
      ) : (
        <Row label={`IGST (${igstRate}%)`} value={formatCurrency(igstAmount)} muted />
      )}

      <Divider style={{ margin: '8px 0', borderColor: 'rgba(0,87,255,0.2)' }} />

      <Row label="Total Amount" value={formatCurrency(totalAmount)} bold />

      <div style={{
        marginTop: 6,
        fontSize: 11,
        color: 'var(--color-brand)',
        fontStyle: 'italic',
      }}>
        {gstType === GST_TYPE.CGST_SGST ? '(Same state — CGST + SGST applied)' : '(Interstate — IGST applied)'}
      </div>
    </Card>
  )
}

function Row({ label, value, muted, bold }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '2px 0',
      fontFamily: 'var(--font-body)',
    }}>
      <span style={{
        fontSize: 13,
        color: muted ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
        fontWeight: bold ? 600 : 400,
      }}>{label}</span>
      <span style={{
        fontSize: bold ? 15 : 13,
        fontWeight: bold ? 700 : 500,
        fontFamily: bold ? 'var(--font-display)' : 'var(--font-body)',
        color: bold ? 'var(--color-brand)' : 'var(--color-text-primary)',
      }}>{value}</span>
    </div>
  )
}