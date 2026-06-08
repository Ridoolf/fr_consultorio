import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://fr-consultorio-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login/', { username, password }),
  refresh: (refresh) => api.post('/auth/refresh/', { refresh }),
  me: () => api.get('/auth/me/'),
};

export const pacientesAPI = {
  getAll: (params = {}) => api.get('/pacientes/', { params }),
  getById: (id) => api.get(`/pacientes/${id}/`),
  create: (data) => api.post('/pacientes/', data),
  update: (id, data) => api.put(`/pacientes/${id}/`, data),
  patch: (id, data) => api.patch(`/pacientes/${id}/`, data),
  desactivar: (id) => api.post(`/pacientes/${id}/desactivar/`),
  activar: (id) => api.post(`/pacientes/${id}/activar/`),
};

export const turnosAPI = {
  getAll: (params = {}) => api.get('/turnos/', { params }),
  getById: (id) => api.get(`/turnos/${id}/`),
  create: (data) => api.post('/turnos/', data),
  update: (id, data) => api.put(`/turnos/${id}/`, data),
  patch: (id, data) => api.patch(`/turnos/${id}/`, data),
  confirmar: (id) => api.post(`/turnos/${id}/confirmar/`),
  marcarRealizado: (id) => api.post(`/turnos/${id}/marcar_realizado/`),
  cancelar: (id) => api.post(`/turnos/${id}/cancelar/`),
};

export const documentosAPI = {
  getByPaciente: (pacienteId) =>
    api.get('/pacientes-documentos/', { params: { paciente: pacienteId } }),
  create: (data) =>
    api.post('/pacientes-documentos/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/pacientes-documentos/${id}/`),
};

export const tratamientosAPI = {
  getAll: (params = {}) => api.get('/tratamientos/', { params }),
  create: (data) => api.post('/tratamientos/', data),
  update: (id, data) => api.put(`/tratamientos/${id}/`, data),
  delete: (id) => api.delete(`/tratamientos/${id}/`),
};

export const pagosAPI = {
  getAll: (params = {}) => api.get('/pagos/', { params }),
  create: (data) => api.post('/pagos/', data),
};

export default api;
