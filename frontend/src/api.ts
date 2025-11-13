import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('token', token)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('token')
  }
}

export function initAuthFromStorage() {
  const token = localStorage.getItem('token')
  if (token) setAuthToken(token)
}

// Entity types
export interface Entity {
  id: number
  name: string
  description?: string | null
  json_data: string
  created_at: string
  updated_at: string
}

export interface EntityCreate {
  name: string
  description?: string | null
  json_data: string
}

export interface EntityUpdate {
  name?: string
  description?: string | null
  json_data?: string
}

// Entity API functions
export const entityApi = {
  list: () => api.get<Entity[]>('/entities'),

  create: (data: EntityCreate) => api.post<Entity>('/entities', data),

  get: (id: number) => api.get<Entity>(`/entities/${id}`),

  update: (id: number, data: EntityUpdate) => api.put<Entity>(`/entities/${id}`, data),

  delete: (id: number) => api.delete(`/entities/${id}`)
}