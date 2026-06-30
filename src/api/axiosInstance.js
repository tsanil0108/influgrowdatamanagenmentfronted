// src/api/axiosInstance.js
import axios from 'axios'
import { getToken, removeToken } from '../utils/tokenHelper'

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : 'https://influgrowdatamanagenmentbackned.onrender.com/api'

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  }
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Cache bust — har request unique hogi
    config.params = {
      ...config.params,
      _t: Date.now()
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ✅ Response interceptor with better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Handle 401 Unauthorized
    if (error.response?.status === 401) {
      removeToken()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // ✅ Handle 403 Forbidden
    if (error.response?.status === 403) {
      // Show permission error
      console.error('⛔ Permission denied')
      return Promise.reject(error)
    }

    // ✅ Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('🔍 Resource not found')
      return Promise.reject(error)
    }

    // ✅ Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('⚠️ Server error')
      return Promise.reject(error)
    }

    // ✅ Handle Network Error
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.error('🌐 Network error. Please check your connection.')
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default axiosInstance