from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # author_id or admin_id
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="author") # 'author' or 'admin'
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    joined_date = Column(DateTime, nullable=True)

    books = relationship("Book", back_populates="author")
    tickets = relationship("Ticket", back_populates="author", foreign_keys="[Ticket.author_id]")

class Book(Base):
    __tablename__ = "books"

    book_id = Column(String, primary_key=True, index=True)
    author_id = Column(String, ForeignKey("users.id"))
    title = Column(String, index=True)
    isbn = Column(String, index=True)
    genre = Column(String)
    publication_date = Column(DateTime, nullable=True)
    status = Column(String)
    mrp = Column(Float, nullable=True)
    author_royalty_per_copy = Column(Float, nullable=True)
    total_copies_sold = Column(Integer, default=0)
    total_royalty_earned = Column(Float, default=0)
    royalty_paid = Column(Float, default=0)
    royalty_pending = Column(Float, default=0)
    last_royalty_payout_date = Column(DateTime, nullable=True)
    print_partner = Column(String, nullable=True)
    available_on = Column(String, nullable=True) # comma separated

    author = relationship("User", back_populates="books")
    tickets = relationship("Ticket", back_populates="book")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(String, ForeignKey("users.id"))
    book_id = Column(String, ForeignKey("books.book_id"), nullable=True)
    subject = Column(String)
    description = Column(String)
    status = Column(String, default="Open") # Open, In Progress, Resolved, Closed
    
    # AI fields
    category = Column(String, nullable=True)
    priority = Column(String, nullable=True) # Critical, High, Medium, Low
    ai_draft_response = Column(String, nullable=True)
    attachment_url = Column(String, nullable=True)
    
    internal_notes = Column(String, nullable=True)
    assigned_to = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    author = relationship("User", back_populates="tickets", foreign_keys=[author_id])
    book = relationship("Book", back_populates="tickets")
    messages = relationship("TicketMessage", back_populates="ticket")

class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    sender_id = Column(String, ForeignKey("users.id"))
    message = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    ticket = relationship("Ticket", back_populates="messages")
    sender = relationship("User")
