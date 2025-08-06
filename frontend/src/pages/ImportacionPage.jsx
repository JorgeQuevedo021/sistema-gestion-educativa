import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { importacionService } from '../services/api';
import { downloadBlob, formatFullName } from '../utils/helpers';
import toast from 'react-hot-toast';

const ImportacionPage = () => {
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showErrors, setShowErrors] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Solo se permiten archivos Excel (.xlsx, .xls)');
      return;
    }

    try {
      setUploading(true);
      setImportResult(null);
      
      const response = await importacionService.importarAlumnos(file);
      setImportResult(response.data);
      
      if (response.data.success_count > 0) {
        toast.success(`${response.data.success_count} alumnos importados exitosamente`);
      }
      
      if (response.data.error_count > 0) {
        toast.error(`${response.data.error_count} errores encontrados durante la importación`);
      }
      
    } catch (error) {
      console.error('Error en importación:', error);
      
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Error al procesar el archivo');
      }
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    disabled: uploading
  });

  const downloadTemplate = async () => {
    try {
      const response = await importacionService.descargarPlantilla();
      downloadBlob(response.data, 'plantilla_alumnos.xlsx');
      toast.success('Plantilla descargada exitosamente');
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
      toast.error('Error al descargar la plantilla');
    }
  };

  const resetImport = () => {
    setImportResult(null);
    setShowErrors(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Importación de Alumnos</h1>
        <p className="mt-2 text-gray-600">
          Importa datos de alumnos de forma masiva usando archivos Excel
        </p>
      </div>

      {/* Instructions Card */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Instrucciones
        </h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <p className="text-gray-700">
                <strong>Descarga la plantilla</strong> - Usa el botón de abajo para descargar el formato correcto
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <p className="text-gray-700">
                <strong>Completa los datos</strong> - Llena el archivo con la información de los alumnos
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div>
              <p className="text-gray-700">
                <strong>Sube el archivo</strong> - Arrastra y suelta o selecciona el archivo Excel completado
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Importante</h3>
              <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside space-y-1">
                <li>Las CURPs deben ser únicas y válidas</li>
                <li>Los teléfonos deben tener formato mexicano</li>
                <li>Las fechas de nacimiento deben ser válidas (edad entre 3 y 25 años)</li>
                <li>Los campos marcados en la plantilla son obligatorios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Download Template */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Plantilla de Excel
        </h2>
        <p className="text-gray-600 mb-4">
          Descarga la plantilla con el formato correcto para importar los datos de alumnos.
        </p>
        <button
          onClick={downloadTemplate}
          className="btn btn-primary flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Descargar Plantilla
        </button>
      </div>

      {/* Upload Area */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Subir Archivo
        </h2>
        
        {!importResult ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : uploading
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            
            <div className="space-y-4">
              {uploading ? (
                <div className="flex flex-col items-center">
                  <RefreshCw className="h-12 w-12 text-primary-600 animate-spin" />
                  <p className="text-lg font-medium text-gray-900">
                    Procesando archivo...
                  </p>
                  <p className="text-gray-600">
                    Por favor espera mientras se importan los datos
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-gray-400" />
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive
                      ? 'Suelta el archivo aquí'
                      : 'Arrastra y suelta tu archivo Excel aquí'
                    }
                  </p>
                  <p className="text-gray-600">
                    o{' '}
                    <span className="text-primary-600 font-medium">
                      haz clic para seleccionar
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Formatos soportados: .xlsx, .xls
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Import Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Exitosos</p>
                    <p className="text-2xl font-bold text-green-900">
                      {importResult.success_count}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <XCircle className="h-6 w-6 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Errores</p>
                    <p className="text-2xl font-bold text-red-900">
                      {importResult.error_count}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FileSpreadsheet className="h-6 w-6 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Total</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {importResult.success_count + importResult.error_count}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Successful Imports */}
            {importResult.imported_alumnos.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Alumnos Importados Exitosamente
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="max-h-40 overflow-y-auto">
                    <ul className="space-y-1">
                      {importResult.imported_alumnos.map((alumno, index) => (
                        <li key={index} className="text-sm text-green-800">
                          <span className="font-medium">{alumno.matricula}</span> - {formatFullName(alumno)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Errores Encontrados
                  </h3>
                  <button
                    onClick={() => setShowErrors(!showErrors)}
                    className="btn btn-secondary text-sm"
                  >
                    {showErrors ? 'Ocultar' : 'Mostrar'} Detalles
                  </button>
                </div>
                
                {showErrors && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="max-h-60 overflow-y-auto">
                      <ul className="space-y-2">
                        {importResult.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-800">
                            <span className="font-medium">Error {index + 1}:</span> {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetImport}
                className="btn btn-primary flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Otro Archivo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Consejos para una Importación Exitosa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                Verifica que las CURPs tengan exactamente 18 caracteres
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                Usa fechas en formato YYYY-MM-DD (ej: 2010-05-15)
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                Asegúrate de que los niveles educativos sean exactos
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                Los teléfonos deben tener 10 dígitos
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                No dejes filas vacías entre los datos
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                Revisa los datos antes de importar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportacionPage;