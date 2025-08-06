import pandas as pd
from io import BytesIO
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
from ..schemas.alumno import AlumnoCreate, ContactoEmergenciaCreate, AlumnoImport
from ..crud.alumno import create_alumno, get_alumno_by_curp
from ..utils.validators import validate_curp

def create_excel_template() -> BytesIO:
    """
    Crear plantilla de Excel para importación de alumnos
    """
    # Datos de ejemplo para la plantilla
    data = {
        'nombre': ['Juan', 'María'],
        'apellido_paterno': ['Pérez', 'González'],
        'apellido_materno': ['López', 'Martínez'],
        'fecha_nacimiento': ['2010-05-15', '2009-08-22'],
        'curp': ['PELJ100515HDFRZN09', 'GOMA090822MDFNRT07'],
        'nivel_educativo': ['Primaria', 'Primaria'],
        'grado': ['6', '5'],
        'grupo': ['A', 'B'],
        'estado': ['Activo', 'Activo'],
        'contacto_emergencia_1_nombre': ['Pedro Pérez', 'José González'],
        'contacto_emergencia_1_telefono': ['5551234567', '5559876543'],
        'contacto_emergencia_1_relacion': ['Padre', 'Padre'],
        'contacto_emergencia_2_nombre': ['Ana López', 'Carmen Martínez'],
        'contacto_emergencia_2_telefono': ['5551234568', '5559876544'],
        'contacto_emergencia_2_relacion': ['Madre', 'Madre']
    }
    
    df = pd.DataFrame(data)
    
    # Crear buffer de memoria
    buffer = BytesIO()
    
    # Escribir Excel con formato
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Alumnos', index=False)
        
        # Obtener el workbook y worksheet para formatear
        workbook = writer.book
        worksheet = writer.sheets['Alumnos']
        
        # Ajustar ancho de columnas
        for column in worksheet.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            worksheet.column_dimensions[column_letter].width = adjusted_width
    
    buffer.seek(0)
    return buffer

def import_alumnos_from_excel(db: Session, file_content: bytes) -> AlumnoImport:
    """
    Importar alumnos desde archivo Excel
    """
    success_count = 0
    error_count = 0
    errors = []
    imported_alumnos = []
    
    try:
        # Leer archivo Excel
        df = pd.read_excel(BytesIO(file_content))
        
        # Validar columnas requeridas
        required_columns = [
            'nombre', 'apellido_paterno', 'fecha_nacimiento', 'curp',
            'nivel_educativo', 'grado', 'grupo'
        ]
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            errors.append(f"Columnas faltantes: {', '.join(missing_columns)}")
            return AlumnoImport(
                success_count=0,
                error_count=len(df),
                errors=errors,
                imported_alumnos=[]
            )
        
        # Procesar cada fila
        for index, row in df.iterrows():
            try:
                # Validar CURP duplicada
                if get_alumno_by_curp(db, str(row['curp'])):
                    errors.append(f"Fila {index + 2}: CURP {row['curp']} ya existe")
                    error_count += 1
                    continue
                
                # Preparar datos del alumno
                alumno_data = {
                    'nombre': str(row['nombre']).strip(),
                    'apellido_paterno': str(row['apellido_paterno']).strip(),
                    'apellido_materno': str(row.get('apellido_materno', '')).strip() or None,
                    'fecha_nacimiento': pd.to_datetime(row['fecha_nacimiento']).date(),
                    'curp': str(row['curp']).strip().upper(),
                    'nivel_educativo': str(row['nivel_educativo']).strip(),
                    'grado': str(row['grado']).strip(),
                    'grupo': str(row['grupo']).strip(),
                    'estado': str(row.get('estado', 'Activo')).strip()
                }
                
                # Preparar contactos de emergencia
                contactos = []
                for i in range(1, 4):  # Hasta 3 contactos
                    nombre_col = f'contacto_emergencia_{i}_nombre'
                    telefono_col = f'contacto_emergencia_{i}_telefono'
                    relacion_col = f'contacto_emergencia_{i}_relacion'
                    
                    if (nombre_col in row and pd.notna(row[nombre_col]) and
                        telefono_col in row and pd.notna(row[telefono_col]) and
                        relacion_col in row and pd.notna(row[relacion_col])):
                        
                        contacto = ContactoEmergenciaCreate(
                            nombre=str(row[nombre_col]).strip(),
                            telefono=str(row[telefono_col]).strip(),
                            relacion=str(row[relacion_col]).strip()
                        )
                        contactos.append(contacto)
                
                # Crear objeto AlumnoCreate
                alumno_create = AlumnoCreate(
                    **alumno_data,
                    contactos_emergencia=contactos
                )
                
                # Crear alumno en la base de datos
                alumno = create_alumno(db, alumno_create)
                imported_alumnos.append(alumno)
                success_count += 1
                
            except Exception as e:
                error_count += 1
                errors.append(f"Fila {index + 2}: {str(e)}")
    
    except Exception as e:
        errors.append(f"Error al procesar archivo: {str(e)}")
        error_count = 1
    
    return AlumnoImport(
        success_count=success_count,
        error_count=error_count,
        errors=errors,
        imported_alumnos=imported_alumnos
    )

def export_alumnos_to_excel(alumnos: List[Any]) -> BytesIO:
    """
    Exportar lista de alumnos a Excel
    """
    data = []
    
    for alumno in alumnos:
        row = {
            'matricula': alumno.matricula,
            'nombre': alumno.nombre,
            'apellido_paterno': alumno.apellido_paterno,
            'apellido_materno': alumno.apellido_materno or '',
            'fecha_nacimiento': alumno.fecha_nacimiento.strftime('%Y-%m-%d'),
            'curp': alumno.curp,
            'nivel_educativo': alumno.nivel_educativo,
            'grado': alumno.grado,
            'grupo': alumno.grupo,
            'estado': alumno.estado,
            'fecha_inscripcion': alumno.fecha_inscripcion.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Agregar contactos de emergencia
        for i, contacto in enumerate(alumno.contactos_emergencia[:3], 1):
            row[f'contacto_emergencia_{i}_nombre'] = contacto.nombre
            row[f'contacto_emergencia_{i}_telefono'] = contacto.telefono
            row[f'contacto_emergencia_{i}_relacion'] = contacto.relacion
        
        data.append(row)
    
    df = pd.DataFrame(data)
    
    # Crear buffer de memoria
    buffer = BytesIO()
    
    # Escribir Excel
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Alumnos', index=False)
        
        # Formatear
        workbook = writer.book
        worksheet = writer.sheets['Alumnos']
        
        # Ajustar ancho de columnas
        for column in worksheet.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            worksheet.column_dimensions[column_letter].width = adjusted_width
    
    buffer.seek(0)
    return buffer