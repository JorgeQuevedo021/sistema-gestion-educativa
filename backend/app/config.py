from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/sistema_educativo"
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_db: str = "sistema_educativo"
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()