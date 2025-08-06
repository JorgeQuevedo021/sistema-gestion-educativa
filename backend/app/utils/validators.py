import re
from datetime import datetime
from sqlalchemy.orm import Session

def validate_curp(curp: str) -> bool:
    """
    Valida el formato y dígito verificador de una CURP mexicana
    """
    if not curp or len(curp) != 18:
        return False
    
    # Patrón básico de CURP
    pattern = r'^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}$'
    if not re.match(pattern, curp.upper()):
        return False
    
    # Validar dígito verificador
    return validate_curp_digit(curp)

def validate_curp_digit(curp: str) -> bool:
    """
    Valida el dígito verificador de la CURP
    """
    curp = curp.upper()
    
    # Tabla de valores para el cálculo del dígito verificador
    valores = {
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'I': 18,
        'J': 19, 'K': 20, 'L': 21, 'M': 22, 'N': 23, 'Ñ': 24, 'O': 25, 'P': 26, 'Q': 27,
        'R': 28, 'S': 29, 'T': 30, 'U': 31, 'V': 32, 'W': 33, 'X': 34, 'Y': 35, 'Z': 36
    }
    
    # Calcular suma ponderada
    suma = 0
    for i, char in enumerate(curp[:17]):
        suma += valores.get(char, 0) * (18 - i)
    
    # Calcular dígito verificador
    residuo = suma % 10
    digito_esperado = (10 - residuo) % 10
    
    return str(digito_esperado) == curp[17]

def generate_matricula(db: Session, nivel_educativo: str) -> str:
    """
    Genera una matrícula única para un alumno
    Formato: UNI{año}{número secuencial de 3 dígitos}
    """
    from ..models.alumno import Alumno
    
    current_year = datetime.now().year
    prefix = f"UNI{current_year}"
    
    # Buscar la última matrícula del año actual
    last_alumno = db.query(Alumno).filter(
        Alumno.matricula.like(f"{prefix}%")
    ).order_by(Alumno.matricula.desc()).first()
    
    if last_alumno:
        # Extraer el número secuencial de la última matrícula
        try:
            last_number = int(last_alumno.matricula.replace(prefix, ""))
            next_number = last_number + 1
        except ValueError:
            next_number = 1
    else:
        next_number = 1
    
    # Generar nueva matrícula con formato de 3 dígitos
    return f"{prefix}{next_number:03d}"

def validate_mexican_phone(phone: str) -> bool:
    """
    Valida formato de teléfono mexicano
    """
    # Limpiar el teléfono de espacios y guiones
    clean_phone = phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    
    # Patrones válidos para teléfonos mexicanos
    patterns = [
        r'^\+52[0-9]{10}$',  # +52 seguido de 10 dígitos
        r'^[0-9]{10}$',      # 10 dígitos
        r'^044[0-9]{10}$',   # 044 seguido de 10 dígitos
        r'^045[0-9]{10}$'    # 045 seguido de 10 dígitos
    ]
    
    return any(re.match(pattern, clean_phone) for pattern in patterns)