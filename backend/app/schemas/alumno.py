from pydantic import BaseModel, validator, Field
from datetime import date, datetime
from typing import List, Optional
import re

class ContactoEmergenciaBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=200)
    telefono: str = Field(..., min_length=10, max_length=15)
    relacion: str = Field(..., min_length=2, max_length=50)
    
    @validator('telefono')
    def validate_telefono(cls, v):
        # Validar formato de teléfono mexicano
        pattern = r'^(\+52\s?)?[0-9]{10}$'
        if not re.match(pattern, v.replace(' ', '').replace('-', '')):
            raise ValueError('Formato de teléfono inválido. Use formato mexicano (10 dígitos)')
        return v

class ContactoEmergenciaCreate(ContactoEmergenciaBase):
    pass

class ContactoEmergenciaUpdate(ContactoEmergenciaBase):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    relacion: Optional[str] = None

class ContactoEmergencia(ContactoEmergenciaBase):
    id: int
    alumno_id: int
    
    class Config:
        from_attributes = True

class AlumnoBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido_paterno: str = Field(..., min_length=2, max_length=100)
    apellido_materno: Optional[str] = Field(None, max_length=100)
    fecha_nacimiento: date
    curp: str = Field(..., min_length=18, max_length=18)
    nivel_educativo: str = Field(..., min_length=1, max_length=50)
    grado: str = Field(..., min_length=1, max_length=10)
    grupo: str = Field(..., min_length=1, max_length=10)
    estado: str = Field(default="Activo", max_length=20)
    
    @validator('curp')
    def validate_curp(cls, v):
        # Validar formato de CURP mexicana
        pattern = r'^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}$'
        if not re.match(pattern, v.upper()):
            raise ValueError('Formato de CURP inválido')
        return v.upper()
    
    @validator('fecha_nacimiento')
    def validate_fecha_nacimiento(cls, v):
        from datetime import date
        today = date.today()
        if v >= today:
            raise ValueError('La fecha de nacimiento debe ser anterior a hoy')
        
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 3 or age > 25:
            raise ValueError('La edad debe estar entre 3 y 25 años')
        return v
    
    @validator('nivel_educativo')
    def validate_nivel_educativo(cls, v):
        valid_levels = ['Preescolar', 'Primaria', 'Secundaria', 'Preparatoria']
        if v not in valid_levels:
            raise ValueError(f'Nivel educativo debe ser uno de: {", ".join(valid_levels)}')
        return v
    
    @validator('estado')
    def validate_estado(cls, v):
        valid_states = ['Activo', 'Inactivo', 'Egresado']
        if v not in valid_states:
            raise ValueError(f'Estado debe ser uno de: {", ".join(valid_states)}')
        return v

class AlumnoCreate(AlumnoBase):
    contactos_emergencia: Optional[List[ContactoEmergenciaCreate]] = []

class AlumnoUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    curp: Optional[str] = None
    nivel_educativo: Optional[str] = None
    grado: Optional[str] = None
    grupo: Optional[str] = None
    estado: Optional[str] = None
    contactos_emergencia: Optional[List[ContactoEmergenciaCreate]] = None

class Alumno(AlumnoBase):
    id: int
    matricula: str
    fecha_inscripcion: datetime
    contactos_emergencia: List[ContactoEmergencia] = []
    
    class Config:
        from_attributes = True

class AlumnoList(BaseModel):
    total: int
    page: int
    per_page: int
    pages: int
    items: List[Alumno]

class AlumnoImport(BaseModel):
    success_count: int
    error_count: int
    errors: List[str]
    imported_alumnos: List[Alumno]