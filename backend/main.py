import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import get_settings
from core.redis_client import check_redis_health
from database.session import check_db_health
from middleware.logging_middleware import RequestLoggingMiddleware
from routes import auth_router, dashboard_router, event_router, report_router, user_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "NEMESIS-X Phase 1 Foundation API: JWT Authentication, RBAC, "
        "Dashboard Metrics, Event Lifecycle, and Reporting."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Middleware
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(event_router)
app.include_router(report_router)
app.include_router(user_router)


@app.get("/health", tags=["Health"], summary="Check API, database, and cache health")
def health_check() -> dict[str, str]:
    db_status = check_db_health()
    redis_status = check_redis_health()
    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "version": settings.APP_VERSION,
        "database": db_status,
        "redis": redis_status,
    }
