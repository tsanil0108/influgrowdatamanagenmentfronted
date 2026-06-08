import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Space } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import DataTable from '../../../components/common/DataTable'
import PageHeader from '../../../components/common/PageHeader'
import { bankApi } from '../../../api/bankApi'

const BankListPage = () => {
  const navigate = useNavigate()
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchBanks = async () => {
    setLoading(true)
    try {
      const res = await bankApi.getBanks()
      setBanks(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBanks() }, [])

  const columns = [
    { title: 'Bank Name', dataIndex: 'bank_name', key: 'bank_name' },
    { title: 'Account Number', dataIndex: 'account_number', key: 'account_number', width: 180 },
    { title: 'IFSC Code', dataIndex: 'ifsc_code', key: 'ifsc_code', width: 130 },
    { title: 'Branch Address', dataIndex: 'branch_address', key: 'branch_address', ellipsis: true },
    { title: 'Actions', key: 'actions', width: 80, fixed: 'right',
      render: (_, r) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/banks/${r.id}/edit`)} />
      ) },
  ]

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Bank Accounts"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/banks/new')}>
            Add Bank
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={banks}
        loading={loading}
        onRefresh={fetchBanks}
        searchKeys={['bank_name', 'account_number', 'ifsc_code']}
      />
    </div>
  )
}

export default BankListPage