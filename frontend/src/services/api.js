import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Servicios para alumnos
export const alumnosService = {
  // Obtener lista de alumnos con filtros y paginación
  getAlumnos: (params = {}) => {
    return api.get('/alumnos/', { params });
  },

  // Crear nuevo alumno
  createAlumno: (data) => {
    return api.post('/alumnos/', data);
  },

  // Obtener alumno por ID
  getAlumno: (id) => {
    return api.get(`/alumnos/${id}`);
  },

  // Actualizar alumno
  updateAlumno: (id, data) => {
    return api.put(`/alumnos/${id}`, data);
  },

  // Eliminar alumno
  deleteAlumno: (id) => {
    return api.delete(`/alumnos/${id}`);
  },

  // Obtener alumno por matrícula
  getAlumnoByMatricula: (matricula) => {
    return api.get(`/alumnos/matricula/${matricula}`);
  },

  // Obtener estadísticas
  getEstadisticas: () => {
    return api.get('/alumnos/estadisticas/general');
  },
};

// Servicios para importación/exportación
export const importacionService = {
  // Importar alumnos desde Excel
  importarAlumnos: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/importacion/importar-alumnos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Descargar plantilla Excel
  descargarPlantilla: () => {
    return api.get('/importacion/plantilla-excel', {
      responseType: 'blob',
    });
  },

  // Exportar alumnos a Excel
  exportarAlumnos: (params = {}) => {
    return api.get('/importacion/exportar-alumnos', {
      params,
      responseType: 'blob',
    });
  },
};

export default api;