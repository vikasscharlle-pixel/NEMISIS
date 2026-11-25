from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from controllers import report_controller
from database.session import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.report import ReportsResponse

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=ReportsResponse, summary="Get aggregated incident reports")
def get_reports(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> ReportsResponse:
    return report_controller.get_reports(db)
