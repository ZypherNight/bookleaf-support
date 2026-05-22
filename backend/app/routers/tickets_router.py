from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, auth
from ..services.ticket_service import TicketService

router = APIRouter(prefix="/api/tickets", tags=["tickets"])

def process_ticket_ai_task(ticket_id: int, subject: str, description: str, book_details: dict):
    db = next(database.get_db())
    try:
        TicketService.process_ticket_ai(db, ticket_id, subject, description, book_details)
    finally:
        db.close()

@router.post("/{ticket_id}/draft")
def generate_draft(ticket_id: int, current_user: models.User = Depends(auth.get_current_admin), db: Session = Depends(database.get_db)):
    draft = TicketService.generate_draft(db, ticket_id)
    return {"draft_response": draft}

@router.get("/")
def read_tickets(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return TicketService.get_all_tickets(db, current_user)

@router.post("/", response_model=schemas.Ticket)
def create_ticket(ticket_in: schemas.TicketCreate, background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_author), db: Session = Depends(database.get_db)):
    new_ticket = TicketService.create_ticket(db, ticket_in, current_user)
    book_details = TicketService.get_book_details_for_ai(db, ticket_in.book_id)
    background_tasks.add_task(process_ticket_ai_task, new_ticket.id, new_ticket.subject, new_ticket.description, book_details)
    return new_ticket

@router.get("/{ticket_id}")
def get_ticket(ticket_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return TicketService.get_ticket(db, ticket_id, current_user)

@router.put("/{ticket_id}", response_model=schemas.Ticket)
def update_ticket(ticket_id: int, ticket_in: schemas.TicketUpdate, current_user: models.User = Depends(auth.get_current_admin), db: Session = Depends(database.get_db)):
    return TicketService.update_ticket(db, ticket_id, ticket_in, current_user)

@router.post("/{ticket_id}/messages", response_model=schemas.TicketMessage)
def add_message(ticket_id: int, msg_in: schemas.TicketMessageCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return TicketService.add_message(db, ticket_id, msg_in, current_user)
