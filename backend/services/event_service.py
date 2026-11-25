from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from models.event import Event, EventStatus
from schemas.event import EventDetailRead, EventListResponse, EventRead


def list_events(
    db: Session,
    status_filter: Optional[str] = None,
    event_type: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> EventListResponse:
    """Return filtered and paginated surveillance events."""
    query = db.query(Event)

    if status_filter:
        query = query.filter(Event.status == status_filter)
    if event_type:
        query = query.filter(Event.type == event_type)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Event.type.ilike(pattern),
                Event.camera_location.ilike(pattern),
                Event.description.ilike(pattern),
            )
        )

    total = query.count()
    items = query.order_by(Event.created_at.desc(), Event.id.desc()).offset(skip).limit(limit).all()
    return EventListResponse(items=[EventRead.model_validate(e) for e in items], total=total)


def get_event_by_id(db: Session, event_id: int) -> EventDetailRead:
    """Retrieve a single event with nested evidence and video metadata."""
    event = (
        db.query(Event)
        .options(joinedload(Event.evidence_items), joinedload(Event.video))
        .filter(Event.id == event_id)
        .first()
    )
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event {event_id} not found.",
        )
    return EventDetailRead.model_validate(event)


def update_event_status(db: Session, event_id: int, new_status: EventStatus) -> EventRead:
    """Update the lifecycle status of an event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event {event_id} not found.",
        )
    event.status = new_status.value
    db.commit()
    db.refresh(event)
    return EventRead.model_validate(event)
