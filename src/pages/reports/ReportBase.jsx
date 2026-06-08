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

export const ReportPage = ({
    title,
    columns,
    reportName,
    searchKeys = [],
}) => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [search, setSearch] = useState('')
    const [dateRange, setDateRange] = useState(null)

    const loadData = async () => {
        try {
            setLoading(true)

            const params = {}

            if (search) {
                params.search = search
            }

            if (dateRange?.length === 2) {
                params.fromDate = dateRange[0].format('DD/MM/YYYY')
                params.toDate = dateRange[1].format('DD/MM/YYYY')
            }

            const res = await reportApi.getReport(
                reportName,
                params
            )

            setData(
                res?.data?.data ||
                res?.data ||
                []
            )
        } catch (err) {
            console.error(err)
            message.error('Failed to load report')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const exportExcel = async () => {
        try {
            const res =
                await reportApi.exportExcel(
                    reportName
                )

            window.open(
                res.data.downloadUrl,
                '_blank'
            )
        } catch {
            message.error('Export failed')
        }
    }

    const filteredData = data.filter(
        item => {
            if (!search) return true

            return searchKeys.some(key =>
                String(item[key] || '')
                    .toLowerCase()
                    .includes(search.toLowerCase())
            )
        }
    )

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Row
                    justify="space-between"
                    align="middle"
                    style={{ marginBottom: 20 }}
                >
                    <Col>
                        <Title level={4}>
                            {title}
                        </Title>
                    </Col>

                    <Col>
                        <Space>
                            <Input
                                allowClear
                                style={{ width: 250 }}
                                placeholder="Search..."
                                prefix={<SearchOutlined />}
                                value={search}
                                onChange={e =>
                                    setSearch(e.target.value)
                                }
                            />

                            <RangePicker
                                format="DD/MM/YYYY"
                                value={dateRange}
                                onChange={setDateRange}
                            />

                            <Button
                                icon={<ReloadOutlined />}
                                onClick={loadData}
                            >
                                Refresh
                            </Button>

                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={exportExcel}
                            >
                                Export
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    rowKey={(r, i) => r.id || i}
                    columns={columns}
                    dataSource={filteredData}
                    loading={loading}
                    scroll={{ x: 1500 }}
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                    }}
                />
            </Card>
        </div>
    )
}