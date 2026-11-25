# backend/controllers/analytics_controller.py
"""Analytics controller exposing service functions as FastAPI responses."""

from fastapi import Depends
from sqlalchemy.orm import Session

from controllers import dashboard_controller
from database.session import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.analytics import (
    OverviewStats,
    DetectionTrendResponse,
    ObjectDistributionResponse,
    RecentDetectionsResponse,
)
from services import analytics_service


def get_overview(db: Session) -> OverviewStats:
    total = analytics_service.get_total_detections(db)
    today = analytics_service.get_today_detections(db)
    week = analytics_service.get_weekly_detections(db)
    most_obj, most_cnt = analytics_service.get_most_detected_object(db)
    avg_conf = analytics_service.get_average_confidence(db)
    return OverviewStats(
        total_detections=total,
        todays_detections=today,
        weekly_detections=week,
        most_detected_object=most_obj or None,
        average_confidence=avg_conf,
    )


def get_trends(db: Session) -> DetectionTrendResponse:
    trend = analytics_service.get_detection_trend(db, days=30)
    return DetectionTrendResponse(
        trend=[{"date": d, "count": c} for d, c in trend]
    )


def get_objects_distribution(db: Session) -> ObjectDistributionResponse:
    distribution = analytics_service.get_object_distribution(db, limit=10)
    return ObjectDistributionResponse(
        distribution=[{"object_class": cls, "count": cnt} for cls, cnt in distribution]
    )


def get_recent(db: Session) -> RecentDetectionsResponse:
    recent = analytics_service.get_recent_detections(db, limit=10)
    # map Detection model to response schema fields
    items = []
    for det in recent:
        items.append({
            "id": det.id,
            "source_type": det.source_type,
            "detection_class": det.detection_class,
            "confidence": det.confidence,
            "created_at": det.created_at.date(),
        })
    return RecentDetectionsResponse(recent=items)
