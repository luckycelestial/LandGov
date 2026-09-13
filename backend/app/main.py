from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.infrastructure.db.sqlite_client import init_db
from app.infrastructure.db.neo4j_client import neo4j_land_client

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.parcels import router as parcels_router
from app.api.v1.endpoints.disputes import router as disputes_router
from app.api.v1.endpoints.graph import router as graph_router
from app.api.v1.endpoints.policy_rag import router as policy_rag_router
from app.api.v1.endpoints.simulation import router as simulation_router
from app.api.v1.endpoints.repository import router as repository_router
from app.api.v1.endpoints.innovation import router as innovation_router
from app.api.v1.endpoints.citizen import router as citizen_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables & seed data
    init_db()
    # Initialize Neo4j graph & constraints
    neo4j_land_client.ensure_indexes()
    neo4j_land_client.seed_land_graph()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="National Digital Platform for Research, Policy Innovation, and Evidence-Based Land Governance (SIH 26019)",
    lifespan=lifespan
)

# CORS Middleware
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(parcels_router, prefix=settings.API_V1_STR)
app.include_router(disputes_router, prefix=settings.API_V1_STR)
app.include_router(graph_router, prefix=settings.API_V1_STR)
app.include_router(policy_rag_router, prefix=settings.API_V1_STR)
app.include_router(simulation_router, prefix=settings.API_V1_STR)
app.include_router(repository_router, prefix=settings.API_V1_STR)
app.include_router(innovation_router, prefix=settings.API_V1_STR)
app.include_router(citizen_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "organization": "Ministry of Rural Development",
        "department": "Department of Land Resources (DoLR)",
        "sih_code": "SIH 26019",
        "status": "Operational",
        "docs_url": "/docs"
    }
