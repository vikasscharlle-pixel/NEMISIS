from typing import List
from pydantic import BaseModel


class TrendPoint(BaseModel):
    date: str
    total: int
    investigate: int
    cleared: int


class DistributionSlice(BaseModel):
    name: str
    value: int


class IncidentStat(BaseModel):
    category: str
    count: int
    avg_anomaly: float


class DashboardStatsResponse(BaseModel):
    total_alerts: int
    need_to_investigate: int
    waiting_queue: int
    cleaning_queue: int
    cleared_events: int
    usual_events: int
    system_health: str
    database_status: str
    redis_status: str
    alerts_trend: List[TrendPoint]
    event_distribution: List[DistributionSlice]
    incident_statistics: List[IncidentStat]
