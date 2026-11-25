from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.security import hash_password
from models.user import User
from schemas.user import UserCreate, UserListResponse, UserRead


def list_users(db: Session, skip: int = 0, limit: int = 50) -> UserListResponse:
    """Return paginated users ordered by creation ID."""
    query = db.query(User)
    total = query.count()
    items = query.order_by(User.id.asc()).offset(skip).limit(limit).all()
    return UserListResponse(items=[UserRead.model_validate(u) for u in items], total=total)


def create_user(db: Session, payload: UserCreate) -> UserRead:
    """Create a user with a specified RBAC role (Admin action)."""
    normalized_email = payload.email.lower()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    user = User(
        name=payload.name.strip(),
        email=normalized_email,
        password_hash=hash_password(payload.password),
        role=payload.role.value,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserRead.model_validate(user)
