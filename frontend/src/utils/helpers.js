// Validar CURP mexicana
export const validateCURP = (curp) => {
  if (!curp || curp.length !== 18) {
    return false;
  }

  const pattern = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}$/;
  return pattern.test(curp.toUpperCase());
};

// Validar teléfono mexicano
export const validatePhoneNumber = (phone) => {
  if (!phone) return false;
  
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const patterns = [
    /^\+52[0-9]{10}$/,  // +52 seguido de 10 dígitos
    /^[0-9]{10}$/,      // 10 dígitos
    /^044[0-9]{10}$/,   // 044 seguido de 10 dígitos
    /^045[0-9]{10}$/    // 045 seguido de 10 dígitos
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
};

// Formatear fecha para mostrar
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Formatear fecha para input
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Calcular edad
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Formatear nombre completo
export const formatFullName = (alumno) => {
  if (!alumno) return '';
  
  const { nombre, apellido_paterno, apellido_materno } = alumno;
  return `${nombre} ${apellido_paterno} ${apellido_materno || ''}`.trim();
};

// Descargar archivo blob
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Opciones para selects
export const NIVELES_EDUCATIVOS = [
  'Preescolar',
  'Primaria', 
  'Secundaria',
  'Preparatoria'
];

export const GRADOS = [
  '1', '2', '3', '4', '5', '6'
];

export const GRUPOS = [
  'A', 'B', 'C', 'D', 'E', 'F'
];

export const ESTADOS_ALUMNO = [
  'Activo',
  'Inactivo',
  'Egresado'
];

export const RELACIONES_CONTACTO = [
  'Padre',
  'Madre',
  'Tutor',
  'Abuelo',
  'Abuela',
  'Tío',
  'Tía',
  'Hermano',
  'Hermana',
  'Otro'
];