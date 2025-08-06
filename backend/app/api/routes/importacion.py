from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO

from ...database import get_db
from ...schemas.alumno import AlumnoImport
from ...services.excel_service import import_alumnos_from_excel, create_excel_template, export_alumnos_to_excel
from ...crud import alumno as crud_alumno

router = APIRouter()

@router.post("/importar-alumnos", response_model=AlumnoImport)
async def importar_alumnos_excel(
    file: UploadFile = File(..., description="Archivo Excel con datos de alumnos"),
    db: Session = Depends(get_db)
):
    """
    Importar alumnos desde archivo Excel
    """
    # Validar tipo de archivo
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=400,
            detail="El archivo debe ser un Excel (.xlsx o .xls)"
        )
    
    try:
        # Leer contenido del archivo
        content = await file.read()
        
        # Procesar importación
        result = import_alumnos_from_excel(db=db, file_content=content)
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar archivo: {str(e)}"
        )

@router.get("/plantilla-excel")
def descargar_plantilla_excel():
    """
    Descargar plantilla de Excel para importación de alumnos
    """
    try:
        # Crear plantilla
        buffer = create_excel_template()
        
        # Retornar como respuesta de streaming
        return StreamingResponse(
            BytesIO(buffer.read()),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=plantilla_alumnos.xlsx"}
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar plantilla: {str(e)}"
        )

@router.get("/exportar-alumnos")
def exportar_alumnos_excel(
    search: str = None,
    nivel_educativo: str = None,
    grado: str = None,
    grupo: str = None,
    estado: str = None,
    db: Session = Depends(get_db)
):
    """
    Exportar alumnos a Excel con filtros opcionales
    """
    try:
        # Obtener alumnos con filtros aplicados (sin paginación para exportar todos)
        alumnos = crud_alumno.get_alumnos(
            db=db,
            skip=0,
            limit=10000,  # Límite alto para exportar todos
            search=search,
            nivel_educativo=nivel_educativo,
            grado=grado,
            grupo=grupo,
            estado=estado
        )
        
        # Crear archivo Excel
        buffer = export_alumnos_to_excel(alumnos)
        
        # Retornar como respuesta de streaming
        return StreamingResponse(
            BytesIO(buffer.read()),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=alumnos_export.xlsx"}
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al exportar alumnos: {str(e)}"
        )