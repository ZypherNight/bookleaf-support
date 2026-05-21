from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
from sqlalchemy.orm import Session
from datetime import timedelta
from .. import database, models, schemas, auth
from ..core.config import settings
from ..core.exceptions import InvalidCredentialsError, UnauthorizedError

router = APIRouter(prefix="/api", tags=["auth"])

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise InvalidCredentialsError("Incorrect email or password")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.get("/users/admins", response_model=List[schemas.User])
def read_admins(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role != 'admin':
        raise UnauthorizedError()
    admins = db.query(models.User).filter(models.User.role == 'admin').all()
    return admins
