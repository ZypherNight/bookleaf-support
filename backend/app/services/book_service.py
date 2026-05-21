from sqlalchemy.orm import Session
from .. import models, schemas

class BookService:
    @staticmethod
    def get_all_books(db: Session, current_user: models.User):
        if current_user.role == "admin":
            return db.query(models.Book).all()
        else:
            return db.query(models.Book).filter(models.Book.author_id == current_user.id).all()
