import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVendors } from '../store/vendorSlice'
import { getVendorById, createVendor, updateVendor, deleteVendor } from '../api/vendorApi'
import { message } from 'antd'

export function useVendors() {
  const dispatch = useDispatch()
  const { list, total, loading } = useSelector((state) => state.vendors)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadVendors = useCallback((params) => dispatch(fetchVendors(params)), [dispatch])

  const loadVendor = async (id) => {
    setDetailLoading(true)
    try {
      const res = await getVendorById(id)
      setDetail(res.data)
      return res.data
    } catch {
      message.error('Failed to load vendor')
    } finally {
      setDetailLoading(false)
    }
  }

  const saveVendor = async (data, id) => {
    try {
      if (id) { await updateVendor(id, data); message.success('Vendor updated') }
      else { await createVendor(data); message.success('Vendor created') }
      return true
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save vendor')
      return false
    }
  }

  const removeVendor = async (id) => {
    try {
      await deleteVendor(id)
      message.success('Vendor deleted')
      return true
    } catch {
      message.error('Failed to delete vendor')
      return false
    }
  }

  return { list, total, loading, detail, detailLoading, loadVendors, loadVendor, saveVendor, removeVendor }
}