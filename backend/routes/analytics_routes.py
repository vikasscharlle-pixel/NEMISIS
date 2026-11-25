# backend/routes/analytics_routes.py
"""Analytics API routes (Phase 3.1). All endpoints are JWT protected."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from controllers import analytics_controller
from database.session import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.analytics import (
    OverviewStats,
    DetectionTrendResponse,
    ObjectDistributionResponse,
    RecentDetectionsResponse,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=OverviewStats, summary="Analytics overview stats")
def overview(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OverviewStats:
    return analytics_controller.get_overview(db)

@router.get(
    "/trends",
    response_model=DetectionTrendResponse,
    summary="Detection trend data (last 30 days)",
)
def trends(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DetectionTrendResponse:
    return analytics_controller.get_trends(db)

@router.get(
    "/objects",
    response_model=ObjectDistributionResponse,
    summary="Object class distribution",
)
def objects(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ObjectDistributionResponse:
    return analytics_controller.get_objects_distribution(db)

@router.get(
    "/recent",
    response_model=RecentDetectionsResponse,
    summary="Recent detections (latest 10)",
)
def recent(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RecentDetectionsResponse:
    return analytics_controller.get_recent(db)
