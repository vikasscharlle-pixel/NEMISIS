from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from controllers import user_controller
from database.session import get_db
from middleware.auth_middleware import require_roles
from models.user import User, UserRole
from schemas.user import UserCreate, UserListResponse, UserRead

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=UserListResponse, summary="List platform users (Admin only)")
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles([UserRole.ADMIN])),
) -> UserListResponse:
    return user_controller.list_users(db, skip=skip, limit=limit)


@router.post(
    "",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user with RBAC role (Admin only)",
)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles([UserRole.ADMIN])),
) -> UserRead:
    return user_controller.create_user(db, payload)
