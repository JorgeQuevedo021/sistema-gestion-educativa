import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Save, ArrowLeft, Plus, Trash2, User, Phone } from 'lucide-react';
import { alumnosService } from '../services/api';
import { 
  validateCURP, 
  validatePhoneNumber, 
  formatDateForInput,
  NIVELES_EDUCATIVOS,
  GRADOS,
  GRUPOS,
  ESTADOS_ALUMNO,
  RELACIONES_CONTACTO
} from '../utils/helpers';
import toast from 'react-hot-toast';

const AlumnoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      fecha_nacimiento: '',
      curp: '',
      nivel_educativo: 'Primaria',
      grado: '1',
      grupo: 'A',
      estado: 'Activo',
      contactos_emergencia: [
        {
          nombre: '',
          telefono: '',
          relacion: 'Padre'
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contactos_emergencia'
  });

  // Load alumno data if editing
  useEffect(() => {
    if (isEdit) {
      const fetchAlumno = async () => {
        try {
          const response = await alumnosService.getAlumno(id);
          const alumno = response.data;
          
          // Format data for form
          const formData = {
            ...alumno,
            fecha_nacimiento: formatDateForInput(alumno.fecha_nacimiento),
            contactos_emergencia: alumno.contactos_emergencia.length > 0 
              ? alumno.contactos_emergencia 
              : [{ nombre: '', telefono: '', relacion: 'Padre' }]
          };
          
          reset(formData);
        } catch (error) {
          console.error('Error al cargar alumno:', error);
          toast.error('Error al cargar los datos del alumno');
          navigate('/alumnos');
        } finally {
          setInitialLoading(false);
        }
      };

      fetchAlumno();
    }
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Filter out empty contacts
      const contactos = data.contactos_emergencia.filter(
        contacto => contacto.nombre && contacto.telefono && contacto.relacion
      );
      
      const alumnoData = {
        ...data,
        contactos_emergencia: contactos
      };

      if (isEdit) {
        await alumnosService.updateAlumno(id, alumnoData);
        toast.success('Alumno actualizado exitosamente');
      } else {
        await alumnosService.createAlumno(alumnoData);
        toast.success('Alumno creado exitosamente');
      }
      
      navigate('/alumnos');
    } catch (error) {
      console.error('Error al guardar alumno:', error);
      
      // Handle specific errors
      if (error.response?.data?.detail) {
        if (error.response.data.detail.includes('CURP')) {
          toast.error('Ya existe un alumno con esta CURP');
        } else {
          toast.error(error.response.data.detail);
        }
      } else {
        toast.error('Error al guardar el alumno');
      }
    } finally {
      setLoading(false);
    }
  };

  const addContacto = () => {
    append({
      nombre: '',
      telefono: '',
      relacion: 'Padre'
    });
  };

  const removeContacto = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/alumnos')}
          className="btn btn-secondary flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Editar Alumno' : 'Nuevo Alumno'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEdit ? 'Actualiza la información del estudiante' : 'Registra un nuevo estudiante en el sistema'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información Personal */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <User className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Información Personal
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                className={`input ${errors.nombre ? 'input-error' : ''}`}
                {...register('nombre', {
                  required: 'El nombre es requerido',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres'
                  }
                })}
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido Paterno *
              </label>
              <input
                type="text"
                className={`input ${errors.apellido_paterno ? 'input-error' : ''}`}
                {...register('apellido_paterno', {
                  required: 'El apellido paterno es requerido',
                  minLength: {
                    value: 2,
                    message: 'El apellido debe tener al menos 2 caracteres'
                  }
                })}
              />
              {errors.apellido_paterno && (
                <p className="mt-1 text-sm text-red-600">{errors.apellido_paterno.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido Materno
              </label>
              <input
                type="text"
                className="input"
                {...register('apellido_materno')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                className={`input ${errors.fecha_nacimiento ? 'input-error' : ''}`}
                {...register('fecha_nacimiento', {
                  required: 'La fecha de nacimiento es requerida',
                  validate: (value) => {
                    const date = new Date(value);
                    const today = new Date();
                    const age = today.getFullYear() - date.getFullYear();
                    
                    if (date >= today) {
                      return 'La fecha debe ser anterior a hoy';
                    }
                    if (age < 3 || age > 25) {
                      return 'La edad debe estar entre 3 y 25 años';
                    }
                    return true;
                  }
                })}
              />
              {errors.fecha_nacimiento && (
                <p className="mt-1 text-sm text-red-600">{errors.fecha_nacimiento.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CURP *
              </label>
              <input
                type="text"
                className={`input ${errors.curp ? 'input-error' : ''}`}
                placeholder="ABCD123456HEFGHJ01"
                {...register('curp', {
                  required: 'La CURP es requerida',
                  validate: (value) => {
                    if (!validateCURP(value)) {
                      return 'Formato de CURP inválido';
                    }
                    return true;
                  }
                })}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                }}
              />
              {errors.curp && (
                <p className="mt-1 text-sm text-red-600">{errors.curp.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Ingrese la CURP de 18 caracteres del estudiante
              </p>
            </div>
          </div>
        </div>

        {/* Información Académica */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Información Académica
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel Educativo *
              </label>
              <select
                className={`input ${errors.nivel_educativo ? 'input-error' : ''}`}
                {...register('nivel_educativo', { required: 'Seleccione un nivel educativo' })}
              >
                {NIVELES_EDUCATIVOS.map(nivel => (
                  <option key={nivel} value={nivel}>{nivel}</option>
                ))}
              </select>
              {errors.nivel_educativo && (
                <p className="mt-1 text-sm text-red-600">{errors.nivel_educativo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grado *
              </label>
              <select
                className={`input ${errors.grado ? 'input-error' : ''}`}
                {...register('grado', { required: 'Seleccione un grado' })}
              >
                {GRADOS.map(grado => (
                  <option key={grado} value={grado}>{grado}°</option>
                ))}
              </select>
              {errors.grado && (
                <p className="mt-1 text-sm text-red-600">{errors.grado.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grupo *
              </label>
              <select
                className={`input ${errors.grupo ? 'input-error' : ''}`}
                {...register('grupo', { required: 'Seleccione un grupo' })}
              >
                {GRUPOS.map(grupo => (
                  <option key={grupo} value={grupo}>{grupo}</option>
                ))}
              </select>
              {errors.grupo && (
                <p className="mt-1 text-sm text-red-600">{errors.grupo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                className={`input ${errors.estado ? 'input-error' : ''}`}
                {...register('estado', { required: 'Seleccione un estado' })}
              >
                {ESTADOS_ALUMNO.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
              {errors.estado && (
                <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contactos de Emergencia */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Contactos de Emergencia
              </h2>
            </div>
            <button
              type="button"
              onClick={addContacto}
              className="btn btn-secondary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Contacto
            </button>
          </div>

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">
                    Contacto {index + 1}
                  </h3>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContacto(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      className="input"
                      {...register(`contactos_emergencia.${index}.nombre`)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      className="input"
                      placeholder="5551234567"
                      {...register(`contactos_emergencia.${index}.telefono`, {
                        validate: (value) => {
                          if (value && !validatePhoneNumber(value)) {
                            return 'Formato de teléfono inválido';
                          }
                          return true;
                        }
                      })}
                    />
                    {errors.contactos_emergencia?.[index]?.telefono && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.contactos_emergencia[index].telefono.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relación
                    </label>
                    <select
                      className="input"
                      {...register(`contactos_emergencia.${index}.relacion`)}
                    >
                      {RELACIONES_CONTACTO.map(relacion => (
                        <option key={relacion} value={relacion}>{relacion}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/alumnos')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEdit ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlumnoForm;