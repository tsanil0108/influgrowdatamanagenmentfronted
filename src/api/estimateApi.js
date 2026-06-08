import api from './axiosInstance';

export const getEstimates = (p) => api.get('/estimates', { params: p });
export const getEstimate = (id) => api.get(`/estimates/${id}`);
export const createEstimate = (d) => api.post('/estimates', d);
export const updateEstimate = (id, d) => api.put(`/estimates/${id}`, d);
export const deleteEstimate = (id) => api.delete(`/estimates/${id}`);
export const downloadEstimatePdf = (id) =>
  api.get(`/estimates/${id}/pdf`, { responseType: 'blob' });
export const updateEstimateStatus = (id, status) =>
  api.patch(`/estimates/${id}/status`, { status });

export const estimateApi = {
  getEstimates,
  getEstimate,
  createEstimate,
  updateEstimate,
  deleteEstimate,
  downloadEstimatePdf,
  updateEstimateStatus,
};