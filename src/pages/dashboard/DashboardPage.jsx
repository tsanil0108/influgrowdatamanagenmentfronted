// src/pages/DashboardPage.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { Row, Col, Card, Statistic, Table, Button, Tooltip } from 'antd'
import { TeamOutlined, FileTextOutlined, AuditOutlined, WalletOutlined, ReloadOutlined, ShopOutlined, BankOutlined, FlagOutlined } from '@ant-design/icons'
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { formatCurrency, formatDate } from '../../utils/formatters'
import StatusBadge from '../../components/common/StatusBadge'
import { useSelector } from 'react-redux'

// ─── Inline Styles ──────────────────────────────────────────────────────────────
const styles = {
  container: {
    padding: '32px 40px',
    minHeight: '100vh',
    background: '#f8f6f3',
  },

  // Welcome Banner
  welcomeBanner: {
    background: 'linear-gradient(135deg, #FF6B1A 0%, #FF9A00 100%)',
    borderRadius: 20,
    padding: '28px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 12px 28px -10px rgba(255,107,26,0.45)',
    marginBottom: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  welcomeContent: {
    position: 'relative',
    zIndex: 1,
  },
  welcomeTitle: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    fontSize: 14,
    marginBottom: 0,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  welcomeActions: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  refreshBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: '#ffffff',
    borderRadius: 8,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  // Stat Card
  statCard: {
    borderRadius: 16,
    border: '1px solid #EAECF4',
    boxShadow: '0 1px 2px rgba(13,17,23,0.04)',
    background: '#ffffff',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  statCardHover: {
    boxShadow: '0 12px 28px -8px rgba(13,17,23,0.12)',
    transform: 'translateY(-3px)',
    borderColor: '#d4b88a',
  },
  statCardBody: {
    padding: '20px 24px',
  },
  statCardContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCardInfo: {
    minWidth: 0,
    flex: 1,
  },
  statCardTitle: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: '#A0AAC0',
    whiteSpace: 'nowrap',
    display: 'block',
  },
  statCardValue: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontWeight: 800,
    color: '#0D1117',
    lineHeight: 1.2,
    marginTop: 6,
    display: 'flex',
    alignItems: 'baseline',
    gap: 3,
  },
  statIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 21,
    flexShrink: 0,
  },

  // Chart Cards
  chartCard: {
    borderRadius: 16,
    border: '1px solid #EAECF4',
    boxShadow: '0 1px 2px rgba(13,17,23,0.04)',
    background: '#ffffff',
    height: '100%',
  },
  chartCardBody: {
    padding: '24px 24px 8px',
  },
  chartCardBodyFull: {
    padding: 24,
  },
  chartTitle: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontWeight: 700,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: '#A0AAC0',
    margin: 0,
  },
  chartAmount: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontWeight: 800,
    fontSize: 26,
    margin: '6px 0 0',
    color: '#0D1117',
  },
  chartSubtitle: {
    fontSize: 12.5,
    color: '#A0AAC0',
    margin: '2px 0 12px',
  },
  chartContainer: {
    width: '100%',
    height: 240,
  },

  // Donut Chart
  donutContainer: {
    position: 'relative',
    width: '100%',
    height: 170,
  },
  donutCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    pointerEvents: 'none',
  },
  donutCenterNumber: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontWeight: 800,
    fontSize: 22,
    color: '#0D1117',
  },
  donutCenterLabel: {
    fontSize: 11,
    color: '#A0AAC0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  legendContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 16px',
    marginTop: 16,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12.5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  legendLabel: {
    color: '#5A6072',
    fontWeight: 600,
  },
  legendCount: {
    color: '#A0AAC0',
  },

  // Quick Actions
  quickActionsSection: {
    marginBottom: 28,
  },
  quickActionsTitle: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontWeight: 700,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: '#A0AAC0',
    marginBottom: 12,
  },
  quickActionBtn: {
    borderRadius: 12,
    textAlign: 'center',
    cursor: 'pointer',
    padding: '15px 10px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },

  // Recent Invoices Table
  invoiceCard: {
    borderRadius: 16,
    border: '1px solid #EAECF4',
    boxShadow: '0 1px 2px rgba(13,17,23,0.04)',
    background: '#ffffff',
  },
  invoiceCardTitle: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontWeight: 700,
    fontSize: 15,
  },
  viewAllLink: {
    fontSize: 13,
    color: '#FF6B1A',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  invoiceNumber: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontWeight: 700,
    color: '#FF6B1A',
  },
  clientAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#EEF3FF',
    color: '#0057FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'Playfair Display', 'Georgia', serif",
    flexShrink: 0,
  },
  clientNameWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  amountText: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontWeight: 700,
  },
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
        ...(isHovered && onClick && {
          boxShadow: '0 12px 28px -8px rgba(13,17,23,0.12)',
          transform: 'translateY(-3px)',
          borderColor: '#d4b88a',
        }),
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
              {loading ? (
                <span style={{ opacity: 0.5 }}>—</span>
              ) : (
                <span style={{ fontSize }}>{value}</span>
              )}
              {suffix && <span style={{ fontWeight: 800, color: '#0D1117' }}>{suffix}</span>}
            </div>
          </div>
          <div style={{ ...styles.statIconWrapper, background: color + '1F', color }}>
            {icon}
          </div>
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
      <span style={{ fontFamily: "'Playfair Display', 'Georgia', serif", fontWeight: 700, fontSize: 12.5, color: '#fff' }}>
        {label}
      </span>
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
  const [loading, setLoading] = useState(true)

  const STATUS_COLORS = {
    PAID: '#00A86B',
    UNPAID: '#E5264A',
    PENDING: '#F5A623',
    OVERDUE: '#E5264A',
    DRAFT: '#A0AAC0',
    CANCELLED: '#A0AAC0',
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
        invoicesRes, vendorBillsRes, bankEntriesRes,
      ] = await Promise.allSettled([
        axiosInstance.get('/clients', { params: { page: 0, size: 1 } }),
        axiosInstance.get('/vendors', { params: { page: 0, size: 1 } }),
        axiosInstance.get('/campaigns', { params: { page: 0, size: 1 } }),
        axiosInstance.get('/estimates', { params: { page: 0, size: 1 } }),
        axiosInstance.get('/invoices', { params: { page: 0, size: 30, sort: 'invoiceDate,desc' } }),
        axiosInstance.get('/vendor-bills', { params: { page: 0, size: 1 } }),
        axiosInstance.get('/bank-entries', { params: { page: 0, size: 1 } }),
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

      const outstanding = invoiceData
        .filter(i => i.status !== 'PAID')
        .reduce((sum, i) => sum + (parseFloat(i.totalAmount) || 0), 0)

      setStats({
        clients: getTotal(clientsRes),
        vendors: getTotal(vendorsRes),
        campaigns: getTotal(campaignsRes),
        estimates: getTotal(estimatesRes),
        pendingInvoices: invoiceData.filter(i => i.status === 'UNPAID' || i.status === 'PENDING').length,
        outstanding,
        vendorBills: getTotal(vendorBillsRes),
        bankEntries: getTotal(bankEntriesRes),
      })
      setRecentInvoices(invoiceData.slice(0, 5))

      const trendSource = [...invoiceData].reverse().slice(-12)
      setInvoiceTrend(trendSource.map(i => ({
        date: shortDate(i.invoiceDate),
        amount: parseFloat(i.totalAmount) || 0,
      })))

      const statusCounts = invoiceData.reduce((acc, i) => {
        const key = i.status || 'UNKNOWN'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
      setStatusBreakdown(
        Object.entries(statusCounts).map(([status, count], idx) => ({
          status, count, color: getStatusColor(status, idx),
        }))
      )
    } catch (e) {
      console.error('Dashboard load error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const firstName = user?.fullName?.split(' ')[0] || 'User'
  const trendTotal = invoiceTrend.reduce((sum, p) => sum + p.amount, 0)
  const statusTotal = statusBreakdown.reduce((sum, p) => sum + p.count, 0)

  const invoiceColumns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'inv',
      render: v => <span style={styles.invoiceNumber}>{v}</span>
    },
    {
      title: 'Client',
      dataIndex: ['client', 'clientName'],
      key: 'client',
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
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'amt',
      align: 'right',
      render: v => <span style={styles.amountText}>{formatCurrency(v)}</span>
    },
    { title: 'Date', dataIndex: 'invoiceDate', key: 'date', render: v => formatDate(v) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: v => <StatusBadge status={v} /> },
  ]

  return (
    <div style={styles.container}>
      {/* ─── Welcome Banner ─── */}
      <div style={styles.welcomeBanner}>
        <div style={styles.welcomeContent}>
          <h1 style={styles.welcomeTitle}>Welcome back, {firstName} 👋</h1>
          <p style={styles.welcomeSubtitle}>Here's what's happening with your business today.</p>
        </div>
        <div style={styles.welcomeActions}>
          <Tooltip title="Refresh dashboard">
            <Button
              icon={<ReloadOutlined spin={loading} />}
              onClick={load}
              style={styles.refreshBtn}
            />
          </Tooltip>
        </div>
      </div>

      {/* ─── Stats Row 1 ─── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard loading={loading} title="Total Clients" value={stats.clients} icon={<TeamOutlined />} color="#0057FF" onClick={() => navigate('/clients')} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard loading={loading} title="Total Vendors" value={stats.vendors} icon={<ShopOutlined />} color="#00A86B" onClick={() => navigate('/vendors')} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard loading={loading} title="Campaigns" value={stats.campaigns} icon={<FlagOutlined />} color="#8B5CF6" onClick={() => navigate('/campaigns')} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard loading={loading} title="Estimates" value={stats.estimates} icon={<FileTextOutlined />} color="#F5A623" onClick={() => navigate('/estimates')} />
        </Col>
      </Row>

      {/* ─── Stats Row 2 ─── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard loading={loading} title="Pending Invoices" value={stats.pendingInvoices} icon={<AuditOutlined />} color="#E5264A" onClick={() => navigate('/invoices')} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard loading={loading} title="Outstanding" value={stats.outstanding.toLocaleString('en-IN', { maximumFractionDigits: 0 })} icon={<WalletOutlined />} color="#E5264A" prefix="₹" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard loading={loading} title="Vendor Bills" value={stats.vendorBills} icon={<FileTextOutlined />} color="#FF6B1A" onClick={() => navigate('/vendor-bills')} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard loading={loading} title="Bank Entries" value={stats.bankEntries} icon={<BankOutlined />} color="#0057FF" onClick={() => navigate('/bank-entries')} />
        </Col>
      </Row>

      {/* ─── Charts Row ─── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        {/* Invoice Trend Chart */}
        <Col xs={24} lg={16}>
          <div style={styles.chartCard}>
            <div style={styles.chartCardBody}>
              <p style={styles.chartTitle}>Invoice Trend</p>
              <h2 style={styles.chartAmount}>{formatCurrency(trendTotal)}</h2>
              <p style={styles.chartSubtitle}>
                {invoiceTrend.length ? `Last ${invoiceTrend.length} invoices` : 'No invoices yet'}
              </p>
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
                    <YAxis
                      tick={{ fontSize: 11, fill: '#A0AAC0' }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                      tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                    />
                    <RechartsTooltip
                      formatter={(value) => [formatCurrency(value), 'Amount']}
                      contentStyle={{ borderRadius: 8, border: '1px solid #EAECF4', fontFamily: "'Playfair Display', 'Georgia', serif" }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#FF6B1A" strokeWidth={2.5} fill="url(#invoiceTrendFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Col>

        {/* Invoice Status Donut */}
        <Col xs={24} lg={8}>
          <div style={{ ...styles.chartCard, ...styles.chartCardBodyFull }}>
            <p style={styles.chartTitle}>Invoice Status</p>
            <div style={styles.donutContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="count" nameKey="status" innerRadius={55} outerRadius={75} paddingAngle={3}>
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} stroke="none" />
                    ))}
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
              {statusBreakdown.length === 0 && (
                <span style={{ color: '#A0AAC0', fontSize: 13 }}>No invoices yet</span>
              )}
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

      {/* ─── Quick Actions ─── */}
      <div style={styles.quickActionsSection}>
        <p style={styles.quickActionsTitle}>Quick Actions</p>
        <Row gutter={[12, 12]}>
          {quickActions.map(a => (
            <Col key={a.path} xs={12} sm={8} md={6} lg={4}>
              <QuickActionBtn
                label={a.label}
                path={a.path}
                color={a.color}
                onClick={() => navigate(a.path)}
              />
            </Col>
          ))}
        </Row>
      </div>

      {/* ─── Recent Invoices ─── */}
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
    </div>
  )
}