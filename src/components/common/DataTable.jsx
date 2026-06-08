import React, { useState } from 'react'
import { Table, Input, Space, Button } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'

/**
 * DataTable — Generic reusable table with search, pagination, sort, loading skeleton
 *
 * Props:
 *  columns      - Ant Design column definitions
 *  data         - Array of row objects
 *  loading      - Boolean — shows skeleton rows
 *  rowKey       - Key field name (default: 'id')
 *  onRefresh    - Optional callback for refresh button
 *  searchKeys   - Array of field names to search across (client-side filter)
 *  pageSize     - Default page size (default: 10)
 *  scroll       - Table scroll config e.g. { x: 1000 }
 *  extraHeader  - Extra JSX rendered to the right of search bar
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  rowKey = 'id',
  onRefresh,
  searchKeys = [],
  pageSize = 10,
  scroll,
  extraHeader,
}) => {
  const [searchText, setSearchText] = useState('')

  const filteredData = searchText && searchKeys.length
    ? data.filter(row =>
        searchKeys.some(key =>
          String(row[key] ?? '').toLowerCase().includes(searchText.toLowerCase())
        )
      )
    : data

  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E2E6F0', overflow: 'hidden' }}>
      {/* Header bar */}
      {(searchKeys.length > 0 || onRefresh || extraHeader) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          borderBottom: '1px solid #E2E6F0',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <Space wrap>
            {searchKeys.length > 0 && (
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 240 }}
              />
            )}
            {onRefresh && (
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
              >
                Refresh
              </Button>
            )}
          </Space>
          {extraHeader && <div>{extraHeader}</div>}
        </div>
      )}

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={rowKey}
        loading={loading}
        scroll={scroll}
        pagination={{
          pageSize,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
          style: { padding: '12px 16px', margin: 0 },
        }}
        size="middle"
        style={{ margin: 0 }}
      />
    </div>
  )
}

export default DataTable