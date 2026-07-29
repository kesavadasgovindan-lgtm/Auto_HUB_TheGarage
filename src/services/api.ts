import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor – attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('autohub_token')
    if (token) {
      if (token.startsWith('mock_')) {
        // Clear legacy mock tokens so ASP.NET Core issues a real JWT
        localStorage.removeItem('autohub_token')
      } else {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor – handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized - token invalid or expired')
    }
    return Promise.reject(error)
  }
)

export default apiClient
