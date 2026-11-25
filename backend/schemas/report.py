from datetime import datetime
from typing import Dict, List
from pydantic import BaseModel


class ReportSummaryItem(BaseModel):
    id: int
    type: str
    status: str
    confidence: float
    anomaly_score: float
    camera_location: str
    created_at: datetime


class ReportsResponse(BaseModel):
    generated_at: datetime
    total_events: int
    high_risk_count: int
    average_confidence: float
    average_anomaly_score: float
    status_breakdown: Dict[str, int]
    type_breakdown: Dict[str, int]
    recent_incidents: List[ReportSummaryItem]
