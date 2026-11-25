from typing import Optional
from sqlalchemy.orm import Session

from models.event import EventStatus
from schemas.event import EventDetailRead, EventListResponse, EventRead
from services import event_service


def list_events(
    db: Session,
    status: Optional[str] = None,
    event_type: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> EventListResponse:
    return event_service.list_events(
        db,
        status_filter=status,
        event_type=event_type,
        search=search,
        skip=skip,
        limit=limit,
    )


def get_event(db: Session, event_id: int) -> EventDetailRead:
    return event_service.get_event_by_id(db, event_id)


def update_status(db: Session, event_id: int, status: EventStatus) -> EventRead:
    return event_service.update_event_status(db, event_id, status)
