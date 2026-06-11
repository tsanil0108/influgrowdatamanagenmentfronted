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
      borderRadius: 12,
      border: '1px solid #EAECF4',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      boxShadow: 'none',
    }}
    bodyStyle={{ padding: '20px 24px' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Statistic
        title={
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.07em',
            color: '#A0AAC0',
          }}>{title}</span>
        }
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 30, color: '#0D1117', lineHeight: 1.2, marginTop: 6,
        }}
      />
      <div style={{
        width: 48, height: 48,
        borderRadius: 12,
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, color,
        flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  </Card>
)

const quickActions = [
  { label: 'New Estimate', path: '/estimates/new', color: '#0057FF', bg: '#EEF3FF' },
  { label: 'New Invoice',  path: '/invoices/new',  color: '#FF6B1A', bg: '#FFF1E8' },
  { label: 'Add Client',   path: '/clients/new',   color: '#00A86B', bg: '#E6F7F1' },
  { label: 'Record Receipt', path: '/bank-entries/receipt/new', color: '#8B5CF6', bg: '#F3F0FF' },
  { label: 'View Reports', path: '/reports',        color: '#5A6072', bg: '#F0F2F8' },
]

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
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const invoiceColumns = [
    {
      title: 'Invoice #', dataIndex: 'invoiceNumber', key: 'inv',
      render: v => <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#FF6B1A' }}>{v}</span>
    },
    { title: 'Client', dataIndex: ['client', 'clientName'], key: 'client', render: v => v || '—' },
    {
      title: 'Amount', dataIndex: 'totalAmount', key: 'amt', align: 'right',
      render: v => <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{formatCurrency(v)}</span>
    },
    { title: 'Date', dataIndex: 'invoiceDate', key: 'date', render: v => formatDate(v) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: v => <StatusBadge status={v} /> },
  ]

  const firstName = user?.fullName?.split(' ')[0] || 'User'

  return (
    <div>
      {/* Welcome */}
      <div style={{
        marginBottom: 28,
        padding: '24px 28px',
        background: 'linear-gradient(135deg, #FF6B1A 0%, #FF9A00 100%)',
        borderRadius: 16,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
          margin: 0, color: '#fff',
        }}>
          Welcome back, {firstName} 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6, fontSize: 14, marginBottom: 0 }}>
          Here's what's happening with your campaigns today.
        </p>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Total Clients" value={stats.clients} icon={<TeamOutlined />} color="#0057FF" onClick={() => navigate('/clients')} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Pending Invoices" value={stats.pendingInvoices} icon={<AuditOutlined />} color="#F5A623" onClick={() => navigate('/invoices')} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Outstanding" value={stats.outstanding.toLocaleString('en-IN', { maximumFractionDigits: 0 })} icon={<WalletOutlined />} color="#E5264A" prefix="₹" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Estimates" value="—" icon={<FileTextOutlined />} color="#00A86B" onClick={() => navigate('/estimates')} />
        </Col>
      </Row>

      {/* Quick Actions */}
      <div style={{ marginBottom: 24 }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
          textTransform: 'uppercase', letterSpacing: '0.07em',
          color: '#A0AAC0', marginBottom: 12,
        }}>Quick Actions</p>
        <Row gutter={[12, 12]}>
          {quickActions.map(a => (
            <Col key={a.path} xs={12} sm={8} md={6} lg={4}>
              <Card
                hoverable
                onClick={() => navigate(a.path)}
                style={{
                  borderRadius: 10,
                  border: `1px solid ${a.color}22`,
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: a.bg,
                  boxShadow: 'none',
                  transition: 'transform 0.15s ease',
                }}
                bodyStyle={{ padding: '14px 10px' }}
              >
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 12.5, color: a.color,
                }}>{a.label}</span>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Recent Invoices */}
      <Card
        title={
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
            Recent Invoices
          </span>
        }
        extra={
          <a
            onClick={() => navigate('/invoices')}
            style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#FF6B1A' }}
          >
            View All →
          </a>
        }
        style={{ borderRadius: 12, border: '1px solid #EAECF4', boxShadow: 'none' }}
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