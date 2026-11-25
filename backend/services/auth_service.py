from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.security import create_access_token, create_refresh_token, hash_password, verify_password
from models.user import User, UserRole
from schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserSummary


def authenticate_user(db: Session, payload: LoginRequest) -> TokenResponse:
    """Authenticate user credentials and issue JWT access + refresh tokens."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    access_token = create_access_token(subject=str(user.id), role=user.role, extra={"email": user.email})
    refresh_token = create_refresh_token(subject=str(user.id), role=user.role)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserSummary.model_validate(user),
    )


def register_user(db: Session, payload: RegisterRequest) -> TokenResponse:
    """Register a new user (self-registered users default to Viewer role) and issue tokens."""
    normalized_email = payload.email.lower()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        name=payload.name.strip(),
        email=normalized_email,
        password_hash=hash_password(payload.password),
        role=UserRole.VIEWER.value,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=str(user.id), role=user.role, extra={"email": user.email})
    refresh_token = create_refresh_token(subject=str(user.id), role=user.role)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserSummary.model_validate(user),
    )
