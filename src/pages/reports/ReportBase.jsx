import React, { useEffect, useState } from 'react'
import {
    Card,
    Table,
    Input,
    Button,
    Space,
    Typography,
    Row,
    Col,
    DatePicker,
    message,
} from 'antd'
import {
    SearchOutlined,
    ReloadOutlined,
    DownloadOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import reportApi from '../../api/reportApi'

const { Title } = Typography
const { RangePicker } = DatePicker

export const formatDate = (date) => {
    if (!date) return '-'
    return dayjs(date).format('DD/MM/YYYY')
}

export const formatINR = (amount) => {
    if (amount == null) return '-'
    return `₹${Number(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`
}

// Transform backend columnar response → array of objects
const transformResponse = (payload) => {
    if (Array.isArray(payload)) return payload

    if (payload?.columns && Array.isArray(payload.rows)) {
        return payload.rows.map((row) => {
            const obj = { _key: Math.random() }
            payload.columns.forEach((col, i) => {
                const key = col
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_]/g, '')
                obj[key] = row[i] ?? '-'
            })
            return obj
        })
    }

    return []
}

export const ReportPage = ({
    title,
    columns,
    reportName,
    searchKeys = [],
    extraParams = {},
}) => {
    const [loading, setLoading] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [data, setData] = useState([])
    const [search, setSearch] = useState('')
    const [dateRange, setDateRange] = useState(null)

    const loadData = async () => {
        try {
            setLoading(true)

            const params = { ...extraParams }

            if (dateRange?.length === 2) {
                params.startDate = dateRange[0].format('YYYY-MM-DD')
                params.endDate   = dateRange[1].format('YYYY-MM-DD')
            }

            const res = await reportApi.getReport(reportName, params)
            const raw = res?.data?.data ?? res?.data ?? []
            setData(transformResponse(raw))
        } catch (err) {
            console.error('Report load error:', err)
            message.error('Failed to load report')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [reportName])

    // ✅ Fixed export — proper blob download
    const exportExcel = async () => {
        try {
            setExporting(true)

            const params = { ...extraParams }
            if (dateRange?.length === 2) {
                params.startDate = dateRange[0].format('YYYY-MM-DD')
                params.endDate   = dateRange[1].format('YYYY-MM-DD')
            }

            const res = await reportApi.exportExcel(reportName, params)

            // Create blob URL and trigger download
            const blob = new Blob([res.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            })
            const url  = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href  = url
            link.setAttribute('download', `${reportName}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

            message.success('Export successful!')
        } catch (err) {
            console.error('Export error:', err)
            message.error('Export failed')
        } finally {
            setExporting(false)
        }
    }

    const filteredData = data.filter((item) => {
        if (!search) return true
        return searchKeys.some((key) =>
            String(item[key] || '')
                .toLowerCase()
                .includes(search.toLowerCase())
        )
    })

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Row
                    justify="space-between"
                    align="middle"
                    style={{ marginBottom: 20 }}
                >
                    <Col>
                        <Title level={4}>{title}</Title>
                    </Col>

                    <Col>
                        <Space wrap>
                            <Input
                                allowClear
                                style={{ width: 220 }}
                                placeholder="Search..."
                                prefix={<SearchOutlined />}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <RangePicker
                                format="DD/MM/YYYY"
                                value={dateRange}
                                onChange={setDateRange}
                            />

                            <Button
                                icon={<ReloadOutlined />}
                                onClick={loadData}
                                loading={loading}
                            >
                                Refresh
                            </Button>

                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={exportExcel}
                                loading={exporting}   // ✅ loading state on export button
                            >
                                Export
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    rowKey={(r, i) => r.id ?? r._key ?? i}
                    columns={columns}
                    dataSource={filteredData}
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} records`,
                    }}
                />
            </Card>
        </div>
    )
}