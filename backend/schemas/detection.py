from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class BoundingBox(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int


class DetectionItem(BaseModel):
    """Single YOLO detection bounding-box result."""
    id: int
    source_type: str
    source_path: str
    detection_class: str
    confidence: float
    bounding_box: BoundingBox
    frame_index: Optional[int] = None
    video_id: Optional[int] = None
    annotated_image_path: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DetectionListResponse(BaseModel):
    items: List[DetectionItem]
    total: int


class ImageDetectionResponse(BaseModel):
    """Returned immediately after a /detect/image call."""
    source_path: str
    annotated_image_path: Optional[str]
    detections: List[DetectionItem]
    total_objects: int
    classes_found: Dict[str, int]      # {"Person": 2, "Bag": 1, ...}
    inference_time_ms: float
    model_used: str


class VideoDetectionResponse(BaseModel):
    """Returned after a /detect/video call (async or sync summary)."""
    source_path: str
    video_id: Optional[int]
    total_frames_processed: int
    total_detections: int
    classes_found: Dict[str, int]
    inference_time_ms: float
    model_used: str
    sample_annotated_path: Optional[str] = None
    reasoning_summary: str = ""
    reasoning_events: List[Dict[str, Any]] = []
