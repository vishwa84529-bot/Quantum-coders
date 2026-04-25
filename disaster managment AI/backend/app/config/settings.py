from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    openweather_api_key: Optional[str] = None
    google_maps_api_key: Optional[str] = None
    cors_origins: List[AnyHttpUrl] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ]
    database_url: str = "sqlite:///backend/alerts.db"

    class Config:
        env_file = (".env", "../.env")
        env_file_encoding = "utf-8"


settings = Settings()
