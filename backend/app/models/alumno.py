from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Alumno(Base):
    __tablename__ = "alumnos"
    
    id = Column(Integer, primary_key=True, index=True)
    matricula = Column(String(20), unique=True, index=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    apellido_paterno = Column(String(100), nullable=False)
    apellido_materno = Column(String(100), nullable=True)
    fecha_nacimiento = Column(Date, nullable=False)
    curp = Column(String(18), unique=True, nullable=False)
    nivel_educativo = Column(String(50), nullable=False)  # Primaria, Secundaria, Preparatoria
    grado = Column(String(10), nullable=False)  # 1, 2, 3, etc.
    grupo = Column(String(10), nullable=False)  # A, B, C, etc.
    estado = Column(String(20), default="Activo")  # Activo, Inactivo, Egresado
    fecha_inscripcion = Column(DateTime, default=func.now())
    
    # Relación con contactos de emergencia
    contactos_emergencia = relationship("ContactoEmergencia", back_populates="alumno", cascade="all, delete-orphan")

class ContactoEmergencia(Base):
    __tablename__ = "contactos_emergencia"
    
    id = Column(Integer, primary_key=True, index=True)
    alumno_id = Column(Integer, ForeignKey("alumnos.id"), nullable=False)
    nombre = Column(String(200), nullable=False)
    telefono = Column(String(15), nullable=False)
    relacion = Column(String(50), nullable=False)  # Padre, Madre, Tutor, etc.
    
    # Relación con alumno
    alumno = relationship("Alumno", back_populates="contactos_emergencia")