from sqlalchemy.orm import Session

from schemas.report import ReportsResponse
from services import report_service


def get_reports(db: Session) -> ReportsResponse:
    return report_service.generate_reports_summary(db)
