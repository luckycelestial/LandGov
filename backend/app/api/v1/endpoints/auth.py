from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Optional, List

from app.core.security import verify_password, create_access_token, hash_password
from app.domain.models.land_gov import User
from app.infrastructure.db.sqlite_client import get_session

router = APIRouter(prefix="/auth", tags=["Authentication & Roles"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RoleSwitchRequest(BaseModel):
    target_role: str


class UserResponse(BaseModel):
    id: int
    email: str
    display_name: str
    role: str
    department: Optional[str]
    state_id: Optional[str]
    district_id: Optional[str]


@router.post("/login")
def login(creds: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == creds.email)).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token({"sub": user.email, "role": user.role, "name": user.display_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
            "department": user.department,
            "state_id": user.state_id,
            "district_id": user.district_id,
        }
    }


@router.get("/users", response_model=List[UserResponse])
def list_demo_users(session: Session = Depends(get_session)):
    """Returns list of pre-configured role personas for 1-click switching."""
    users = session.exec(select(User)).all()
    return users


@router.post("/quick-switch")
def quick_role_switch(req: RoleSwitchRequest, session: Session = Depends(get_session)):
    """Allows 1-click persona switching without re-entering passwords in demo mode."""
    user = session.exec(select(User).where(User.role == req.target_role)).first()
    if not user:
        # Fallback to first user
        user = session.exec(select(User)).first()
    token = create_access_token({"sub": user.email, "role": user.role, "name": user.display_name})
    return {
        "access_token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
            "department": user.department,
            "state_id": user.state_id,
            "district_id": user.district_id,
        }
    }
