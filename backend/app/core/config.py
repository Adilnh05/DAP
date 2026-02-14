from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[3]  # dap/
ENV_FILE = ROOT_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str
    STORAGE_PATH: str = "storage"
    BACKEND_PORT: int = 8000
    FRONTEND_PORT: int = 5173

    ENV: str = "dev"


settings = Settings()
