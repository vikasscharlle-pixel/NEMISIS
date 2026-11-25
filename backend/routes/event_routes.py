from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from controllers import event_controller
from database.session import get_db
from middleware.auth_middleware import get_current_user, require_roles
from models.user import User, UserRole
from schemas.event import EventDetailRead, EventListResponse, EventRead, EventStatusUpdate

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=EventListResponse, summary="List surveillance events with filters")
def list_events(
    status: Optional[str] = Query(None, description="Filter by status (e.g. NEED_TO_INVESTIGATE, WAITING, CLEANING, CLEARED)"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    search: Optional[str] = Query(None, description="Search by type, camera location, or description"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> EventListResponse:
    return event_controller.list_events(
        db,
        status=status,
        event_type=event_type,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.get("/{event_id}", response_model=EventDetailRead, summary="Get event details and linked evidence")
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> EventDetailRead:
    return event_controller.get_event(db, event_id)


@router.patch(
    "/{event_id}/status",
    response_model=EventRead,
    summary="Update event lifecycle status (Admin & Operator)",
)
def update_event_status(
    event_id: int,
    payload: EventStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles([UserRole.ADMIN, UserRole.OPERATOR])),
) -> EventRead:
    return event_controller.update_status(db, event_id, payload.status)
