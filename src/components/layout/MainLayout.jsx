import React from 'react'
import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import { useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import Header from './Header'

const { Content } = Layout

export default function MainLayout() {
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 240,
          transition: 'margin-left 0.2s ease',
        }}
      >
        <Header />
        <Content
          style={{
            marginTop: 60,
            padding: '24px',
            minHeight: 'calc(100vh - 60px)',
            background: 'var(--color-bg)',
          }}
        >
          <div className="page-enter">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}