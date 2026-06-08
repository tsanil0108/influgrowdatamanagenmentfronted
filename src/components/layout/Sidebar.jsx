import React, { useState } from 'react'
import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setSidebarCollapsed } from '../../store/uiSlice'
import {
  DashboardOutlined, TeamOutlined, ShopOutlined, BankOutlined,
  ProjectOutlined, FileTextOutlined, AuditOutlined, FileDoneOutlined,
  WalletOutlined, BarChartOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons'

const { Sider } = Layout

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  {
    key: 'masters', icon: <ProjectOutlined />, label: 'Masters',
    children: [
      { key: '/clients', icon: <TeamOutlined />, label: 'Clients' },
      { key: '/vendors', icon: <ShopOutlined />, label: 'Vendors' },
      { key: '/banks', icon: <BankOutlined />, label: 'Bank Accounts' },
      { key: '/campaigns', icon: <ProjectOutlined />, label: 'Campaigns' },
    ],
  },
  { key: '/estimates', icon: <FileTextOutlined />, label: 'Estimates' },
  { key: '/invoices', icon: <AuditOutlined />, label: 'Invoices' },
  { key: '/vendor-bills', icon: <FileDoneOutlined />, label: 'Vendor Bills' },
  { key: '/bank-entries', icon: <WalletOutlined />, label: 'Bank Entries' },
  { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed)
  const [openKeys, setOpenKeys] = useState(['masters'])

  const selectedKey = '/' + location.pathname.split('/')[1]

  const handleMenuClick = ({ key }) => {
    if (key.startsWith('/')) navigate(key)
  }

  return (
    <Sider
      collapsed={collapsed}
      width={240}
      collapsedWidth={80}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        background: 'var(--color-text-primary)',
        overflow: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0 24px' : '0 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--color-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: 14,
            }}>IG</div>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              color: '#fff', fontSize: 16, letterSpacing: '-0.02em',
            }}>InfluGrow</span>
          </div>
        )}
        <div
          onClick={() => dispatch(setSidebarCollapsed(!collapsed))}
          style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16 }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={setOpenKeys}
        onClick={handleMenuClick}
        items={menuItems}
        style={{
          background: 'transparent',
          border: 'none',
          marginTop: 8,
          fontFamily: 'var(--font-body)',
        }}
      />
    </Sider>
  )
}