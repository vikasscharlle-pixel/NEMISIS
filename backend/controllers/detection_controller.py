from typing import Optional

from sqlalchemy.orm import Session

from schemas.detection import DetectionListResponse, DetectionItem, ImageDetectionResponse, VideoDetectionResponse
from services import detection_service


def detect_image(db: Session, file_bytes: bytes, filename: str) -> ImageDetectionResponse:
    return detection_service.run_image_detection(db, file_bytes, filename)


def detect_video(db: Session, file_bytes: bytes, filename: str, sample_every_n: int = 30) -> VideoDetectionResponse:
    return detection_service.run_video_detection(db, file_bytes, filename, sample_every_n)


def get_detections(
    db: Session,
    class_filter: Optional[str],
    source_type: Optional[str],
    skip: int,
    limit: int,
) -> DetectionListResponse:
    items, total = detection_service.list_detections(db, class_filter, source_type, skip, limit)
    return DetectionListResponse(
        items=[DetectionItem.model_validate(i) for i in items],
        total=total,
    )
