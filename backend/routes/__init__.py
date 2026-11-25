from routes.auth_routes import router as auth_router
from routes.dashboard_routes import router as dashboard_router
from routes.event_routes import router as event_router
from routes.report_routes import router as report_router
from routes.user_routes import router as user_router

__all__ = [
    "auth_router",
    "dashboard_router",
    "event_router",
    "report_router",
    "user_router",
]
