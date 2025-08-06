from fastapi import APIRouter
from .routes import alumnos, importacion

api_router = APIRouter()

api_router.include_router(
    alumnos.router,
    prefix="/alumnos",
    tags=["alumnos"]
)

api_router.include_router(
    importacion.router,
    prefix="/importacion",
    tags=["importacion"]
)