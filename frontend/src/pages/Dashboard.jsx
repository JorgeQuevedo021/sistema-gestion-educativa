import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, GraduationCap, TrendingUp } from 'lucide-react';
import { alumnosService } from '../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="card p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className="flex items-center mt-1">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">{trend}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const response = await alumnosService.getEstadisticas();
        setEstadisticas(response.data);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        toast.error('Error al cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se pudieron cargar las estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Resumen general del sistema de gestión educativa
        </p>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Alumnos"
          value={estadisticas.total_alumnos}
          icon={Users}
          color="bg-primary-600"
        />
        <StatCard
          title="Alumnos Activos"
          value={estadisticas.alumnos_activos}
          icon={UserCheck}
          color="bg-green-600"
        />
        <StatCard
          title="Alumnos Inactivos"
          value={estadisticas.alumnos_inactivos}
          icon={UserX}
          color="bg-yellow-600"
        />
        <StatCard
          title="Egresados"
          value={estadisticas.alumnos_egresados}
          icon={GraduationCap}
          color="bg-purple-600"
        />
      </div>

      {/* Estadísticas por nivel educativo */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Alumnos por Nivel Educativo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(estadisticas.por_nivel_educativo).map(([nivel, cantidad]) => (
            <div key={nivel} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">{nivel}</p>
              <p className="text-2xl font-bold text-primary-600">{cantidad}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/alumnos/nuevo'}
            className="btn btn-primary p-4 h-auto flex flex-col items-center"
          >
            <Users className="h-8 w-8 mb-2" />
            <span className="font-medium">Nuevo Alumno</span>
            <span className="text-sm opacity-90">Registrar nuevo estudiante</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/importacion'}
            className="btn btn-secondary p-4 h-auto flex flex-col items-center"
          >
            <Upload className="h-8 w-8 mb-2" />
            <span className="font-medium">Importar Excel</span>
            <span className="text-sm opacity-90">Importación masiva</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/alumnos'}
            className="btn btn-secondary p-4 h-auto flex flex-col items-center"
          >
            <GraduationCap className="h-8 w-8 mb-2" />
            <span className="font-medium">Ver Alumnos</span>
            <span className="text-sm opacity-90">Lista completa</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;