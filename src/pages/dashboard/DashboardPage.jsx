// src/pages/DashboardPage.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { Row, Col, Card, Table, Button, Tooltip, Progress } from 'antd'
import { TeamOutlined, FileTextOutlined, AuditOutlined, WalletOutlined, ReloadOutlined, ShopOutlined, BankOutlined, FlagOutlined } from '@ant-design/icons'
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend, ComposedChart, Line, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { formatCurrency, formatDate } from '../../utils/formatters'
import StatusBadge from '../../components/common/StatusBadge'
import { useSelector } from 'react-redux'

// ─── Inline Styles ──────────────────────────────────────────────────────────────
const styles = {
  container: { padding: '32px 40px', minHeight: '100vh', background: '#f8f6f3' },

  welcomeBanner: {
    background: 'linear-gradient(135deg, #FF6B1A 0%, #FF9A00 100%)',
    borderRadius: 20, padding: '28px 32px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', boxShadow: '0 12px 28px -10px rgba(255,107,26,0.45)',
    marginBottom: 28, position: 'relative', overflow: 'hidden',
  },
  welcomeContent: { position: 'relative', zIndex: 1 },
  welcomeTitle: { fontFamily: "'Playfair Display', 'Georgia', serif", fontSize: 28, fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: 0.5 },
  welcomeSubtitle: { color: 'rgba(255,255,255,0.85)', marginTop: 6, fontSize: 14, marginBottom: 0, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
  welcomeActions: { position: 'relative', zIndex: 1, display: 'flex', gap: 12, alignItems: 'center' },
  refreshBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', borderRadius: 8, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease' },

  statCard: { borderRadius: 16, border: '1px solid #EAECF4', boxShadow: '0 1px 2px rgba(13,17,23,0.04)', background: '#ffffff', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden', cursor: 'pointer' },
  statCardHover: { boxShadow: '0 12px 28px -8px rgba(13,17,23,0.12)', transform: 'translateY(-3px)', borderColor: '#d4b88a' },
  statCardBody: { padding: '20px 24px' },
  statCardContent: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  statCardInfo: { minWidth: 0, flex: 1 },
  statCardTitle: { fontFamily: "'Playfair Display', 'Georgia', serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A0AAC0', whiteSpace: 'nowrap', display: 'block' },
  statCardValue: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 800, color: '#0D1117', lineHeight: 1.2, marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 3 },
  statIconWrapper: { width: 50, height: 50, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, flexShrink: 0 },

  chartCard: { borderRadius: 16, border: '1px solid #EAECF4', boxShadow: '0 1px 2px rgba(13,17,23,0.04)', background: '#ffffff', height: '100%' },
  chartCardBody: { padding: '24px 24px 8px' },
  chartCardBodyFull: { padding: 24 },
  chartTitle: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A0AAC0', margin: 0 },
  chartAmount: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 800, fontSize: 26, margin: '6px 0 0', color: '#0D1117' },
  chartSubtitle: { fontSize: 12.5, color: '#A0AAC0', margin: '2px 0 12px' },
  trendPill: { fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' },

  activityItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', borderBottom: '1px solid #F0F1F5', cursor: 'pointer', transition: 'background 0.15s ease' },
  activityIconWrap: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 },
  activityTitle: { fontSize: 13, fontWeight: 700, color: '#0D1117', fontFamily: "'Playfair Display', 'Georgia', serif" },
  activitySubtitle: { fontSize: 12, color: '#A0AAC0', marginTop: 1 },
  activityAmount: { fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' },
  activityDate: { fontSize: 11, color: '#A0AAC0', marginTop: 2 },
  chartContainer: { width: '100%', height: 240 },

  donutContainer: { position: 'relative', width: '100%', height: 170 },
  donutCenter: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' },
  donutCenterNumber: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 800, fontSize: 22, color: '#0D1117' },
  donutCenterLabel: { fontSize: 11, color: '#A0AAC0', textTransform: 'uppercase', letterSpacing: '0.05em' },
  legendContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 16 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 },
  legendDot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
  legendLabel: { color: '#5A6072', fontWeight: 600 },
  legendCount: { color: '#A0AAC0' },

  quickActionsSection: { marginBottom: 28 },
  quickActionsTitle: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A0AAC0', marginBottom: 12 },
  quickActionBtn: { borderRadius: 12, textAlign: 'center', cursor: 'pointer', padding: '15px 10px', transition: 'transform 0.2s ease, box-shadow 0.2s ease' },

  invoiceCard: { borderRadius: 16, border: '1px solid #EAECF4', boxShadow: '0 1px 2px rgba(13,17,23,0.04)', background: '#ffffff' },
  invoiceCardTitle: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 700, fontSize: 15 },
  viewAllLink: { fontSize: 13, color: '#FF6B1A', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' },
  invoiceNumber: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 700, color: '#FF6B1A' },
  clientAvatar: { width: 28, height: 28, borderRadius: '50%', background: '#EEF3FF', color: '#0057FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: "'Playfair Display', 'Georgia', serif", flexShrink: 0 },
  clientNameWrapper: { display: 'flex', alignItems: 'center', gap: 8 },
  amountText: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 700 },

  gstRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F0F1F5' },
  gstLabel: { fontSize: 13, color: '#5A6072', fontWeight: 600 },
  gstValue: { fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 800, fontSize: 16 },

  funnelStage: { marginBottom: 18 },
  funnelLabelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  funnelLabel: { fontSize: 13, fontWeight: 700, color: '#0D1117' },
  funnelValue: { fontSize: 13, fontWeight: 700, color: '#5A6072' },
}

// ─── StatCard Component ─────────────────────────────────────────────────────────
const getValueFontSize = (value, prefix, suffix) => {
  const text = `${prefix || ''}${value ?? ''}${suffix || ''}`.toString()
  if (text.length > 10) return 20
  if (text.length > 8) return 22
  if (text.length > 6) return 25
  if (text.length > 4) return 28
  return 30
}

const StatCard = ({ title, value, icon, color, prefix, suffix, onClick, loading }) => {
  const fontSize = getValueFontSize(value, prefix, suffix)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      style={{
        ...styles.statCard,
        ...(onClick && styles.statCardHover),
        ...(isHovered && onClick && { boxShadow: '0 12px 28px -8px rgba(13,17,23,0.12)', transform: 'translateY(-3px)', borderColor: '#d4b88a' }),
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.statCardBody}>
        <div style={styles.statCardContent}>
          <div style={styles.statCardInfo}>
            <span style={styles.statCardTitle}>{title}</span>
            <div style={styles.statCardValue}>
              {prefix && <span style={{ marginRight: 0, fontWeight: 800, color: '#0D1117' }}>{prefix}</span>}
              {loading ? <span style={{ opacity: 0.5 }}>—</span> : <span style={{ fontSize }}>{value}</span>}
              {suffix && <span style={{ fontWeight: 800, color: '#0D1117' }}>{suffix}</span>}
            </div>
          </div>
          <div style={{ ...styles.statIconWrapper, background: color + '1F', color }}>{icon}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Quick Action Button ────────────────────────────────────────────────────────
const QuickActionBtn = ({ label, path, color, onClick }) => {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <div
      style={{
        ...styles.quickActionBtn,
        background: color,
        boxShadow: isHovered ? `0 8px 20px -8px ${color}80` : `0 6px 16px -6px ${color}80`,
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={{ fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 700, fontSize: 12.5, color: '#fff' }}>{label}</span>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useSelector(s => s.auth.user)
  const [stats, setStats] = useState({
    clients: 0, vendors: 0, campaigns: 0, estimates: 0,
    pendingInvoices: 0, outstanding: 0, vendorBills: 0, bankEntries: 0,
  })
  const [recentInvoices, setRecentInvoices] = useState([])
  const [invoiceTrend, setInvoiceTrend] = useState([])
  const [statusBreakdown, setStatusBreakdown] = useState([])
  const [monthlyComparison, setMonthlyComparison] = useState([])
  const [topClients, setTopClients] = useState([])
  const [billStatusBreakdown, setBillStatusBreakdown] = useState([])
  const [monthTrend, setMonthTrend] = useState({ revenuePct: null, expensePct: null })
  const [recentActivity, setRecentActivity] = useState([])
  const [collectionEfficiency, setCollectionEfficiency] = useState(0)
  const [gstSummary, setGstSummary] = useState({ liability: 0, input: 0, net: 0 })
  const [conversionFunnel, setConversionFunnel] = useState({ estimates: 0, invoices: 0, rate: 0 })
  const [loading, setLoading] = useState(true)

  const STATUS_COLORS = {
    PAID: '#00A86B', UNPAID: '#E5264A', PENDING: '#F5A623', OVERDUE: '#E5264A', DRAFT: '#A0AAC0', CANCELLED: '#A0AAC0',
  }
  const FALLBACK_COLORS = ['#0057FF', '#8B5CF6', '#FF6B1A', '#00A86B', '#F5A623', '#A0AAC0']
  const getStatusColor = (status, idx) => STATUS_COLORS[status] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length]

  const shortDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    } catch {
      return ''
    }
  }

  const quickActions = [
    { label: 'New Estimate', path: '/estimates/new', color: '#0057FF' },
    { label: 'New Invoice', path: '/invoices/new', color: '#FF6B1A' },
    { label: 'Add Client', path: '/clients/new', color: '#00A86B' },
    { label: 'Record Receipt', path: '/bank-entries/receipt/new', color: '#8B5CF6' },
    { label: 'View Reports', path: '/reports', color: '#5A6072' },
  ]

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [
        clientsRes, vendorsRes, campaignsRes, estimatesRes,
        invoicesRes, vendorBillsRes, bankEntriesRes, summaryRes,
      ] = await Promise.allSettled([
        axiosInstance.get('/clients', { params: { page: 0, size: 1 } }),
        axiosInstance.get('/vendors', { params: { page: 0, size: 1 } }),
        axiosInstance.get('/campaigns', { params: { page: 0, size: 1 } }),
        axiosInstance.get('/estimates', { params: { page: 0, size: 1 } }),
        axiosInstance.get('/invoices', { params: { page: 0, size: 30, sort: 'invoiceDate,desc' } }),
        axiosInstance.get('/vendor-bills', { params: { page: 0, size: 100, sort: 'billDate,desc' } }),
        axiosInstance.get('/bank-entries', { params: { page: 0, size: 1 } }),
        axiosInstance.get('/dashboard/summary'),
      ])

      const getPage = (res) => {
        if (res.status !== 'fulfilled') return null
        const d = res.value.data
        if (d?.data !== undefined && d.data !== null) return d.data
        return d
      }

      const getTotal = (res) => {
        const page = getPage(res)
        if (!page) return 0
        if (page.totalElements !== undefined) return page.totalElements
        if (page.total !== undefined) return page.total
        if (Array.isArray(page)) return page.length
        if (Array.isArray(page.content)) return page.content.length
        return 0
      }

      const extractArray = (res) => {
        const page = getPage(res)
        if (!page) return []
        if (Array.isArray(page)) return page
        if (Array.isArray(page.content)) return page.content
        return []
      }

      const invoiceData = extractArray(invoicesRes)
      const vendorBillData = extractArray(vendorBillsRes)

      // ✅ FIX: Outstanding calculation - exclude credit notes
      // Credit notes store negative totals, so they should NOT be included in outstanding
      // Outstanding = totalAmount - paidAmount for all non-credit-note invoices with status != PAID
      const outstanding = invoiceData
        .filter(i => i.invoiceType !== 'CREDIT_NOTE' && i.status !== 'PAID')
        .reduce((sum, i) => {
          const total = parseFloat(i.totalAmount) || 0
          const paid = parseFloat(i.paidAmount) || 0
          const balance = total - paid
          // Add only if balance is positive (clamp at 0)
          return sum + Math.max(0, balance)
        }, 0)

      // Revenue vs Expense by month (last 6 months)
      const monthKey = (d) => {
        try {
          const dt = new Date(d)
          return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
        } catch { return null }
      }
      const monthLabel = (key) => {
        const [y, m] = key.split('-')
        return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
      }

      const revenueByMonth = {}
      invoiceData.forEach(i => {
        const key = monthKey(i.invoiceDate)
        if (!key) return
        // ✅ Only include non-credit-note invoices for revenue
        if (i.invoiceType !== 'CREDIT_NOTE') {
          revenueByMonth[key] = (revenueByMonth[key] || 0) + (parseFloat(i.totalAmount) || 0)
        }
      })

      const expenseByMonth = {}
      vendorBillData.forEach(b => {
        const key = monthKey(b.billDate)
        if (!key) return
        expenseByMonth[key] = (expenseByMonth[key] || 0) + (parseFloat(b.totalAmount) || 0)
      })

      const allKeys = Array.from(new Set([...Object.keys(revenueByMonth), ...Object.keys(expenseByMonth)]))
        .sort()
        .slice(-6)

      setMonthlyComparison(allKeys.map(key => ({
        month: monthLabel(key),
        revenue: Math.round(revenueByMonth[key] || 0),
        expense: Math.round(expenseByMonth[key] || 0),
        profit: Math.round((revenueByMonth[key] || 0) - (expenseByMonth[key] || 0)),
      })))

      // Top 5 Clients by Revenue
      const revenueByClient = {}
      invoiceData.forEach(i => {
        const name = i.clientName || 'Unknown'
        // ✅ Only include non-credit-note invoices
        if (i.invoiceType !== 'CREDIT_NOTE') {
          revenueByClient[name] = (revenueByClient[name] || 0) + (parseFloat(i.totalAmount) || 0)
        }
      })
      const topClientsList = Object.entries(revenueByClient)
        .map(([name, total]) => ({ name, total: Math.round(total) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
      setTopClients(topClientsList)

      // Vendor Bill payment status breakdown
      const BILL_STATUS_COLORS = { PAID: '#00A86B', PARTIAL: '#F5A623', UNPAID: '#E5264A' }
      const billStatusCounts = vendorBillData.reduce((acc, b) => {
        const key = b.paymentStatus || 'UNKNOWN'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
      setBillStatusBreakdown(
        Object.entries(billStatusCounts).map(([status, count], idx) => ({
          status, count,
          color: BILL_STATUS_COLORS[status] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
        }))
      )

      // This month vs last month % change
      const lastTwo = allKeys.slice(-2).map(key => ({
        revenue: revenueByMonth[key] || 0,
        expense: expenseByMonth[key] || 0,
      }))
      const pctChange = (curr, prev) => {
        if (!prev || prev === 0) return null
        return Math.round(((curr - prev) / Math.abs(prev)) * 100)
      }
      if (lastTwo.length === 2) {
        setMonthTrend({
          revenuePct: pctChange(lastTwo[1].revenue, lastTwo[0].revenue),
          expensePct: pctChange(lastTwo[1].expense, lastTwo[0].expense),
        })
      } else {
        setMonthTrend({ revenuePct: null, expensePct: null })
      }

      // Recent Activity feed
      const activityFromInvoices = invoiceData.slice(0, 8).map(i => ({
        id: `inv-${i.id}`,
        type: i.invoiceType === 'CREDIT_NOTE' ? 'CREDIT_NOTE' : 'INVOICE',
        title: i.invoiceType === 'CREDIT_NOTE' ? 'Credit note issued' : 'Invoice created',
        subtitle: `${i.invoiceNumber} — ${i.clientName || 'Unknown client'}`,
        amount: parseFloat(i.totalAmount) || 0,
        date: i.invoiceDate,
        path: `/invoices/${i.id}`,
      }))
      const activityFromBills = vendorBillData.slice(0, 8).map(b => ({
        id: `vb-${b.id}`,
        type: 'VENDOR_BILL',
        title: 'Vendor bill recorded',
        subtitle: `${b.vendorBillNumber || b.bookingReference || ''} — ${b.vendorName || 'Unknown vendor'}`,
        amount: parseFloat(b.totalAmount) || 0,
        date: b.billDate,
        path: `/vendor-bills/${b.id}`,
      }))
      const mergedActivity = [...activityFromInvoices, ...activityFromBills]
        .filter(a => a.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 8)
      setRecentActivity(mergedActivity)

      // Collection Efficiency
      const positiveInvoices = invoiceData.filter(i => i.invoiceType !== 'CREDIT_NOTE')
      const totalBilled = positiveInvoices.reduce((sum, i) => sum + (parseFloat(i.totalAmount) || 0), 0)
      const totalCollected = positiveInvoices.reduce((sum, i) => sum + (parseFloat(i.paidAmount) || 0), 0)
      setCollectionEfficiency(totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0)

      const invoicesTotalCount = getTotal(invoicesRes)
      const estimatesTotalCount = getTotal(estimatesRes)

      setStats({
        clients: getTotal(clientsRes),
        vendors: getTotal(vendorsRes),
        campaigns: getTotal(campaignsRes),
        estimates: estimatesTotalCount,
        pendingInvoices: invoiceData.filter(i => i.invoiceType !== 'CREDIT_NOTE' && (i.status === 'UNPAID' || i.status === 'PENDING')).length,
        outstanding: outstanding,
        vendorBills: getTotal(vendorBillsRes),
        bankEntries: getTotal(bankEntriesRes),
      })
      setRecentInvoices(invoiceData.slice(0, 5))

      // Invoice trend - exclude credit notes
      const trendSource = [...invoiceData]
        .filter(i => i.invoiceType !== 'CREDIT_NOTE')
        .reverse()
        .slice(-12)
      setInvoiceTrend(trendSource.map(i => ({
        date: shortDate(i.invoiceDate),
        amount: parseFloat(i.totalAmount) || 0,
      })))

      // Status breakdown - exclude credit notes
      const statusCounts = invoiceData
        .filter(i => i.invoiceType !== 'CREDIT_NOTE')
        .reduce((acc, i) => {
          const key = i.status || 'UNKNOWN'
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {})
      setStatusBreakdown(
        Object.entries(statusCounts).map(([status, count], idx) => ({
          status, count, color: getStatusColor(status, idx),
        }))
      )

      // GST Summary
      const summaryData = (() => {
        if (summaryRes.status !== 'fulfilled') return null
        const d = summaryRes.value.data
        return d?.data ?? d ?? null
      })()

      if (summaryData && summaryData.totalGstLiability !== undefined) {
        const liability = parseFloat(summaryData.totalGstLiability) || 0
        const input = parseFloat(summaryData.totalGstInput) || 0
        const net = summaryData.netGst !== undefined ? (parseFloat(summaryData.netGst) || 0) : (liability - input)
        setGstSummary({ liability, input, net })
      } else {
        const gstLiability = positiveInvoices.reduce((sum, i) =>
          sum + (parseFloat(i.cgstAmount) || 0) + (parseFloat(i.sgstAmount) || 0) + (parseFloat(i.igstAmount) || 0), 0)
        const gstInput = vendorBillData.reduce((sum, b) =>
          sum + (parseFloat(b.cgstAmount) || 0) + (parseFloat(b.sgstAmount) || 0) + (parseFloat(b.igstAmount) || 0), 0)
        setGstSummary({ liability: gstLiability, input: gstInput, net: gstLiability - gstInput })
      }

      setConversionFunnel({
        estimates: estimatesTotalCount,
        invoices: invoicesTotalCount,
        rate: estimatesTotalCount > 0 ? Math.min(100, Math.round((invoicesTotalCount / estimatesTotalCount) * 100)) : 0,
      })
    } catch (e) {
      console.error('Dashboard load error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const firstName = user?.fullName?.split(' ')[0] || 'User'
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()
  const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
  const trendTotal = invoiceTrend.reduce((sum, p) => sum + p.amount, 0)
  const statusTotal = statusBreakdown.reduce((sum, p) => sum + p.count, 0)

  const invoiceColumns = [
    { title: 'Invoice #', dataIndex: 'invoiceNumber', key: 'inv', render: v => <span style={styles.invoiceNumber}>{v}</span> },
    {
      title: 'Client', dataIndex: 'clientName', key: 'client',
      render: v => {
        if (!v) return '—'
        const initials = v.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
        return (
          <div style={styles.clientNameWrapper}>
            <span style={styles.clientAvatar}>{initials}</span>
            <span>{v}</span>
          </div>
        )
      }
    },
    { title: 'Amount', dataIndex: 'totalAmount', key: 'amt', align: 'right', render: v => <span style={styles.amountText}>{formatCurrency(v)}</span> },
    { title: 'Date', dataIndex: 'invoiceDate', key: 'date', render: v => formatDate(v) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: v => <StatusBadge status={v} /> },
  ]

  return (
    <div style={styles.container}>
      {/* ─── Welcome Banner ─── */}
      <div style={styles.welcomeBanner}>
        <div style={styles.welcomeContent}>
          <h1 style={styles.welcomeTitle}>{greeting}, {firstName} 👋</h1>
          <p style={styles.welcomeSubtitle}>{todayLabel} — here's what's happening with your business today.</p>
        </div>
        <div style={styles.welcomeActions}>
          <Tooltip title="Refresh dashboard">
            <Button icon={<ReloadOutlined spin={loading} />} onClick={load} style={styles.refreshBtn} />
          </Tooltip>
        </div>
      </div>

      {/* ─── Stats Row 1 ─── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}><StatCard loading={loading} title="Total Clients" value={stats.clients} icon={<TeamOutlined />} color="#0057FF" onClick={() => navigate('/clients')} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard loading={loading} title="Total Vendors" value={stats.vendors} icon={<ShopOutlined />} color="#00A86B" onClick={() => navigate('/vendors')} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard loading={loading} title="Campaigns" value={stats.campaigns} icon={<FlagOutlined />} color="#8B5CF6" onClick={() => navigate('/campaigns')} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard loading={loading} title="Estimates" value={stats.estimates} icon={<FileTextOutlined />} color="#F5A623" onClick={() => navigate('/estimates')} /></Col>
      </Row>

      {/* ─── Stats Row 2 ─── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12} lg={6}><StatCard loading={loading} title="Pending Invoices" value={stats.pendingInvoices} icon={<AuditOutlined />} color="#E5264A" onClick={() => navigate('/invoices')} /></Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            loading={loading} 
            title="Outstanding" 
            value={stats.outstanding.toLocaleString('en-IN', { maximumFractionDigits: 0 })} 
            icon={<WalletOutlined />} 
            color="#E5264A" 
            prefix="₹" 
          />
        </Col>
        <Col xs={24} sm={12} lg={6}><StatCard loading={loading} title="Vendor Bills" value={stats.vendorBills} icon={<FileTextOutlined />} color="#FF6B1A" onClick={() => navigate('/vendor-bills')} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard loading={loading} title="Bank Entries" value={stats.bankEntries} icon={<BankOutlined />} color="#0057FF" onClick={() => navigate('/bank-entries')} /></Col>
      </Row>

      {/* ─── Charts Row ─── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} lg={16}>
          <div style={styles.chartCard}>
            <div style={styles.chartCardBody}>
              <p style={styles.chartTitle}>Invoice Trend</p>
              <h2 style={styles.chartAmount}>{formatCurrency(trendTotal)}</h2>
              <p style={styles.chartSubtitle}>{invoiceTrend.length ? `Last ${invoiceTrend.length} invoices` : 'No invoices yet'}</p>
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={invoiceTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="invoiceTrendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF6B1A" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#FF6B1A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#A0AAC0' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#A0AAC0' }} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                    <RechartsTooltip formatter={(value) => [formatCurrency(value), 'Amount']} contentStyle={{ borderRadius: 8, border: '1px solid #EAECF4', fontFamily: "'Playfair Display', 'Georgia', serif" }} />
                    <Area type="monotone" dataKey="amount" stroke="#FF6B1A" strokeWidth={2.5} fill="url(#invoiceTrendFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div style={{ ...styles.chartCard, ...styles.chartCardBodyFull }}>
            <p style={styles.chartTitle}>Invoice Status</p>
            <div style={styles.donutContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="count" nameKey="status" innerRadius={55} outerRadius={75} paddingAngle={3}>
                    {statusBreakdown.map((entry) => <Cell key={entry.status} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <RechartsTooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={styles.donutCenter}>
                <div style={styles.donutCenterNumber}>{statusTotal}</div>
                <div style={styles.donutCenterLabel}>Invoices</div>
              </div>
            </div>
            <div style={styles.legendContainer}>
              {statusBreakdown.length === 0 && <span style={{ color: '#A0AAC0', fontSize: 13 }}>No invoices yet</span>}
              {statusBreakdown.map(s => (
                <div key={s.status} style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, background: s.color }} />
                  <span style={styles.legendLabel}>{s.status}</span>
                  <span style={styles.legendCount}>({s.count})</span>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* ─── Cash Flow Composed Chart + Collection Efficiency Gauge ─── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} lg={17}>
          <div style={styles.chartCard}>
            <div style={styles.chartCardBody}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <p style={styles.chartTitle}>Cash Flow & Profit Trend (Last 6 Months)</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {monthTrend.revenuePct !== null && (
                    <span style={{ ...styles.trendPill, background: monthTrend.revenuePct >= 0 ? '#E6F7EE' : '#FDEAEA', color: monthTrend.revenuePct >= 0 ? '#00A86B' : '#E5264A' }}>
                      Revenue {monthTrend.revenuePct >= 0 ? '▲' : '▼'} {Math.abs(monthTrend.revenuePct)}% MoM
                    </span>
                  )}
                  {monthTrend.expensePct !== null && (
                    <span style={{ ...styles.trendPill, background: monthTrend.expensePct <= 0 ? '#E6F7EE' : '#FDEAEA', color: monthTrend.expensePct <= 0 ? '#00A86B' : '#E5264A' }}>
                      Expense {monthTrend.expensePct >= 0 ? '▲' : '▼'} {Math.abs(monthTrend.expensePct)}% MoM
                    </span>
                  )}
                </div>
              </div>
              <p style={styles.chartSubtitle}>Revenue &amp; Expense bars with a Net Profit line overlay — month-wise</p>
              <div style={{ ...styles.chartContainer, height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyComparison} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A0AAC0' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#A0AAC0' }} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `₹${Math.abs(v) >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                    <RechartsTooltip
                      formatter={(value, name) => [formatCurrency(value), name === 'revenue' ? 'Revenue' : name === 'expense' ? 'Expense' : 'Net Profit']}
                      contentStyle={{ borderRadius: 8, border: '1px solid #EAECF4', fontFamily: "'Playfair Display', 'Georgia', serif" }}
                    />
                    <Legend formatter={(value) => value === 'revenue' ? 'Revenue (Invoices)' : value === 'expense' ? 'Expense (Vendor Bills)' : 'Net Profit'} wrapperStyle={{ fontSize: 12.5 }} />
                    <Bar dataKey="revenue" fill="#00A86B" radius={[4, 4, 0, 0]} barSize={26} />
                    <Bar dataKey="expense" fill="#E5264A" radius={[4, 4, 0, 0]} barSize={26} />
                    <Line type="monotone" dataKey="profit" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} lg={7}>
          <div style={{ ...styles.chartCard, height: '100%' }}>
            <div style={{ ...styles.chartCardBodyFull, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <p style={styles.chartTitle}>Collection Efficiency</p>
              <p style={styles.chartSubtitle}>% of billed revenue collected</p>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 200 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart
                    cx="50%" cy="50%" innerRadius="72%" outerRadius="100%" barSize={16}
                    data={[{ value: collectionEfficiency, fill: collectionEfficiency >= 70 ? '#00A86B' : collectionEfficiency >= 40 ? '#F5A623' : '#E5264A' }]}
                    startAngle={90} endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: '#F0F1F5' }} dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 800, fontSize: 30, color: '#0D1117' }}>{collectionEfficiency}%</div>
                  <div style={{ fontSize: 11, color: '#A0AAC0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collected</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#A0AAC0', textAlign: 'center', margin: '8px 0 0' }}>
                {collectionEfficiency >= 70 ? '🟢 Healthy collection rate' : collectionEfficiency >= 40 ? '🟠 Needs follow-up on dues' : '🔴 Low collection — review outstanding'}
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* ─── GST Summary + Estimate→Invoice Conversion Funnel ─── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} lg={12}>
          <div style={{ ...styles.chartCard, ...styles.chartCardBodyFull }}>
            <p style={styles.chartTitle}>GST Summary</p>
            <p style={styles.chartSubtitle}>Output liability vs input credit — full dataset</p>
            <div style={{ ...styles.chartContainer, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Output GST (Liability)', value: gstSummary.liability },
                    { name: 'Input GST (Credit)', value: gstSummary.input },
                  ]}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
                >
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#A0AAC0' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#5A6072', fontWeight: 600 }} axisLine={false} tickLine={false} width={150} />
                  <RechartsTooltip formatter={(value) => [formatCurrency(value), 'Amount']} contentStyle={{ borderRadius: 8, border: '1px solid #EAECF4', fontFamily: "'Playfair Display', 'Georgia', serif" }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                    <Cell fill="#E5264A" />
                    <Cell fill="#00A86B" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={styles.gstRow}>
                <span style={styles.gstLabel}>Output GST (Liability)</span>
                <span style={{ ...styles.gstValue, color: '#E5264A' }}>{formatCurrency(gstSummary.liability)}</span>
              </div>
              <div style={styles.gstRow}>
                <span style={styles.gstLabel}>Input GST (Credit)</span>
                <span style={{ ...styles.gstValue, color: '#00A86B' }}>{formatCurrency(gstSummary.input)}</span>
              </div>
              <div style={{ ...styles.gstRow, borderBottom: 'none' }}>
                <span style={{ ...styles.gstLabel, fontWeight: 800, color: '#0D1117' }}>Net GST Payable</span>
                <span style={{ ...styles.gstValue, color: gstSummary.net >= 0 ? '#0D1117' : '#00A86B' }}>{formatCurrency(gstSummary.net)}</span>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div style={{ ...styles.chartCard, ...styles.chartCardBodyFull }}>
            <p style={styles.chartTitle}>Estimate → Invoice Conversion</p>
            <p style={styles.chartSubtitle}>How many estimates eventually became invoices</p>
            <div style={{ marginTop: 16 }}>
              <div style={styles.funnelStage}>
                <div style={styles.funnelLabelRow}>
                  <span style={styles.funnelLabel}>📝 Estimates Created</span>
                  <span style={styles.funnelValue}>{conversionFunnel.estimates}</span>
                </div>
                <Progress percent={100} showInfo={false} strokeColor="#0057FF" trailColor="#F0F1F5" strokeWidth={14} />
              </div>
              <div style={styles.funnelStage}>
                <div style={styles.funnelLabelRow}>
                  <span style={styles.funnelLabel}>🧾 Converted to Invoices</span>
                  <span style={styles.funnelValue}>{conversionFunnel.invoices}</span>
                </div>
                <Progress percent={conversionFunnel.rate} showInfo={false} strokeColor="#FF6B1A" trailColor="#F0F1F5" strokeWidth={14} />
              </div>
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <div style={{ fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 800, fontSize: 36, color: '#0D1117' }}>{conversionFunnel.rate}%</div>
                <div style={{ fontSize: 12, color: '#A0AAC0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conversion Rate</div>
                <p style={{ fontSize: 12, color: '#A0AAC0', marginTop: 8 }}>
                  {conversionFunnel.rate >= 70
                    ? '🟢 Strong conversion — most estimates close'
                    : conversionFunnel.rate >= 40
                      ? '🟠 Average — follow up on pending estimates'
                      : '🔴 Low conversion — review estimate-to-invoice workflow'}
                </p>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* ─── Top Clients + Vendor Bill Status ─── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} lg={14}>
          <div style={styles.chartCard}>
            <div style={styles.chartCardBody}>
              <p style={styles.chartTitle}>Top 5 Clients by Revenue</p>
              <p style={styles.chartSubtitle}>{topClients.length ? 'Based on recent invoices loaded' : 'No invoice data yet'}</p>
              <div style={{ ...styles.chartContainer, height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topClients} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#A0AAC0' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#5A6072', fontWeight: 600 }} axisLine={false} tickLine={false} width={110} />
                    <RechartsTooltip formatter={(value) => [formatCurrency(value), 'Revenue']} contentStyle={{ borderRadius: 8, border: '1px solid #EAECF4', fontFamily: "'Playfair Display', 'Georgia', serif" }} />
                    <Bar dataKey="total" fill="#0057FF" radius={[0, 6, 6, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} lg={10}>
          <div style={{ ...styles.chartCard, ...styles.chartCardBodyFull }}>
            <p style={styles.chartTitle}>Vendor Bill Payment Status</p>
            <div style={styles.donutContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={billStatusBreakdown} dataKey="count" nameKey="status" innerRadius={55} outerRadius={75} paddingAngle={3}>
                    {billStatusBreakdown.map((entry) => <Cell key={entry.status} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <RechartsTooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={styles.donutCenter}>
                <div style={styles.donutCenterNumber}>{billStatusBreakdown.reduce((sum, b) => sum + b.count, 0)}</div>
                <div style={styles.donutCenterLabel}>Bills</div>
              </div>
            </div>
            <div style={styles.legendContainer}>
              {billStatusBreakdown.length === 0 && <span style={{ color: '#A0AAC0', fontSize: 13 }}>No vendor bills yet</span>}
              {billStatusBreakdown.map(s => (
                <div key={s.status} style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, background: s.color }} />
                  <span style={styles.legendLabel}>{s.status}</span>
                  <span style={styles.legendCount}>({s.count})</span>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      <div style={styles.quickActionsSection}>
        <p style={styles.quickActionsTitle}>Quick Actions</p>
        <Row gutter={[12, 12]}>
          {quickActions.map(a => (
            <Col key={a.path} xs={12} sm={8} md={6} lg={4}>
              <QuickActionBtn label={a.label} path={a.path} color={a.color} onClick={() => navigate(a.path)} />
            </Col>
          ))}
        </Row>
      </div>

      {/* ─── Recent Invoices + Recent Activity ─── */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <div style={styles.invoiceCard}>
            <Card
              title={<span style={styles.invoiceCardTitle}>Recent Invoices</span>}
              extra={<span style={styles.viewAllLink} onClick={() => navigate('/invoices')}>View All →</span>}
              style={{ borderRadius: 16, border: '1px solid #EAECF4', boxShadow: '0 1px 2px rgba(13,17,23,0.04)' }}
            >
              <Table
                dataSource={recentInvoices}
                columns={invoiceColumns}
                rowKey="id"
                pagination={false}
                loading={loading}
                size="small"
                locale={{ emptyText: 'No recent invoices' }}
                onRow={(row) => ({ onClick: () => navigate(`/invoices/${row.id}`) })}
              />
            </Card>
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<span style={styles.invoiceCardTitle}>Recent Activity</span>}
            style={{ borderRadius: 16, border: '1px solid #EAECF4', boxShadow: '0 1px 2px rgba(13,17,23,0.04)', height: '100%' }}
            bodyStyle={{ padding: '4px 16px' }}
          >
            {recentActivity.length === 0 ? (
              <p style={{ color: '#A0AAC0', textAlign: 'center', padding: '24px 0', fontSize: 13 }}>No recent activity</p>
            ) : (
              recentActivity.map((a, idx) => {
                const ICONS = {
                  INVOICE: { icon: '🧾', bg: '#EEF3FF', color: '#0057FF' },
                  CREDIT_NOTE: { icon: '↩️', bg: '#FDEAEA', color: '#E5264A' },
                  VENDOR_BILL: { icon: '📦', bg: '#FFF3E8', color: '#FF6B1A' },
                }
                const meta = ICONS[a.type] || ICONS.INVOICE
                return (
                  <div
                    key={a.id}
                    style={{ ...styles.activityItem, borderBottom: idx === recentActivity.length - 1 ? 'none' : styles.activityItem.borderBottom }}
                    onClick={() => navigate(a.path)}
                  >
                    <div style={{ ...styles.activityIconWrap, background: meta.bg, color: meta.color }}>{meta.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.activityTitle}>{a.title}</div>
                      <div style={styles.activitySubtitle}>{a.subtitle}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ ...styles.activityAmount, color: a.type === 'CREDIT_NOTE' ? '#E5264A' : '#0D1117' }}>{formatCurrency(a.amount)}</div>
                      <div style={styles.activityDate}>{formatDate(a.date)}</div>
                    </div>
                  </div>
                )
              })
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}