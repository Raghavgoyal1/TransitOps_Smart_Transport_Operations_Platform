"""TransitOps FastAPI server."""
from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / \".env\")

from db import client  # noqa: E402
from routers.auth_routes import router as auth_router  # noqa: E402
from routers.fleet_routes import router as fleet_router  # noqa: E402
from routers.dashboard_routes import router as dashboard_router  # noqa: E402

app = FastAPI(title=\"TransitOps API\", version=\"1.0\")

api_router = APIRouter(prefix=\"/api\")


@api_router.get(\"/\")
async def root():
    return {\"name\": \"TransitOps API\", \"status\": \"operational\"}


@api_router.get(\"/health\")
async def health():
    return {\"status\": \"ok\"}


api_router.include_router(auth_router)
api_router.include_router(fleet_router)
api_router.include_router(dashboard_router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get(\"CORS_ORIGINS\", \"*\").split(\",\"),
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

logging.basicConfig(level=logging.INFO, format=\"%(asctime)s - %(name)s - %(levelname)s - %(message)s\")
logger = logging.getLogger(__name__)


@app.on_event(\"shutdown\")
async def shutdown_db_client():
    client.close()
