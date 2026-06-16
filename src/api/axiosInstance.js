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

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance