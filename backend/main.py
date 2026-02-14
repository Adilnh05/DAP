from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from app.core.config import settings
from app.api import api_router

ROOT_DIR = Path(__file__).resolve().parents[1]  # backend/
PROJECT_ROOT = Path(__file__).resolve().parents[2]  # dap/


def ensure_storage_dir():
    # storage path is relative to repo root
    storage_dir = PROJECT_ROOT / settings.STORAGE_PATH
    storage_dir.mkdir(parents=True, exist_ok=True)


ensure_storage_dir()

app = FastAPI(
    title="DAP Backend",
    version="0.1.0",
)

# CORS for frontend
origins = [
    f"http://localhost:{settings.FRONTEND_PORT}",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "dap-backend"}


# API routes
app.include_router(api_router, prefix="/api")
