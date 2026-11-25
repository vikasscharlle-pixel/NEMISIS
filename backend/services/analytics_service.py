# backend/services/analytics_service.py
"""Analytics service for Phase 3.1.
Provides functions to compute overview statistics, trend data, and object distribution.
All queries are optimized using SQLAlchemy aggregate functions.
"""

from datetime import datetime, timedelta, timezone
from collections import Counter
from typing import List, Tuple

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from models.detection import Detection


def _base_query(db: Session):
    """Return a base selectable for the Detection table."""
    return db.query(Detection)


def get_total_detections(db: Session) -> int:
    return db.query(func.count(Detection.id)).scalar() or 0


def get_today_detections(db: Session) -> int:
    today = datetime.now(timezone.utc).date()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1)
    return (
        db.query(func.count(Detection.id))
        .filter(Detection.created_at >= start, Detection.created_at < end)
        .scalar()
        or 0
    )


def get_weekly_detections(db: Session) -> int:
    today = datetime.now(timezone.utc).date()
    week_ago = today - timedelta(days=6)  # include today (7 days total)
    start = datetime.combine(week_ago, datetime.min.time(), tzinfo=timezone.utc)
    end = datetime.combine(today + timedelta(days=1), datetime.min.time(), tzinfo=timezone.utc)
    return (
        db.query(func.count(Detection.id))
        .filter(Detection.created_at >= start, Detection.created_at < end)
        .scalar()
        or 0
    )


def get_most_detected_object(db: Session) -> Tuple[str, int]:
    result = (
        db.query(Detection.detection_class, func.count(Detection.id).label("cnt"))
        .group_by(Detection.detection_class)
        .order_by(func.count(Detection.id).desc())
        .first()
    )
    return (result[0], result[1]) if result else ("", 0)


def get_average_confidence(db: Session) -> float:
    avg = db.query(func.avg(Detection.confidence)).scalar()
    return round(float(avg), 4) if avg is not None else 0.0


def get_detection_trend(db: Session, days: int = 30) -> List[Tuple[str, int]]:
    """Return a list of (date_iso, count) for the past *days* (including today)."""
    today = datetime.now(timezone.utc).date()
    start_date = today - timedelta(days=days - 1)
    start_dt = datetime.combine(start_date, datetime.min.time(), tzinfo=timezone.utc)
    end_dt = datetime.combine(today + timedelta(days=1), datetime.min.time(), tzinfo=timezone.utc)

    # Query grouped by date (UTC)
    rows = (
        db.query(func.date_trunc('day', Detection.created_at).label('day'), func.count(Detection.id))
        .filter(Detection.created_at >= start_dt, Detection.created_at < end_dt)
        .group_by('day')
        .order_by('day')
        .all()
    )
    # Convert to dict for fast lookup
    counts = {row[0].date().isoformat(): row[1] for row in rows}
    # Build full list ensuring missing dates appear with count 0
    trend = []
    for offset in range(days):
        d = (start_date + timedelta(days=offset)).isoformat()
        trend.append((d, counts.get(d, 0)))
    return trend


def get_object_distribution(db: Session, limit: int = 10) -> List[Tuple[str, int]]:
    rows = (
        db.query(Detection.detection_class, func.count(Detection.id).label('cnt'))
        .group_by(Detection.detection_class)
        .order_by(func.count(Detection.id).desc())
        .limit(limit)
        .all()
    )
    return [(r[0], r[1]) for r in rows]


def get_recent_detections(db: Session, limit: int = 10) -> List[Detection]:
    return (
        db.query(Detection)
        .order_by(Detection.created_at.desc())
        .limit(limit)
        .all()
    )
