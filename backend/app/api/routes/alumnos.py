from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from math import ceil

from ...database import get_db
from ...schemas.alumno import Alumno, AlumnoCreate, AlumnoUpdate, AlumnoList
from ...crud import alumno as crud_alumno

router = APIRouter()

@router.get("/", response_model=AlumnoList)
def list_alumnos(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=500, description="Número máximo de registros a devolver"),
    search: Optional[str] = Query(None, description="Búsqueda por nombre, apellido, matrícula o CURP"),
    nivel_educativo: Optional[str] = Query(None, description="Filtrar por nivel educativo"),
    grado: Optional[str] = Query(None, description="Filtrar por grado"),
    grupo: Optional[str] = Query(None, description="Filtrar por grupo"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    db: Session = Depends(get_db)
):
    """
    Obtener lista de alumnos con paginación y filtros
    """
    # Obtener total de registros con filtros aplicados
    total = crud_alumno.get_alumnos_count(
        db=db,
        search=search,
        nivel_educativo=nivel_educativo,
        grado=grado,
        grupo=grupo,
        estado=estado
    )
    
    # Obtener alumnos
    alumnos = crud_alumno.get_alumnos(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        nivel_educativo=nivel_educativo,
        grado=grado,
        grupo=grupo,
        estado=estado
    )
    
    # Calcular información de paginación
    pages = ceil(total / limit) if limit > 0 else 1
    page = (skip // limit) + 1 if limit > 0 else 1
    
    return AlumnoList(
        total=total,
        page=page,
        per_page=limit,
        pages=pages,
        items=alumnos
    )

@router.post("/", response_model=Alumno, status_code=status.HTTP_201_CREATED)
def create_alumno(
    alumno: AlumnoCreate,
    db: Session = Depends(get_db)
):
    """
    Crear un nuevo alumno
    """
    # Verificar si ya existe un alumno con la misma CURP
    db_alumno = crud_alumno.get_alumno_by_curp(db, curp=alumno.curp)
    if db_alumno:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un alumno con esta CURP"
        )
    
    return crud_alumno.create_alumno(db=db, alumno=alumno)

@router.get("/{alumno_id}", response_model=Alumno)
def get_alumno(
    alumno_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener un alumno por ID
    """
    db_alumno = crud_alumno.get_alumno(db, alumno_id=alumno_id)
    if db_alumno is None:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    return db_alumno

@router.put("/{alumno_id}", response_model=Alumno)
def update_alumno(
    alumno_id: int,
    alumno: AlumnoUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar un alumno existente
    """
    # Verificar si el alumno existe
    db_alumno = crud_alumno.get_alumno(db, alumno_id=alumno_id)
    if db_alumno is None:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    
    # Si se está actualizando la CURP, verificar que no esté duplicada
    if alumno.curp and alumno.curp != db_alumno.curp:
        existing_alumno = crud_alumno.get_alumno_by_curp(db, curp=alumno.curp)
        if existing_alumno:
            raise HTTPException(
                status_code=400,
                detail="Ya existe otro alumno con esta CURP"
            )
    
    updated_alumno = crud_alumno.update_alumno(db=db, alumno_id=alumno_id, alumno=alumno)
    if updated_alumno is None:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    
    return updated_alumno

@router.delete("/{alumno_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alumno(
    alumno_id: int,
    db: Session = Depends(get_db)
):
    """
    Eliminar un alumno
    """
    success = crud_alumno.delete_alumno(db=db, alumno_id=alumno_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")

@router.get("/matricula/{matricula}", response_model=Alumno)
def get_alumno_by_matricula(
    matricula: str,
    db: Session = Depends(get_db)
):
    """
    Obtener un alumno por matrícula
    """
    db_alumno = crud_alumno.get_alumno_by_matricula(db, matricula=matricula)
    if db_alumno is None:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    return db_alumno

@router.get("/estadisticas/general")
def get_estadisticas(db: Session = Depends(get_db)):
    """
    Obtener estadísticas generales del sistema
    """
    return crud_alumno.get_estadisticas(db=db)