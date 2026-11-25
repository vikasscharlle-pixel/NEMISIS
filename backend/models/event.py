from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base

if TYPE_CHECKING:
    from models.evidence import Evidence
    from models.video import Video


class EventStatus(str, Enum):
    USUAL = "USUAL"
    NEED_TO_INVESTIGATE = "NEED_TO_INVESTIGATE"
    WAITING = "WAITING"
    TRASH = "TRASH"
    CLEANING = "CLEANING"
    CLEARED = "CLEARED"


class Event(Base):
    """Surveillance incident record tracked across the investigation lifecycle."""

    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    status: Mapped[str] = mapped_column(
        String(40),
        default=EventStatus.NEED_TO_INVESTIGATE.value,
        index=True,
        nullable=False,
    )
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    anomaly_score: Mapped[float] = mapped_column(Float, nullable=False)
    video_id: Mapped[Optional[int]] = mapped_column(ForeignKey("videos.id", ondelete="SET NULL"), nullable=True)
    camera_location: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
        nullable=False,
    )

    video: Mapped[Optional["Video"]] = relationship("Video", back_populates="events")
    evidence_items: Mapped[List["Evidence"]] = relationship(
        "Evidence",
        back_populates="event",
        cascade="all, delete-orphan",
    )
