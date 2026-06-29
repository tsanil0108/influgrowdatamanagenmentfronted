import axiosInstance from './axiosInstance'

// ✅ NEW — downloads a ZIP (one JSON file per table: clients, vendors,
// campaigns, estimates, invoices, vendor bills, banks, bank entries).
export const downloadBackup = () =>
  axiosInstance.get('/backup/export', { responseType: 'blob' })

export const backupApi = { downloadBackup }

export default backupApi