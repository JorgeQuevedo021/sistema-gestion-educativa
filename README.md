# Sistema de Gestión Educativa

Un sistema completo de gestión educativa desarrollado con FastAPI (backend) y React (frontend) que permite gestionar estudiantes de instituciones educativas.

## 🚀 Características

### Backend (FastAPI)
- **API RESTful completa** con documentación automática (Swagger/OpenAPI)
- **Gestión de alumnos** con validaciones robustas
- **Generación automática de matrículas** (formato: UNI2025001, UNI2025002, etc.)
- **Validación de CURP mexicana** con dígito verificador
- **Importación/exportación masiva** desde/hacia Excel
- **Sistema de búsqueda y filtros** avanzados
- **Paginación** de resultados
- **Contactos de emergencia** por alumno
- **Base de datos PostgreSQL** con SQLAlchemy ORM

### Frontend (React)
- **Interfaz moderna y responsive** con Tailwind CSS
- **Dashboard** con estadísticas en tiempo real
- **Gestión completa de alumnos** (crear, editar, eliminar, listar)
- **Formularios con validación** en tiempo real
- **Importación drag & drop** de archivos Excel
- **Búsqueda y filtros** dinámicos
- **Exportación de datos** a Excel
- **Navegación intuitiva** con React Router

## 📋 Requisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL 13+
- Docker (opcional)

## 🛠️ Instalación

### Opción 1: Usando Docker (Recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/JorgeQuevedo021/sistema-gestion-educativa.git
cd sistema-gestion-educativa

# Ejecutar con Docker Compose
docker-compose up -d

# Las aplicaciones estarán disponibles en:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Documentación API: http://localhost:8000/docs
```

### Opción 2: Instalación Manual

#### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar la aplicación
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

#### Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb sistema_educativo

# Las tablas se crearán automáticamente al iniciar el backend
```

## 🗃️ Estructura del Proyecto

```
sistema-gestion-educativa/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/         # Endpoints de la API
│   │   ├── crud/               # Operaciones CRUD
│   │   ├── models/             # Modelos SQLAlchemy
│   │   ├── schemas/            # Schemas Pydantic
│   │   ├── services/           # Lógica de negocio
│   │   ├── utils/              # Utilidades y validadores
│   │   ├── config.py           # Configuraciones
│   │   ├── database.py         # Configuración DB
│   │   └── main.py             # Aplicación principal
│   ├── requirements.txt        # Dependencias Python
│   ├── .env.example           # Variables de entorno
│   └── Dockerfile             # Docker backend
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── pages/              # Páginas principales
│   │   ├── services/           # Servicios API
│   │   ├── utils/              # Utilidades
│   │   └── App.jsx             # Componente principal
│   ├── package.json            # Dependencias npm
│   ├── tailwind.config.js      # Configuración Tailwind
│   └── Dockerfile             # Docker frontend
├── docker-compose.yml          # Orquestación Docker
└── README.md                   # Documentación
```

## 🔧 Configuración

### Variables de Entorno (Backend)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sistema_educativo
SECRET_KEY=your-secret-key-here-change-in-production
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sistema_educativo
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

## 📚 API Endpoints

### Alumnos
- `GET /api/v1/alumnos/` - Listar alumnos (con paginación y filtros)
- `POST /api/v1/alumnos/` - Crear nuevo alumno
- `GET /api/v1/alumnos/{id}` - Obtener alumno por ID
- `PUT /api/v1/alumnos/{id}` - Actualizar alumno
- `DELETE /api/v1/alumnos/{id}` - Eliminar alumno
- `GET /api/v1/alumnos/matricula/{matricula}` - Buscar por matrícula
- `GET /api/v1/alumnos/estadisticas/general` - Estadísticas generales

### Importación/Exportación
- `POST /api/v1/importacion/importar-alumnos` - Importar desde Excel
- `GET /api/v1/importacion/plantilla-excel` - Descargar plantilla
- `GET /api/v1/importacion/exportar-alumnos` - Exportar a Excel

## 🎯 Funcionalidades Clave

### Validaciones
- **CURP mexicana**: Formato completo con dígito verificador
- **Teléfonos**: Formato mexicano (10 dígitos)
- **Fechas**: Validación de edad (3-25 años)
- **Matrículas**: Generación automática única por año

### Importación Excel
- Plantilla descargable con formato correcto
- Validación completa de datos antes de importar
- Reporte detallado de errores y éxitos
- Soporte para múltiples contactos de emergencia

### Búsqueda y Filtros
- Búsqueda por nombre, apellido, matrícula o CURP
- Filtros por nivel educativo, grado, grupo y estado
- Paginación eficiente
- Exportación de resultados filtrados

## 🧪 Testing

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## 📊 Modelos de Datos

### Alumno
- ID, matrícula (auto-generada)
- Información personal (nombre, apellidos, fecha nacimiento, CURP)
- Información académica (nivel, grado, grupo, estado)
- Fecha de inscripción
- Contactos de emergencia

### Contacto de Emergencia
- Información de contacto (nombre, teléfono, relación)
- Vinculado al alumno

## 🌐 Tecnologías Utilizadas

### Backend
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para Python
- **Pydantic** - Validación de datos
- **PostgreSQL** - Base de datos
- **Pandas** - Procesamiento de Excel
- **Uvicorn** - Servidor ASGI

### Frontend
- **React 18** - Librería UI
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Routing
- **React Hook Form** - Gestión de formularios
- **Axios** - Cliente HTTP
- **React Dropzone** - Upload de archivos

### DevOps
- **Docker** - Containerización
- **Docker Compose** - Orquestación
- **PostgreSQL** - Base de datos
- **Nginx** (producción) - Proxy reverso

## 🚀 Producción

### Build para Producción

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
# Configurar variables de entorno de producción
# Usar servidor WSGI como Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker Producción

```bash
# Usar docker-compose.prod.yml para producción
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Jorge Quevedo** - *Desarrollo Inicial* - [@JorgeQuevedo021](https://github.com/JorgeQuevedo021)

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la [documentación de la API](http://localhost:8000/docs)
2. Crea un [issue](https://github.com/JorgeQuevedo021/sistema-gestion-educativa/issues)
3. Contacta al equipo de desarrollo

---

⭐ Si este proyecto te fue útil, ¡no olvides darle una estrella!

This repository contains a FastAPI backend and a React frontend for an educational management system.
