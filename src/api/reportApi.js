import axiosInstance from './axiosInstance'

export const getReport = (reportName, filters) =>
    axiosInstance.get(`/reports/${reportName}`, {
        params: filters,
    })

export const exportExcel = (reportName, filters = {}) =>
    axiosInstance.get(`/reports/${reportName}/export`, {
        params: { ...filters, format: 'excel' },
        responseType: 'blob',   // ✅ blob response
    })

export const reportApi = {
    getReport,
    exportExcel,
}

export default reportApi