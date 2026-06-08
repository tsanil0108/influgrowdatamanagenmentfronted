import React from 'react'
import { Divider } from 'antd'
import { formatCurrency } from '../../utils/formatters'
import { GST_TYPE } from '../../utils/constants'

export default function AmountSummary({ subtotal, cgstRate, sgstRate, igstRate, cgstAmount, sgstAmount, igstAmount, totalAmount, gstType, amountInWords }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 16px', background: 'var(--color-surface-2)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Amount Summary
        </span>
      </div>

      <div style={{ padding: '12px 16px' }}>
        <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />

        {gstType === GST_TYPE.CGST_SGST ? (
          <>
            <SummaryRow label={`CGST @ ${cgstRate}%`} value={formatCurrency(cgstAmount)} secondary />
            <SummaryRow label={`SGST @ ${sgstRate}%`} value={formatCurrency(sgstAmount)} secondary />
          </>
        ) : (
          <SummaryRow label={`IGST @ ${igstRate}%`} value={formatCurrency(igstAmount)} secondary />
        )}

        <Divider style={{ margin: '10px 0' }} />

        <SummaryRow label="Total Amount" value={formatCurrency(totalAmount)} highlight />

        {amountInWords && (
          <p style={{
            marginTop: 10,
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic',
            fontFamily: 'var(--font-body)',
            borderTop: '1px dashed var(--color-border)',
            paddingTop: 8,
          }}>
            <strong>In Words:</strong> {amountInWords}
          </p>
        )}
      </div>
    </div>
  )
}

function SummaryRow({ label, value, secondary, highlight }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '4px 0',
      fontFamily: 'var(--font-body)',
    }}>
      <span style={{
        fontSize: secondary ? 12 : 14,
        color: secondary ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
      }}>{label}</span>
      <span style={{
        fontSize: highlight ? 18 : secondary ? 12 : 14,
        fontWeight: highlight ? 700 : 500,
        fontFamily: highlight ? 'var(--font-display)' : 'var(--font-body)',
        color: highlight ? 'var(--color-brand)' : 'var(--color-text-primary)',
      }}>{value}</span>
    </div>
  )
}