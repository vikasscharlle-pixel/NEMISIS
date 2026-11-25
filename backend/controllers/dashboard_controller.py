from sqlalchemy.orm import Session

from schemas.dashboard import DashboardStatsResponse
from services import dashboard_service


def get_stats(db: Session) -> DashboardStatsResponse:
    return dashboard_service.get_dashboard_stats(db)
