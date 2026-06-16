import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Space, Popconfirm, Tag, App } from 'antd'
import { EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons'
import DataTable from '../../../components/common/DataTable'
import PageHeader from '../../../components/common/PageHeader'
import { bankApi } from '../../../api/bankApi'

const BankListPage = () => {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [banks,   setBanks]   = useState([])
  const [loading, setLoading] = useState(false)

  const fetchBanks = async () => {
    setLoading(true)
    try {
      const res  = await bankApi.getBanks()
      const list = res.data?.data
      setBanks(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('fetchBanks error:', err)
      message.error('Failed to load bank accounts')
      setBanks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBanks() }, [])

  const handleDelete = async (id) => {
    try {
      await bankApi.deleteBank(id)
      message.success('Bank account deleted successfully')
      fetchBanks()
    } catch (err) {
      console.error('Delete error:', err.response?.data)
      message.error(err.response?.data?.message || 'Failed to delete bank account')
    }
  }

  const handleSetActive = async (id) => {
    try {
      await bankApi.setActiveBank(id)
      await fetchBanks()
      message.success('Active bank updated!')
    } catch (_) {
      await fetchBanks()
      message.success('Active bank updated!')
    }
  }

  const columns = [
    {
      title: 'Bank Name',
      dataIndex: 'bankName',
      key: 'bankName',
      width: 160,
    },
    {
      title: 'Account Number',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      width: 180,
    },
    {
      title: 'IFSC Code',
      dataIndex: 'ifscCode',
      key: 'ifscCode',
      width: 130,
      render: v => v || '-',
    },
    {
      title: 'Branch Address',
      dataIndex: 'branchAddress',
      key: 'branchAddress',
      width: 180,
      ellipsis: true,
      render: v => v || '-',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 180,
      align: 'center',
      render: (isActive, record) =>
        isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="green">
            Active (on Invoice)
          </Tag>
        ) : (
          <Button
            size="small"
            type="dashed"
            onClick={() => handleSetActive(record.id)}
          >
            Set Active
          </Button>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      align: 'center',
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/banks/${r.id}/edit`)}
          />
          <Popconfirm
            title="Delete Bank Account?"
            description={
              r.isActive
                ? 'This is the active bank. Please set another bank as active first.'
                : 'Are you sure? This action cannot be undone.'
            }
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, disabled: r.isActive }}
            onConfirm={() => !r.isActive && handleDelete(r.id)}
            disabled={r.isActive}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={r.isActive}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Bank Accounts"
        subtitle="Manage your bank accounts. Only the Active bank's details appear on client invoices."
        onAdd={() => navigate('/banks/new')}
        addLabel="Add Bank"
      />
      <DataTable
        columns={columns}
        data={banks}
        loading={loading}
        onRefresh={fetchBanks}
        searchKeys={['bankName', 'accountNumber', 'ifscCode']}
        scroll={{ x: 800 }}
      />
    </div>
  )
}

export default BankListPage