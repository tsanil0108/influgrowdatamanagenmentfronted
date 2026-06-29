import React, { useState } from 'react'
import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setSidebarCollapsed } from '../../store/uiSlice'
import {
  DashboardOutlined, TeamOutlined, ShopOutlined, BankOutlined,
  ProjectOutlined, FileTextOutlined, AuditOutlined, FileDoneOutlined,
  WalletOutlined, BarChartOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  MinusSquareOutlined,
} from '@ant-design/icons'
import logo from '../../assets/logo.png'   // apna file naam yahan daalo e.g. logo.png / logo.svg

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
  {
    key: 'credit-note', icon: <MinusSquareOutlined />, label: 'Credit Note',
    children: [
      { key: '/invoices/credit-note/new', icon: <MinusSquareOutlined />, label: 'Generate Credit Note' },
      { key: '/reports/invoices', icon: <BarChartOutlined />, label: 'View Credit Notes' },
    ],
  },
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
        background: '#FFFFFF',
        overflow: 'auto',
        borderRight: '1px solid #EAECF4',
      }}
    >
      {/* Logo */}
      <div style={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0 24px' : '0 20px',
        borderBottom: '1px solid #EAECF4',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {collapsed ? (
          /* Collapsed: sirf square logo */
          <img
            src={logo}
            alt="InfluGrow"
            style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 8 }}
          />
        ) : (
          /* Expanded: full logo + collapse button */
          <>
            <img
              src={logo}
              alt="InfluGrow"
              style={{ height: 32, maxWidth: 140, objectFit: 'contain' }}
            />
            <div
              onClick={() => dispatch(setSidebarCollapsed(!collapsed))}
              style={{ color: '#A0AAC0', cursor: 'pointer', fontSize: 16 }}
            >
              <MenuFoldOutlined />
            </div>
          </>
        )}
      </div>

      {/* Collapsed: unfold button */}
      {collapsed && (
        <div
          onClick={() => dispatch(setSidebarCollapsed(!collapsed))}
          style={{
            display: 'flex', justifyContent: 'center',
            padding: '12px 0', color: '#A0AAC0', cursor: 'pointer', fontSize: 16,
          }}
        >
          <MenuUnfoldOutlined />
        </div>
      )}

      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[selectedKey]}
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={setOpenKeys}
        onClick={handleMenuClick}
        items={menuItems}
        style={{
          background: 'transparent',
          border: 'none',
          marginTop: collapsed ? 0 : 8,
          fontFamily: 'var(--font-body)',
        }}
      />
    </Sider>
  )
}