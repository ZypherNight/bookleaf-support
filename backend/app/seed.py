import json
import os
import sys
import bcrypt
from datetime import datetime

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import engine, Base, SessionLocal
from app import models

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_db():
    print("Creating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Create Admin
    print("Creating admin...")
    admin = models.User(
        id="ADMIN001",
        name="System Admin",
        email="admin@bookleaf.com",
        hashed_password=get_password_hash("admin123"),
        role="admin"
    )
    db.add(admin)

    # Load JSON
    print("Loading authors and books...")
    json_path = os.path.join(os.path.dirname(__file__), "../../bookleaf_sample_data.json")
    with open(json_path, "r") as f:
        data = json.load(f)

    for author_data in data.get("authors", []):
        joined_date_str = author_data.get("joined_date")
        joined_date = datetime.strptime(joined_date_str, "%Y-%m-%d") if joined_date_str else None
        
        user = models.User(
            id=author_data["author_id"],
            name=author_data["name"],
            email=author_data["email"],
            hashed_password=get_password_hash("password123"),
            role="author",
            phone=author_data.get("phone"),
            city=author_data.get("city"),
            joined_date=joined_date
        )
        db.add(user)

        for book_data in author_data.get("books", []):
            pub_date_str = book_data.get("publication_date")
            pub_date = datetime.strptime(pub_date_str, "%Y-%m-%d") if pub_date_str else None

            payout_date_str = book_data.get("last_royalty_payout_date")
            payout_date = datetime.strptime(payout_date_str, "%Y-%m-%d") if payout_date_str else None

            available_on_list = book_data.get("available_on", [])
            available_on_str = ",".join(available_on_list) if available_on_list else None

            book = models.Book(
                book_id=book_data["book_id"],
                author_id=user.id,
                title=book_data["title"],
                isbn=book_data["isbn"],
                genre=book_data["genre"],
                publication_date=pub_date,
                status=book_data["status"],
                mrp=book_data.get("mrp"),
                author_royalty_per_copy=book_data.get("author_royalty_per_copy"),
                total_copies_sold=book_data.get("total_copies_sold", 0),
                total_royalty_earned=book_data.get("total_royalty_earned", 0),
                royalty_paid=book_data.get("royalty_paid", 0),
                royalty_pending=book_data.get("royalty_pending", 0),
                last_royalty_payout_date=payout_date,
                print_partner=book_data.get("print_partner"),
                available_on=available_on_str
            )
            db.add(book)

    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()
