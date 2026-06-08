import axiosInstance from './axiosInstance'

export const getClients = (params) => axiosInstance.get('/clients', { params })
export const getClientById = (id) => axiosInstance.get(`/clients/${id}`)
export const createClient = (data) => axiosInstance.post('/clients', data)
export const updateClient = (id, data) => axiosInstance.put(`/clients/${id}`, data)
export const deleteClient = (id) => axiosInstance.delete(`/clients/${id}`)

export const uploadClientDoc = (id, formData) =>
  axiosInstance.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { entityType: 'CLIENT', entityId: id },
  })

export const clientApi = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  uploadClientDoc,
}