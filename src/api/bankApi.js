import axiosInstance from './axiosInstance'

export const getBanks = (params) => axiosInstance.get('/banks', { params })
export const getBankById = (id) => axiosInstance.get(`/banks/${id}`)
export const createBank = (data) => axiosInstance.post('/banks', data)
export const updateBank = (id, data) => axiosInstance.put(`/banks/${id}`, data)
export const deleteBank = (id) => axiosInstance.delete(`/banks/${id}`)

export const bankApi = {
  getBanks,
  getBankById,
  createBank,
  updateBank,
  deleteBank,
}