from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[str] = None

class User(BaseModel):
    id: str
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

class Book(BaseModel):
    book_id: str
    author_id: str
    title: str
    isbn: str
    genre: str
    publication_date: Optional[datetime] = None
    status: str
    mrp: Optional[float] = None
    author_royalty_per_copy: Optional[float] = None
    total_copies_sold: int
    total_royalty_earned: float
    royalty_paid: float
    royalty_pending: float
    last_royalty_payout_date: Optional[datetime] = None
    print_partner: Optional[str] = None
    available_on: Optional[str] = None

    class Config:
        from_attributes = True

class TicketCreate(BaseModel):
    book_id: Optional[str] = None
    subject: str
    description: str
    attachment_url: Optional[str] = None

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    internal_notes: Optional[str] = None
    ai_draft_response: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    attachment_url: Optional[str] = None
    assigned_to: Optional[str] = None

class TicketMessageCreate(BaseModel):
    message: str

class TicketMessage(BaseModel):
    id: int
    ticket_id: int
    sender_id: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

class Ticket(BaseModel):
    id: int
    author_id: str
    book_id: Optional[str] = None
    subject: str
    description: str
    status: str
    category: Optional[str] = None
    priority: Optional[str] = None
    ai_draft_response: Optional[str] = None
    attachment_url: Optional[str] = None
    internal_notes: Optional[str] = None
    assigned_to: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    messages: List[TicketMessage] = []

    class Config:
        from_attributes = True

# Author-safe version: hides internal_notes and ai_draft_response
class AuthorTicket(BaseModel):
    id: int
    author_id: str
    book_id: Optional[str] = None
    subject: str
    description: str
    status: str
    category: Optional[str] = None
    priority: Optional[str] = None
    attachment_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    messages: List[TicketMessage] = []

    class Config:
        from_attributes = True

class TicketDetail(Ticket):
    author: Optional[User] = None
    book: Optional[Book] = None
