from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    gemini_api_key: str = ""
    gemini_image_api_key: str = ""
    gemini_search_api_key: str = ""
    database_url: str = "sqlite:///./fixit.db"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
