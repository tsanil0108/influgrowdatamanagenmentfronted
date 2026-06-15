import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Space, Popconfirm, message, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons'
import DataTable from '../../../components/common/DataTable'
import PageHeader from '../../../components/common/PageHeader'
import { bankApi } from '../../../api/bankApi'

const BankListPage = () => {
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
      setBanks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBanks() }, [])

  const handleDelete = async (id) => {
    try {
      await bankApi.deleteBank(id)
      message.success('Bank account deleted')
      fetchBanks()
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to delete bank account')
    }
  }

  const handleSetActive = async (id) => {
    try {
      await bankApi.setActiveBank(id)
      message.success('Active bank account updated — this bank will now appear on invoices')
      fetchBanks()
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to set active bank')
    }
  }

  const columns = [
    { title: 'Bank Name',      dataIndex: 'bankName',      key: 'bankName' },
    { title: 'Account Number', dataIndex: 'accountNumber', key: 'accountNumber', width: 180 },
    { title: 'IFSC Code',      dataIndex: 'ifscCode',      key: 'ifscCode',      width: 130 },
    { title: 'Branch Address', dataIndex: 'branchAddress', key: 'branchAddress', ellipsis: true },
    {
      title: 'Status', dataIndex: 'isActive', key: 'isActive', width: 160, align: 'center',
      render: (isActive, record) =>
        isActive
          ? <Tag icon={<CheckCircleOutlined />} color="green">Active (on Invoice)</Tag>
          : (
            <Popconfirm
              title="Set as active bank?"
              description="Yeh bank ab invoices par dikhega, aur dusra active bank deactivate ho jayega."
              okText="Yes, Set Active"
              cancelText="Cancel"
              onConfirm={() => handleSetActive(record.id)}
            >
              <Button size="small">Set Active</Button>
            </Popconfirm>
          )
    },
    {
      title: 'Actions', key: 'actions', width: 110, align: 'center',
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/banks/${r.id}/edit`)}
          />
          <Popconfirm
            title="Delete Bank Account?"
            description={r.isActive
              ? "Yeh active bank hai — pehle koi doosra bank active karo."
              : "Are you sure? This action cannot be undone."}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, disabled: r.isActive }}
            onConfirm={() => handleDelete(r.id)}
            disabled={r.isActive}
          >
            <Button size="small" danger icon={<DeleteOutlined />} disabled={r.isActive} />
          </Popconfirm>
        </Space>
      )
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
      />
    </div>
  )
}

export default BankListPage