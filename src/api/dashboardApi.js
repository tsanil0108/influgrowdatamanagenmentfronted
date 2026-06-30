// src/api/dashboardApi.js
import axiosInstance from './axiosInstance'

// ✅ Named export
export const getDashboardSummary = () => axiosInstance.get('/dashboard/summary')

// ✅ Default export
const dashboardApi = {
  getDashboardSummary,
}

export default dashboardApi