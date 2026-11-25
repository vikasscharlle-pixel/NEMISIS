from sqlalchemy.orm import Session

from schemas.user import UserCreate, UserListResponse, UserRead
from services import user_service


def list_users(db: Session, skip: int, limit: int) -> UserListResponse:
    return user_service.list_users(db, skip=skip, limit=limit)


def create_user(db: Session, payload: UserCreate) -> UserRead:
    return user_service.create_user(db, payload)
