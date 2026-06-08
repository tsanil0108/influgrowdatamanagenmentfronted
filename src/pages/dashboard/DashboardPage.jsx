import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Table, Tag } from 'antd'
import { TeamOutlined, FileTextOutlined, AuditOutlined, WalletOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { formatCurrency, formatDate } from '../../utils/formatters'
import StatusBadge from '../../components/common/StatusBadge'
import { useSelector } from 'react-redux'

const StatCard = ({ title, value, icon, color, prefix, suffix, onClick }) => (
  <Card
    hoverable={!!onClick}
    onClick={onClick}
    style={{
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Statistic
        title={<span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>{title}</span>}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--color-text-primary)' }}
      />
      <div style={{
        width: 52, height: 52,
        borderRadius: 14,
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, color,
      }}>
        {icon}
      </div>
    </div>
  </Card>
)

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useSelector(s => s.auth.user)
  const [stats, setStats] = useState({ clients: 0, pendingInvoices: 0, outstanding: 0, campaigns: 0 })
  const [recentInvoices, setRecentInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [clientsRes, invoicesRes] = await Promise.all([
          axiosInstance.get('/clients', { params: { size: 1 } }).catch(() => ({ data: { totalElements: 0 } })),
          axiosInstance.get('/invoices', { params: { size: 5, sort: 'invoiceDate,desc' } }).catch(() => ({ data: { content: [], totalElements: 0 } })),
        ])
        const invoices = invoicesRes.data.content || invoicesRes.data || []
        const outstanding = invoices
          .filter(i => i.status !== 'PAID')
          .reduce((sum, i) => sum + (parseFloat(i.totalAmount) || 0), 0)

        setStats({
          clients: clientsRes.data.totalElements || 0,
          pendingInvoices: invoices.filter(i => i.status === 'UNPAID').length,
          outstanding,
          campaigns: 0,
        })
        setRecentInvoices(invoices.slice(0, 5))
      } catch {
        // silently fail — backend may not be running
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const invoiceColumns = [
    { title: 'Invoice #', dataIndex: 'invoiceNumber', key: 'inv', render: v => <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-brand)' }}>{v}</span> },
    { title: 'Client', dataIndex: ['client', 'clientName'], key: 'client', render: v => v || '—' },
    { title: 'Amount', dataIndex: 'totalAmount', key: 'amt', align: 'right', render: v => <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{formatCurrency(v)}</span> },
    { title: 'Date', dataIndex: 'invoiceDate', key: 'date', render: v => formatDate(v) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: v => <StatusBadge status={v} /> },
  ]

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
          Welcome back, {user?.fullName?.split(' ')[0] || 'User'} 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>Here's what's happening with your campaigns today.</p>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Total Clients" value={stats.clients} icon={<TeamOutlined />} color="var(--color-brand)" onClick={() => navigate('/clients')} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Pending Invoices" value={stats.pendingInvoices} icon={<AuditOutlined />} color="var(--color-warning)" onClick={() => navigate('/invoices')} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Outstanding (₹)" value={stats.outstanding.toLocaleString('en-IN', { maximumFractionDigits: 0 })} icon={<WalletOutlined />} color="var(--color-error)" prefix="₹" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Estimates" value="—" icon={<FileTextOutlined />} color="var(--color-success)" onClick={() => navigate('/estimates')} />
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
        {[
          { label: 'New Estimate', path: '/estimates/new', color: 'var(--color-brand)', bg: 'var(--color-brand-light)' },
          { label: 'New Invoice', path: '/invoices/new', color: 'var(--color-accent)', bg: 'var(--color-accent-light)' },
          { label: 'Add Client', path: '/clients/new', color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
          { label: 'Record Receipt', path: '/bank-entries/receipt/new', color: '#8B5CF6', bg: '#F3F0FF' },
          { label: 'View Reports', path: '/reports', color: 'var(--color-text-secondary)', bg: 'var(--color-surface-2)' },
        ].map(a => (
          <Col key={a.path} xs={12} sm={8} md={6} lg={4}>
            <Card
              hoverable
              onClick={() => navigate(a.path)}
              style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center', cursor: 'pointer', background: a.bg }}
              bodyStyle={{ padding: '16px 12px' }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: a.color }}>{a.label}</span>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Invoices */}
      <Card
        title={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Recent Invoices</span>}
        extra={<a onClick={() => navigate('/invoices')} style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>View All →</a>}
        style={{ borderRadius: 'var(--radius-lg)' }}
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
  )
}