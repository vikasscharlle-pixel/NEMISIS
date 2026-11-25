from collections import defaultdict
from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from core.redis_client import check_redis_health
from database.session import check_db_health
from models.event import Event, EventStatus
from schemas.dashboard import DashboardStatsResponse, DistributionSlice, IncidentStat, TrendPoint


def get_dashboard_stats(db: Session) -> DashboardStatsResponse:
    """Compute Phase 1 dashboard KPIs and chart data from persisted events."""
    rows = db.query(Event.status, func.count(Event.id)).group_by(Event.status).all()
    counts = {status: count for status, count in rows}

    total_alerts = sum(counts.values())
    need_to_investigate = counts.get(EventStatus.NEED_TO_INVESTIGATE.value, 0)
    waiting_queue = counts.get(EventStatus.WAITING.value, 0)
    cleaning_queue = counts.get(EventStatus.CLEANING.value, 0) + counts.get(EventStatus.TRASH.value, 0)
    cleared_events = counts.get(EventStatus.CLEARED.value, 0)
    usual_events = counts.get(EventStatus.USUAL.value, 0)

    db_status = check_db_health()
    redis_status = check_redis_health()
    system_health = "Healthy" if db_status == "connected" else "Degraded"

    # Build 7-day trend from event timestamps
    events = db.query(Event).order_by(Event.created_at.asc()).all()
    today = datetime.now(timezone.utc).date()
    day_buckets = {
        (today - timedelta(days=offset)).isoformat(): {"total": 0, "investigate": 0, "cleared": 0}
        for offset in range(6, -1, -1)
    }

    type_counts: dict[str, list[float]] = defaultdict(list)

    for ev in events:
        type_counts[ev.type].append(ev.anomaly_score)
        ev_day = ev.created_at.date().isoformat()
        if ev_day in day_buckets:
            day_buckets[ev_day]["total"] += 1
            if ev.status == EventStatus.NEED_TO_INVESTIGATE.value:
                day_buckets[ev_day]["investigate"] += 1
            elif ev.status == EventStatus.CLEARED.value:
                day_buckets[ev_day]["cleared"] += 1

    alerts_trend = [
        TrendPoint(
            date=day[5:],  # MM-DD label for compact axis display
            total=vals["total"],
            investigate=vals["investigate"],
            cleared=vals["cleared"],
        )
        for day, vals in day_buckets.items()
    ]

    event_distribution = [
        DistributionSlice(name="Need To Investigate", value=need_to_investigate),
        DistributionSlice(name="Waiting", value=waiting_queue),
        DistributionSlice(name="Cleaning", value=cleaning_queue),
        DistributionSlice(name="Cleared", value=cleared_events),
        DistributionSlice(name="Usual", value=usual_events),
    ]

    incident_statistics = [
        IncidentStat(
            category=ev_type,
            count=len(scores),
            avg_anomaly=round(sum(scores) / len(scores), 2),
        )
        for ev_type, scores in sorted(type_counts.items(), key=lambda kv: len(kv[1]), reverse=True)[:6]
    ]

    return DashboardStatsResponse(
        total_alerts=total_alerts,
        need_to_investigate=need_to_investigate,
        waiting_queue=waiting_queue,
        cleaning_queue=cleaning_queue,
        cleared_events=cleared_events,
        usual_events=usual_events,
        system_health=system_health,
        database_status=db_status,
        redis_status=redis_status,
        alerts_trend=alerts_trend,
        event_distribution=event_distribution,
        incident_statistics=incident_statistics,
    )
