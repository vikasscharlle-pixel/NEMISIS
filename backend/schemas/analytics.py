from datetime import date
from typing import List

from pydantic import BaseModel, Field

class OverviewStats(BaseModel):
    total_detections: int = Field(..., description="Total number of detections ever recorded")
    todays_detections: int = Field(..., description="Detections recorded for the current UTC day")
    weekly_detections: int = Field(..., description="Detections recorded in the last 7 days including today")
    most_detected_object: str | None = Field(None, description="Object class with the highest count")
    average_confidence: float = Field(..., description="Average confidence across all detections")

class TrendPoint(BaseModel):
    date: str = Field(..., description="Date label in ISO format (YYYY-MM-DD)")
    count: int = Field(..., description="Number of detections on that day")

class DetectionTrendResponse(BaseModel):
    trend: List[TrendPoint]

class ObjectDistributionItem(BaseModel):
    object_class: str = Field(..., description="Detection class name")
    count: int = Field(..., description="Number of detections for this class")

class ObjectDistributionResponse(BaseModel):
    distribution: List[ObjectDistributionItem]

class RecentDetectionsItem(BaseModel):
    id: int
    source_type: str
    detection_class: str
    confidence: float
    created_at: date

class RecentDetectionsResponse(BaseModel):
    recent: List[RecentDetectionsItem]
