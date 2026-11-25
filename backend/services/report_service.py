from collections import Counter
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from models.event import Event
from schemas.report import ReportsResponse, ReportSummaryItem


def generate_reports_summary(db: Session) -> ReportsResponse:
    """Aggregate incident metrics and recent records for the Reports view."""
    events = db.query(Event).order_by(Event.created_at.desc(), Event.id.desc()).all()
    total_events = len(events)

    if total_events == 0:
        return ReportsResponse(
            generated_at=datetime.now(timezone.utc),
            total_events=0,
            high_risk_count=0,
            average_confidence=0.0,
            average_anomaly_score=0.0,
            status_breakdown={},
            type_breakdown={},
            recent_incidents=[],
        )

    high_risk_count = sum(1 for e in events if e.anomaly_score >= 0.75)
    avg_confidence = round(sum(e.confidence for e in events) / total_events, 3)
    avg_anomaly = round(sum(e.anomaly_score for e in events) / total_events, 3)
    status_breakdown = dict(Counter(e.status for e in events))
    type_breakdown = dict(Counter(e.type for e in events))

    recent_incidents = [
        ReportSummaryItem(
            id=e.id,
            type=e.type,
            status=e.status,
            confidence=e.confidence,
            anomaly_score=e.anomaly_score,
            camera_location=e.camera_location or "Camera-01",
            created_at=e.created_at,
        )
        for e in events[:20]
    ]

    return ReportsResponse(
        generated_at=datetime.now(timezone.utc),
        total_events=total_events,
        high_risk_count=high_risk_count,
        average_confidence=avg_confidence,
        average_anomaly_score=avg_anomaly,
        status_breakdown=status_breakdown,
        type_breakdown=type_breakdown,
        recent_incidents=recent_incidents,
    )
