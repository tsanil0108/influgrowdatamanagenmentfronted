import axiosInstance from './axiosInstance'

export const login = (credentials) =>
  axiosInstance.post('/auth/login', credentials)

export const logout = () =>
  axiosInstance.post('/auth/logout')

export const refreshToken = () =>
  axiosInstance.post('/auth/refresh')

export const registerApi = (data) =>
  axiosInstance.post('/auth/register', data)

export const forgotPasswordApi = (data) =>
  axiosInstance.post('/auth/forgot-password', data)

export const resetPasswordApi = (data) =>
  axiosInstance.post('/auth/reset-password', data)

export const authApi = {
  login,
  logout,
  refreshToken,
  registerApi,
  forgotPasswordApi,
  resetPasswordApi,
}

export default authApi