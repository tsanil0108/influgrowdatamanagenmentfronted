import React from 'react'
import { Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

export function confirmDelete(onOk, itemName = 'this record') {
  Modal.confirm({
    title: 'Confirm Delete',
    icon: <ExclamationCircleOutlined />,
    content: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
    okText: 'Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk,
  })
}

export default function ConfirmModal({ open, title, message, onOk, onCancel, loading }) {
  return (
    <Modal
      open={open}
      title={title || 'Confirm'}
      onOk={onOk}
      onCancel={onCancel}
      okType="danger"
      okText="Confirm"
      confirmLoading={loading}
    >
      <p style={{ fontFamily: 'var(--font-body)' }}>{message}</p>
    </Modal>
  )
}