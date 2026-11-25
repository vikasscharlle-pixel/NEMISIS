import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from controllers import detection_controller
from database.session import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.detection import DetectionListResponse, ImageDetectionResponse, VideoDetectionResponse

logger = logging.getLogger("nemesis.routes.detection")

router = APIRouter(prefix="/detect", tags=["Detection"])

# Max upload sizes
MAX_IMAGE_MB = 50
MAX_VIDEO_MB = 500

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/avi", "video/x-msvideo", "video/quicktime", "video/x-matroska"}


@router.post(
    "/image",
    response_model=ImageDetectionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload an image and run YOLOv11 object detection",
)
async def detect_image(
    file: UploadFile = File(..., description="JPEG / PNG / WebP image file"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> ImageDetectionResponse:
    """
    Upload an image → YOLOv11 inference → persist bounding boxes → return results.

    Returns all detected objects within Phase 2 scope:
    **person, bag, backpack, suitcase, car, motorcycle, bicycle, trash can**
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type '{file.content_type}'. Allowed: {ALLOWED_IMAGE_TYPES}",
        )

    file_bytes = await file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_IMAGE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image too large ({size_mb:.1f} MB). Maximum allowed: {MAX_IMAGE_MB} MB.",
        )

    logger.info("Image detection request: file=%s size=%.2f MB", file.filename, size_mb)
    return detection_controller.detect_image(db, file_bytes, file.filename or "upload.jpg")


@router.post(
    "/video",
    response_model=VideoDetectionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a video and run YOLOv11 on sampled frames",
)
async def detect_video(
    file: UploadFile = File(..., description="MP4 / AVI / MOV / MKV video file"),
    sample_every_n_frames: int = Query(30, ge=1, le=120, description="Process every N-th frame"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> VideoDetectionResponse:
    """
    Upload a video → sample frames → YOLOv11 inference → persist detections → return summary.
    """
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported video type '{file.content_type}'. Allowed: {ALLOWED_VIDEO_TYPES}",
        )

    file_bytes = await file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_VIDEO_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Video too large ({size_mb:.1f} MB). Maximum allowed: {MAX_VIDEO_MB} MB.",
        )

    logger.info("Video detection request: file=%s size=%.2f MB", file.filename, size_mb)
    return detection_controller.detect_video(db, file_bytes, file.filename or "upload.mp4", sample_every_n_frames)


@router.get(
    "/detections",
    response_model=DetectionListResponse,
    summary="List stored detection results with optional filters",
)
def list_detections(
    detection_class: Optional[str] = Query(None, description="Filter by class (e.g. 'person', 'bag')"),
    source_type: Optional[str] = Query(None, description="Filter by source: 'image' or 'video'"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> DetectionListResponse:
    """
    Returns paginated detection history from all Phase 2 image and video uploads.
    """
    return detection_controller.get_detections(db, detection_class, source_type, skip, limit)
