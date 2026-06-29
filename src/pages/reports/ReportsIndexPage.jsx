import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Col,
  Row,
  Typography,
  Button,
  message,
} from 'antd'

import {
  TeamOutlined,
  ShopOutlined,
  FlagOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  DollarOutlined,
  AuditOutlined,
  SwapOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons'
import backupApi from '../../api/backupApi'

const { Title, Text } = Typography

const REPORTS = [
  {
    key: 'client-master',
    title: 'Client Master',
    desc: 'All clients master data',
    icon: <TeamOutlined />,
    color: '#1677ff',
  },
  {
    key: 'vendor-master',
    title: 'Vendor Master',
    desc: 'All vendors master data',
    icon: <ShopOutlined />,
    color: '#722ed1',
  },
  {
    key: 'campaign-master',
    title: 'Campaign Master',
    desc: 'Campaign wise details',
    icon: <FlagOutlined />,
    color: '#52c41a',
  },
  {
    key: 'estimates',
    title: 'Estimates',
    desc: 'Estimate report',
    icon: <FileTextOutlined />,
    color: '#fa8c16',
  },
  {
    key: 'purchase-orders',
    title: 'Purchase Orders',
    desc: 'PO report',
    icon: <ShoppingOutlined />,
    color: '#f5222d',
  },
  {
    key: 'invoices',
    title: 'Invoices',
    desc: 'Invoice report',
    icon: <DollarOutlined />,
    color: '#13c2c2',
  },
  {
    key: 'vendor-invoices',
    title: 'Vendor Invoices',
    desc: 'Vendor bills report',
    icon: <AuditOutlined />,
    color: '#722ed1',
  },
  {
    key: 'invoice-vendor-bills',
    title: 'Invoice Vendor Bills',
    desc: 'Invoice vs vendor bills',
    icon: <SwapOutlined />,
    color: '#d48806',
  },
  {
    key: 'campaign-margin',
    title: 'Campaign Margin',
    desc: 'Revenue vs Cost',
    icon: <BarChartOutlined />,
    color: '#389e0d',
  },
  {
    key: 'client-outstanding',
    title: 'Client Outstanding',
    desc: 'Pending client payments',
    icon: <ClockCircleOutlined />,
    color: '#cf1322',
  },
  {
    key: 'vendor-outstanding',
    title: 'Vendor Outstanding',
    desc: 'Pending vendor payments',
    icon: <AlertOutlined />,
    color: '#fa8c16',
  },
]

const ReportsIndexPage = () => {
  const navigate = useNavigate()
  const [backingUp, setBackingUp] = useState(false)

  // ✅ NEW — downloads a ZIP backup of all data (clients, vendors, campaigns,
  // estimates, invoices/credit-notes, vendor bills, banks, bank entries).
  const handleBackup = async () => {
    setBackingUp(true)
    try {
      const res = await backupApi.downloadBackup()
      const blob = new Blob([res.data], { type: 'application/zip' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')
      link.href = url
      link.setAttribute('download', `influgrow-backup-${stamp}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      message.success('Backup downloaded')
    } catch (err) {
      console.error('Backup error:', err)
      message.error('Failed to generate backup')
    } finally {
      setBackingUp(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          marginBottom: 24,
        }}
      >
        <Title level={3}>
          Reports Dashboard
        </Title>

        <Text type="secondary">
          View and export business reports
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        {REPORTS.map((report) => (
          <Col
            key={report.key}
            xs={24}
            sm={12}
            md={8}
            lg={8}
            xl={6}
          >
            <Card
              hoverable
              onClick={() =>
                navigate(
                  `/reports/${report.key}`
                )
              }
              style={{
                borderRadius: 12,
                cursor: 'pointer',
                height: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    background:
                      report.color + '15',
                    color: report.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {report.icon}
                </div>

                <div>
                  <Text
                    strong
                    style={{
                      display: 'block',
                      fontSize: 15,
                      marginBottom: 4,
                    }}
                  >
                    {report.title}
                  </Text>

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    {report.desc}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ✅ NEW — Backup section, shown below the reports grid as requested */}
      <div style={{ marginTop: 32 }}>
        <Title level={4}>Backup</Title>
        <Text type="secondary">Download a full backup of your data (clients, vendors, campaigns, estimates, invoices, vendor bills, banks, bank entries)</Text>
        <Card style={{ borderRadius: 12, marginTop: 12, maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 50, height: 50, borderRadius: 12,
                background: '#0057FF15', color: '#0057FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
              }}
            >
              <CloudDownloadOutlined />
            </div>
            <div style={{ flex: 1 }}>
              <Text strong style={{ display: 'block', fontSize: 15 }}>Download Backup</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>Saves a ZIP file with all your data as of right now</Text>
            </div>
            <Button type="primary" icon={<CloudDownloadOutlined />} loading={backingUp} onClick={handleBackup}>
              Backup
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ReportsIndexPage