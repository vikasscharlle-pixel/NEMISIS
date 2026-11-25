from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from controllers import dashboard_controller
from database.session import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.dashboard import DashboardStatsResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse, summary="Get dashboard summary KPIs and charts")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> DashboardStatsResponse:
    return dashboard_controller.get_stats(db)
