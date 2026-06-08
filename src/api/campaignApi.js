import axiosInstance from './axiosInstance'

export const getCampaigns = (params) => axiosInstance.get('/campaigns', { params })
export const getCampaignById = (id) => axiosInstance.get(`/campaigns/${id}`)
export const createCampaign = (data) => axiosInstance.post('/campaigns', data)
export const updateCampaign = (id, data) => axiosInstance.put(`/campaigns/${id}`, data)
export const deleteCampaign = (id) => axiosInstance.delete(`/campaigns/${id}`)

export const campaignApi = {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
}