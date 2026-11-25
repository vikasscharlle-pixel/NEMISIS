from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from controllers import auth_controller
from database.session import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserSummary

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse, summary="Authenticate user and issue JWT tokens")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return auth_controller.login(db, payload)


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new viewer account",
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return auth_controller.register(db, payload)


@router.get("/me", response_model=UserSummary, summary="Get authenticated user profile")
def me(current_user: User = Depends(get_current_user)) -> UserSummary:
    return auth_controller.get_profile(current_user)
