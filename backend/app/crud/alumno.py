from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from ..models.alumno import Alumno, ContactoEmergencia
from ..schemas.alumno import AlumnoCreate, AlumnoUpdate, ContactoEmergenciaCreate
from ..utils.validators import generate_matricula

def get_alumno(db: Session, alumno_id: int) -> Optional[Alumno]:
    """Obtener un alumno por ID"""
    return db.query(Alumno).filter(Alumno.id == alumno_id).first()

def get_alumno_by_matricula(db: Session, matricula: str) -> Optional[Alumno]:
    """Obtener un alumno por matrícula"""
    return db.query(Alumno).filter(Alumno.matricula == matricula).first()

def get_alumno_by_curp(db: Session, curp: str) -> Optional[Alumno]:
    """Obtener un alumno por CURP"""
    return db.query(Alumno).filter(Alumno.curp == curp).first()

def get_alumnos(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    nivel_educativo: Optional[str] = None,
    grado: Optional[str] = None,
    grupo: Optional[str] = None,
    estado: Optional[str] = None
) -> List[Alumno]:
    """Obtener lista de alumnos con filtros y paginación"""
    query = db.query(Alumno)
    
    # Aplicar filtros
    if search:
        search_filter = or_(
            Alumno.nombre.ilike(f"%{search}%"),
            Alumno.apellido_paterno.ilike(f"%{search}%"),
            Alumno.apellido_materno.ilike(f"%{search}%"),
            Alumno.matricula.ilike(f"%{search}%"),
            Alumno.curp.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if nivel_educativo:
        query = query.filter(Alumno.nivel_educativo == nivel_educativo)
    
    if grado:
        query = query.filter(Alumno.grado == grado)
    
    if grupo:
        query = query.filter(Alumno.grupo == grupo)
    
    if estado:
        query = query.filter(Alumno.estado == estado)
    
    return query.offset(skip).limit(limit).all()

def get_alumnos_count(
    db: Session,
    search: Optional[str] = None,
    nivel_educativo: Optional[str] = None,
    grado: Optional[str] = None,
    grupo: Optional[str] = None,
    estado: Optional[str] = None
) -> int:
    """Contar total de alumnos con filtros aplicados"""
    query = db.query(Alumno)
    
    # Aplicar los mismos filtros que en get_alumnos
    if search:
        search_filter = or_(
            Alumno.nombre.ilike(f"%{search}%"),
            Alumno.apellido_paterno.ilike(f"%{search}%"),
            Alumno.apellido_materno.ilike(f"%{search}%"),
            Alumno.matricula.ilike(f"%{search}%"),
            Alumno.curp.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if nivel_educativo:
        query = query.filter(Alumno.nivel_educativo == nivel_educativo)
    
    if grado:
        query = query.filter(Alumno.grado == grado)
    
    if grupo:
        query = query.filter(Alumno.grupo == grupo)
    
    if estado:
        query = query.filter(Alumno.estado == estado)
    
    return query.count()

def create_alumno(db: Session, alumno: AlumnoCreate) -> Alumno:
    """Crear un nuevo alumno"""
    # Generar matrícula automáticamente
    matricula = generate_matricula(db, alumno.nivel_educativo)
    
    # Crear el alumno
    db_alumno = Alumno(
        matricula=matricula,
        nombre=alumno.nombre,
        apellido_paterno=alumno.apellido_paterno,
        apellido_materno=alumno.apellido_materno,
        fecha_nacimiento=alumno.fecha_nacimiento,
        curp=alumno.curp,
        nivel_educativo=alumno.nivel_educativo,
        grado=alumno.grado,
        grupo=alumno.grupo,
        estado=alumno.estado
    )
    
    db.add(db_alumno)
    db.flush()  # Para obtener el ID del alumno
    
    # Crear contactos de emergencia
    if alumno.contactos_emergencia:
        for contacto_data in alumno.contactos_emergencia:
            contacto = ContactoEmergencia(
                alumno_id=db_alumno.id,
                nombre=contacto_data.nombre,
                telefono=contacto_data.telefono,
                relacion=contacto_data.relacion
            )
            db.add(contacto)
    
    db.commit()
    db.refresh(db_alumno)
    return db_alumno

def update_alumno(db: Session, alumno_id: int, alumno: AlumnoUpdate) -> Optional[Alumno]:
    """Actualizar un alumno existente"""
    db_alumno = get_alumno(db, alumno_id)
    if not db_alumno:
        return None
    
    # Actualizar campos del alumno
    update_data = alumno.dict(exclude_unset=True)
    contactos_data = update_data.pop('contactos_emergencia', None)
    
    for field, value in update_data.items():
        setattr(db_alumno, field, value)
    
    # Actualizar contactos de emergencia si se proporcionan
    if contactos_data is not None:
        # Eliminar contactos existentes
        db.query(ContactoEmergencia).filter(ContactoEmergencia.alumno_id == alumno_id).delete()
        
        # Crear nuevos contactos
        for contacto_data in contactos_data:
            contacto = ContactoEmergencia(
                alumno_id=alumno_id,
                nombre=contacto_data.nombre,
                telefono=contacto_data.telefono,
                relacion=contacto_data.relacion
            )
            db.add(contacto)
    
    db.commit()
    db.refresh(db_alumno)
    return db_alumno

def delete_alumno(db: Session, alumno_id: int) -> bool:
    """Eliminar un alumno"""
    db_alumno = get_alumno(db, alumno_id)
    if not db_alumno:
        return False
    
    db.delete(db_alumno)
    db.commit()
    return True

def get_estadisticas(db: Session) -> dict:
    """Obtener estadísticas generales"""
    total_alumnos = db.query(Alumno).count()
    alumnos_activos = db.query(Alumno).filter(Alumno.estado == "Activo").count()
    alumnos_inactivos = db.query(Alumno).filter(Alumno.estado == "Inactivo").count()
    alumnos_egresados = db.query(Alumno).filter(Alumno.estado == "Egresado").count()
    
    # Estadísticas por nivel educativo
    por_nivel = {}
    niveles = ['Preescolar', 'Primaria', 'Secundaria', 'Preparatoria']
    for nivel in niveles:
        count = db.query(Alumno).filter(Alumno.nivel_educativo == nivel, Alumno.estado == "Activo").count()
        por_nivel[nivel] = count
    
    return {
        "total_alumnos": total_alumnos,
        "alumnos_activos": alumnos_activos,
        "alumnos_inactivos": alumnos_inactivos,
        "alumnos_egresados": alumnos_egresados,
        "por_nivel_educativo": por_nivel
    }