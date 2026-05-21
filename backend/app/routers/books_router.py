from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, auth
from ..services.book_service import BookService

router = APIRouter(prefix="/api/books", tags=["books"])

@router.get("/", response_model=List[schemas.Book])
def read_books(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return BookService.get_all_books(db, current_user)
