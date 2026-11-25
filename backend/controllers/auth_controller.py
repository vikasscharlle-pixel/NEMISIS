from sqlalchemy.orm import Session

from models.user import User
from schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserSummary
from services import auth_service


def login(db: Session, payload: LoginRequest) -> TokenResponse:
    return auth_service.authenticate_user(db, payload)


def register(db: Session, payload: RegisterRequest) -> TokenResponse:
    return auth_service.register_user(db, payload)


def get_profile(current_user: User) -> UserSummary:
    return UserSummary.model_validate(current_user)
