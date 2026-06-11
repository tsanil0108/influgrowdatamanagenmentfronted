import React from 'react'
import { Layout, Avatar, Dropdown, Space } from 'antd'
import { UserOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'
import { useSelector } from 'react-redux'

const { Header: AntHeader } = Layout

const capitalizeName = (name) => {
  if (!name) return 'User'
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export default function Header() {
  const { user, logout } = useAuth()
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed)

  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: logout,
    },
  ]

  const displayName = capitalizeName(user?.fullName || user?.username)

  return (
    <AntHeader style={{
      position: 'fixed',
      top: 0,
      right: 0,
      left: collapsed ? 80 : 240,
      zIndex: 99,
      height: 60,
      padding: '0 24px',
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'left 0.2s ease',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 15,
        color: 'var(--color-text-secondary)',
        letterSpacing: '0.01em',
      }}>
        Influencer Marketing Platform
      </div>

      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Space style={{ cursor: 'pointer' }}>
          <Avatar
            size={32}
            icon={<UserOutlined />}
            style={{ background: '#FF6B1A' }}
          />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            fontSize: 14,
          }}>
            {displayName}
          </span>
          <DownOutlined style={{ fontSize: 10, color: 'var(--color-text-muted)' }} />
        </Space>
      </Dropdown>
    </AntHeader>
  )
}