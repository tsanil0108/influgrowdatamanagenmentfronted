import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchClients } from '../store/clientSlice'
import { getClientById, createClient, updateClient, deleteClient } from '../api/clientApi'
import { message } from 'antd'

export function useClients() {
  const dispatch = useDispatch()
  const { list, total, loading, error } = useSelector((state) => state.clients)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadClients = useCallback((params) => {
    dispatch(fetchClients(params))
  }, [dispatch])

  const loadClient = async (id) => {
    setDetailLoading(true)
    try {
      const res = await getClientById(id)
      setDetail(res.data)
      return res.data
    } catch (err) {
      message.error('Failed to load client')
    } finally {
      setDetailLoading(false)
    }
  }

  const saveClient = async (data, id) => {
    try {
      if (id) {
        await updateClient(id, data)
        message.success('Client updated successfully')
      } else {
        await createClient(data)
        message.success('Client created successfully')
      }
      return true
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save client')
      return false
    }
  }

  const removeClient = async (id) => {
    try {
      await deleteClient(id)
      message.success('Client deleted')
      return true
    } catch (err) {
      message.error('Failed to delete client')
      return false
    }
  }

  return { list, total, loading, error, detail, detailLoading, loadClients, loadClient, saveClient, removeClient }
}