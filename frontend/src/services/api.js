import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const pacientesAPI = {
  getAll: (params = {}) => api.get('/pacientes/', { params }),
  getById: (id) => api.get(`/pacientes/${id}/`),
  create: (data) => api.post('/pacientes/', data),
  update: (id, data) => api.put(`/pacientes/${id}/`, data),
  patch: (id, data) => api.patch(`/pacientes/${id}/`, data),
  delete: (id) => api.delete(`/pacientes/${id}/`),
  desactivar: (id) => api.post(`/pacientes/${id}/desactivar/`),
  activar: (id) => api.post(`/pacientes/${id}/activar/`),
};

export const turnosAPI = {
  getAll: (params = {}) => api.get('/turnos/', { params }),
  getById: (id) => api.get(`/turnos/${id}/`),
  create: (data) => api.post('/turnos/', data),
  update: (id, data) => api.put(`/turnos/${id}/`, data),
  patch: (id, data) => api.patch(`/turnos/${id}/`, data),
  delete: (id) => api.delete(`/turnos/${id}/`),

  confirmar: (id) => api.post(`/turnos/${id}/confirmar/`),
  marcarRealizado: (id) => api.post(`/turnos/${id}/marcar_realizado/`),
  cancelar: (id) => api.post(`/turnos/${id}/cancelar/`),
};

export const documentosAPI = {
  // listar documentos de un paciente
  getByPaciente: (pacienteId) =>
    api.get('/pacientes-documentos/', { params: { paciente: pacienteId } }),

  // subir documento
  create: (data) =>
    api.post('/pacientes-documentos/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // borrar documento (si querés más adelante)
  delete: (id) => api.delete(`/pacientes-documentos/${id}/`),
};

export default api;
