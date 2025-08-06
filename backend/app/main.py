from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.api import api_router

app = FastAPI(
    title="Sistema de Gestión Educativa",
    description="API para gestión de alumnos en instituciones educativas",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers de la API
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {
        "message": "Sistema de Gestión Educativa API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Crear las tablas en la base de datos (solo cuando esté disponible)
@app.on_event("startup")
async def startup_event():
    try:
        from .models.alumno import Base
        from .database import engine
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"⚠️ Warning: Could not connect to database: {e}")
        print("🔧 The API will still work but database operations will fail")
        print("🐳 Consider using Docker Compose for full functionality")