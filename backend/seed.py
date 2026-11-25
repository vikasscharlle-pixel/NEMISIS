"""Seed script for NEMESIS-X Phase 1.

Populates:
- 10 Users across Admin, Operator, and Viewer roles
- 5 Surveillance Video streams
- 50 Events distributed across all lifecycle statuses and realistic incident types
- Linked Evidence records for investigation workflows
"""
from datetime import datetime, timedelta, timezone
import random

from sqlalchemy.orm import Session

from core.security import hash_password
from database.base import Base
from database.session import SessionLocal, engine
from models.event import Event, EventStatus
from models.evidence import Evidence
from models.user import User, UserRole
from models.video import Video

SEED_USERS = [
    ("Elena Vance", "admin@nemesis-x.io", UserRole.ADMIN.value),
    ("Marcus Sterling", "marcus.admin@nemesis-x.io", UserRole.ADMIN.value),
    ("Aarav Patel", "operator@nemesis-x.io", UserRole.OPERATOR.value),
    ("Sophia Chen", "sophia.op@nemesis-x.io", UserRole.OPERATOR.value),
    ("Liam O'Connor", "liam.op@nemesis-x.io", UserRole.OPERATOR.value),
    ("Nadia Al-Mansoor", "nadia.op@nemesis-x.io", UserRole.OPERATOR.value),
    ("Daniel Kim", "viewer@nemesis-x.io", UserRole.VIEWER.value),
    ("Priya Nair", "priya.viewer@nemesis-x.io", UserRole.VIEWER.value),
    ("Lucas Meyer", "lucas.viewer@nemesis-x.io", UserRole.VIEWER.value),
    ("Hannah Brooks", "hannah.viewer@nemesis-x.io", UserRole.VIEWER.value),
]

EVENT_TYPES = [
    "Abandoned Object",
    "Potential Theft",
    "Dustbin Deposit",
    "Dustbin Retrieval",
    "Perimeter Loitering",
    "Unauthorized Zone Entry",
    "Suspicious Package",
    "Crowd Surge",
]

CAMERA_LOCATIONS = [
    "Gate A - North Concourse",
    "Gate B - Baggage Hall",
    "Platform 3 - East Terminal",
    "Main Atrium - Sector 2",
    "Parking Deck B2 - Exit",
    "Security Checkpoint 4",
]

STATUS_POOL = [
    EventStatus.NEED_TO_INVESTIGATE.value,
    EventStatus.NEED_TO_INVESTIGATE.value,
    EventStatus.WAITING.value,
    EventStatus.WAITING.value,
    EventStatus.CLEANING.value,
    EventStatus.TRASH.value,
    EventStatus.CLEARED.value,
    EventStatus.CLEARED.value,
    EventStatus.USUAL.value,
]


def seed_database(db: Session, ensure_tables: bool = False) -> dict[str, int]:
    """Idempotently populate Phase 1 mock users, videos, events, and evidence."""
    if ensure_tables:
        Base.metadata.create_all(bind=engine)

    created_users = 0
    created_events = 0

    if db.query(User).count() == 0:
        default_hash = hash_password("Nemesis@123")
        for idx, (name, email, role) in enumerate(SEED_USERS):
            db.add(
                User(
                    name=name,
                    email=email,
                    password_hash=default_hash,
                    role=role,
                    created_at=datetime.now(timezone.utc) - timedelta(days=15 - idx),
                )
            )
        db.flush()
        created_users = len(SEED_USERS)

    if db.query(Video).count() == 0:
        for i in range(1, 6):
            db.add(
                Video(
                    source=f"rtsp://cam-{i:02d}.nemesis-x.local/stream1",
                    duration=round(120.0 + i * 45.5, 1),
                    status="ACTIVE",
                )
            )
        db.flush()

    video_ids = [v.id for v in db.query(Video).all()]

    if db.query(Event).count() == 0:
        rng = random.Random(42)
        now = datetime.now(timezone.utc)
        for i in range(1, 51):
            ev_type = EVENT_TYPES[(i - 1) % len(EVENT_TYPES)]
            ev_status = STATUS_POOL[(i - 1) % len(STATUS_POOL)]
            location = CAMERA_LOCATIONS[(i - 1) % len(CAMERA_LOCATIONS)]
            confidence = round(rng.uniform(0.72, 0.99), 2)
            anomaly_score = (
                round(rng.uniform(0.70, 0.98), 2)
                if ev_status == EventStatus.NEED_TO_INVESTIGATE.value
                else round(rng.uniform(0.18, 0.74), 2)
            )
            created_at = now - timedelta(days=i % 7, hours=(i * 3) % 24, minutes=(i * 7) % 60)

            event = Event(
                type=ev_type,
                status=ev_status,
                confidence=confidence,
                anomaly_score=anomaly_score,
                video_id=video_ids[(i - 1) % len(video_ids)] if video_ids else None,
                camera_location=location,
                description=(
                    f"[Phase 1 Mock Event #{i:02d}] {ev_type} logged at {location}. "
                    f"Status: {ev_status}."
                ),
                created_at=created_at,
            )
            db.add(event)
            db.flush()

            db.add(
                Evidence(
                    event_id=event.id,
                    image_url=f"/evidence/event_{i:02d}_snapshot.jpg",
                    video_url=f"/uploads/clip_{i:02d}.mp4",
                    description=f"Captured keyframe and clip placeholder for {ev_type} at {location}.",
                )
            )
            created_events += 1

    db.commit()
    return {"users_created": created_users, "events_created": created_events}


if __name__ == "__main__":
    session = SessionLocal()
    try:
        result = seed_database(session, ensure_tables=False)
        print(f"Seed complete: {result}")
    finally:
        session.close()
