import os
import bcrypt
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import database, models, schemas
from .core.config import settings
from .core.exceptions import InvalidCredentialsError, UnauthorizedError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise InvalidCredentialsError()
    except JWTError:
        raise InvalidCredentialsError()
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise InvalidCredentialsError()
    return user

def get_current_author(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "author":
        raise UnauthorizedError()
    return current_user

def get_current_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise UnauthorizedError()
    return current_user
