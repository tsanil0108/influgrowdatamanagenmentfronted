import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Space, Popconfirm, message } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
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
    } catch {
      message.error('Failed to delete bank account')
    }
  }

  const columns = [
    { title: 'Bank Name',      dataIndex: 'bankName',      key: 'bankName' },
    { title: 'Account Number', dataIndex: 'accountNumber', key: 'accountNumber', width: 180 },
    { title: 'IFSC Code',      dataIndex: 'ifscCode',      key: 'ifscCode',      width: 130 },
    { title: 'Branch Address', dataIndex: 'branchAddress', key: 'branchAddress', ellipsis: true },
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
            description="Are you sure? This action cannot be undone."
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(r.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <div>
      <PageHeader
        title="Bank Accounts"
        subtitle="Manage your bank accounts"
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