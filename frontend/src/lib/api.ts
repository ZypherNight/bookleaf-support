import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001/api'

export const BACKEND_URL = API_BASE.replace(/\/api$/, '')

export const api = axios.create({
  baseURL: API_BASE
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    
    const message = error.response?.data?.detail || 'An unexpected error occurred.'
    window.dispatchEvent(new CustomEvent('api:error', { detail: message }))
    
    return Promise.reject(error)
  }
)
