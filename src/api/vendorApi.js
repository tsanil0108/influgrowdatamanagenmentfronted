import axiosInstance from './axiosInstance'

export const getVendors = (params) => axiosInstance.get('/vendors', { params })
export const getVendorById = (id) => axiosInstance.get(`/vendors/${id}`)
export const createVendor = (data) => axiosInstance.post('/vendors', data)
export const updateVendor = (id, data) => axiosInstance.put(`/vendors/${id}`, data)
export const deleteVendor = (id) => axiosInstance.delete(`/vendors/${id}`)

export const vendorApi = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
}