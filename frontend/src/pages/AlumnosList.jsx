import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { alumnosService, importacionService } from '../services/api';
import { formatDate, formatFullName, downloadBlob, NIVELES_EDUCATIVOS, GRADOS, GRUPOS, ESTADOS_ALUMNO } from '../utils/helpers';
import toast from 'react-hot-toast';

const AlumnosList = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 20,
    pages: 1
  });
  
  const [filters, setFilters] = useState({
    search: '',
    nivel_educativo: '',
    grado: '',
    grupo: '',
    estado: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);

  const fetchAlumnos = async () => {
    try {
      setLoading(true);
      const params = {
        skip: (pagination.page - 1) * pagination.per_page,
        limit: pagination.per_page,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      };
      
      const response = await alumnosService.getAlumnos(params);
      setAlumnos(response.data.items);
      setPagination({
        total: response.data.total,
        page: response.data.page,
        per_page: response.data.per_page,
        pages: response.data.pages
      });
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
      toast.error('Error al cargar la lista de alumnos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, [pagination.page, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar al alumno ${nombre}?`)) {
      return;
    }
    
    try {
      await alumnosService.deleteAlumno(id);
      toast.success('Alumno eliminado exitosamente');
      fetchAlumnos();
    } catch (error) {
      console.error('Error al eliminar alumno:', error);
      toast.error('Error al eliminar el alumno');
    }
  };

  const handleExport = async () => {
    try {
      const filterParams = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const response = await importacionService.exportarAlumnos(filterParams);
      downloadBlob(response.data, 'alumnos_export.xlsx');
      toast.success('Archivo exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar los datos');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && alumnos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alumnos</h1>
          <p className="mt-2 text-gray-600">
            Gestión de estudiantes registrados en el sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleExport}
            className="btn btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
          <Link to="/alumnos/nuevo" className="btn btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Alumno
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, matrícula o CURP..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          {/* Filter Toggle */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros {showFilters ? '▼' : '▶'}
            </button>
            <p className="text-sm text-gray-600">
              {pagination.total} resultado{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel Educativo
                </label>
                <select
                  className="input"
                  value={filters.nivel_educativo}
                  onChange={(e) => handleFilterChange('nivel_educativo', e.target.value)}
                >
                  <option value="">Todos</option>
                  {NIVELES_EDUCATIVOS.map(nivel => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grado
                </label>
                <select
                  className="input"
                  value={filters.grado}
                  onChange={(e) => handleFilterChange('grado', e.target.value)}
                >
                  <option value="">Todos</option>
                  {GRADOS.map(grado => (
                    <option key={grado} value={grado}>{grado}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grupo
                </label>
                <select
                  className="input"
                  value={filters.grupo}
                  onChange={(e) => handleFilterChange('grupo', e.target.value)}
                >
                  <option value="">Todos</option>
                  {GRUPOS.map(grupo => (
                    <option key={grupo} value={grupo}>{grupo}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  className="input"
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                >
                  <option value="">Todos</option>
                  {ESTADOS_ALUMNO.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alumno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matrícula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel/Grado/Grupo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inscripción
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alumnos.map((alumno) => (
                <tr key={alumno.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatFullName(alumno)}
                      </div>
                      <div className="text-sm text-gray-500">
                        CURP: {alumno.curp}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {alumno.matricula}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {alumno.nivel_educativo} - {alumno.grado}°{alumno.grupo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      alumno.estado === 'Activo' 
                        ? 'bg-green-100 text-green-800'
                        : alumno.estado === 'Inactivo'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {alumno.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(alumno.fecha_inscripcion)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/alumnos/editar/${alumno.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(alumno.id, formatFullName(alumno))}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn btn-secondary disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando página <span className="font-medium">{pagination.page}</span> de{' '}
                  <span className="font-medium">{pagination.pages}</span> 
                  {' '}({pagination.total} resultados)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === pagination.page
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Empty State */}
      {!loading && alumnos.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay alumnos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comience agregando un nuevo alumno al sistema.
          </p>
          <div className="mt-6">
            <Link
              to="/alumnos/nuevo"
              className="btn btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Alumno
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumnosList;