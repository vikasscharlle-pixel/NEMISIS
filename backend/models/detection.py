from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base

if TYPE_CHECKING:
    from models.video import Video


class Detection(Base):
    """
    Single object detection result produced by YOLO.

    Each row represents one detected object inside a source image or video frame.
    Multiple Detection rows are created per upload — one per bounding box.
    """

    __tablename__ = "detections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Source reference — either a saved upload path or an external URL
    source_type: Mapped[str] = mapped_column(String(16), nullable=False)   # "image" | "video"
    source_path: Mapped[str] = mapped_column(String(512), nullable=False)  # path to uploaded file

    # YOLO result fields
    detection_class: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)

    # Bounding box stored as JSON: {"x1": int, "y1": int, "x2": int, "y2": int}
    bounding_box: Mapped[dict] = mapped_column(JSON, nullable=False)

    # For video: which frame number this detection came from (None for images)
    frame_index: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Optional foreign key to the Videos table (populated when source is a video upload)
    video_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("videos.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Annotated image path saved on disk after bounding-box drawing
    annotated_image_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    # Freeform notes (e.g. which model was used, image dimensions)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
        nullable=False,
    )

    video: Mapped[Optional["Video"]] = relationship("Video")
