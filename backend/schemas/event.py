from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from models.event import EventStatus


class EvidenceRead(BaseModel):
    id: int
    event_id: int
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    description: str

    model_config = {"from_attributes": True}


class VideoSummary(BaseModel):
    id: int
    source: str
    duration: float
    status: str

    model_config = {"from_attributes": True}


class EventRead(BaseModel):
    id: int
    type: str
    status: str
    confidence: float
    anomaly_score: float
    video_id: Optional[int] = None
    camera_location: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class EventDetailRead(EventRead):
    evidence_items: List[EvidenceRead] = []
    video: Optional[VideoSummary] = None


class EventListResponse(BaseModel):
    items: List[EventRead]
    total: int


class EventStatusUpdate(BaseModel):
    status: EventStatus = Field(..., description="New lifecycle status for the event")
