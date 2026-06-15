import axiosInstance from './axiosInstance'

export const getVendorBills = (params) =>
  axiosInstance.get('/vendor-bills', { params })

export const getVendorBillById = (id) =>
  axiosInstance.get(`/vendor-bills/${id}`)

export const createVendorBill = (data) =>
  axiosInstance.post('/vendor-bills', data)

export const updateVendorBill = (id, data) =>
  axiosInstance.put(`/vendor-bills/${id}`, data)

export const updatePaymentStatus = (id, status) =>
  axiosInstance.patch(`/vendor-bills/${id}/payment-status`, { status })

export const deleteVendorBill = (id) =>
  axiosInstance.delete(`/vendor-bills/${id}`)

export const vendorBillApi = {
  getVendorBills,
  getVendorBillById,
  createVendorBill,
  updateVendorBill,
  updatePaymentStatus,
  deleteVendorBill,   // ✅ add this line
}
