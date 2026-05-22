from sqlalchemy.orm import Session
from .. import models, schemas, ai_service
from ..core.exceptions import NotFoundError, UnauthorizedError

class TicketService:
    @staticmethod
    def process_ticket_ai(db: Session, ticket_id: int, subject: str, description: str, book_details: dict):
        ai_result = ai_service.classify_ticket(subject, description, book_details)
        ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
        if ticket:
            ticket.category = ai_result.get("category", "Uncategorized")
            ticket.priority = ai_result.get("priority", "Normal")
            db.commit()

    @staticmethod
    def generate_draft(db: Session, ticket_id: int):
        ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
        if not ticket:
            raise NotFoundError("Ticket not found")
            
        book_details = None
        if ticket.book_id:
            book = db.query(models.Book).filter(models.Book.book_id == ticket.book_id).first()
            if book:
                book_details = {
                    "title": book.title,
                    "status": book.status,
                    "publication_date": book.publication_date,
                    "total_copies_sold": book.total_copies_sold,
                    "royalty_pending": book.royalty_pending,
                    "last_royalty_payout_date": book.last_royalty_payout_date,
                    "available_on": book.available_on
                }
                
        draft = ai_service.draft_ticket_response(ticket.subject, ticket.description, book_details)
        ticket.ai_draft_response = draft
        db.commit()
        return draft

    @staticmethod
    def get_all_tickets(db: Session, current_user: models.User):
        if current_user.role == "admin":
            tickets = db.query(models.Ticket).order_by(models.Ticket.created_at.desc()).all()
            return [schemas.TicketDetail.model_validate(t) for t in tickets]
        else:
            tickets = db.query(models.Ticket).filter(models.Ticket.author_id == current_user.id).order_by(models.Ticket.created_at.desc()).all()
            return [schemas.AuthorTicket.model_validate(t) for t in tickets]

    @staticmethod
    def get_ticket(db: Session, ticket_id: int, current_user: models.User):
        ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
        if not ticket:
            raise NotFoundError("Ticket not found")
        if current_user.role != "admin" and ticket.author_id != current_user.id:
            raise UnauthorizedError()
            
        if current_user.role == "admin":
            return schemas.TicketDetail.model_validate(ticket)
        else:
            return schemas.AuthorTicket.model_validate(ticket)

    @staticmethod
    def create_ticket(db: Session, ticket_in: schemas.TicketCreate, current_user: models.User):
        new_ticket = models.Ticket(
            author_id=current_user.id,
            book_id=ticket_in.book_id,
            subject=ticket_in.subject,
            description=ticket_in.description,
            attachment_url=ticket_in.attachment_url
        )
        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)
        return new_ticket
        
    @staticmethod
    def get_book_details_for_ai(db: Session, book_id: int):
        book_details = None
        if book_id:
            book = db.query(models.Book).filter(models.Book.book_id == book_id).first()
            if book:
                book_details = {
                    "title": book.title,
                    "status": book.status,
                    "publication_date": book.publication_date,
                    "total_copies_sold": book.total_copies_sold,
                    "royalty_pending": book.royalty_pending,
                    "last_royalty_payout_date": book.last_royalty_payout_date,
                    "available_on": book.available_on
                }
        return book_details

    @staticmethod
    def update_ticket(db: Session, ticket_id: int, ticket_in: schemas.TicketUpdate, current_user: models.User):
        ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
        if not ticket:
            raise NotFoundError("Ticket not found")
        
        if ticket_in.status:
            ticket.status = ticket_in.status
        if ticket_in.internal_notes is not None:
            ticket.internal_notes = ticket_in.internal_notes
        if ticket_in.ai_draft_response is not None:
            ticket.ai_draft_response = ticket_in.ai_draft_response
        if ticket_in.category is not None:
            ticket.category = ticket_in.category
        if ticket_in.priority is not None:
            ticket.priority = ticket_in.priority
        if ticket_in.assigned_to is not None:
            ticket.assigned_to = ticket_in.assigned_to
            
        db.commit()
        db.refresh(ticket)
        return ticket

    @staticmethod
    def add_message(db: Session, ticket_id: int, msg_in: schemas.TicketMessageCreate, current_user: models.User):
        ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
        if not ticket:
            raise NotFoundError("Ticket not found")
        if current_user.role != "admin" and ticket.author_id != current_user.id:
            raise UnauthorizedError()
            
        new_msg = models.TicketMessage(
            ticket_id=ticket.id,
            sender_id=current_user.id,
            message=msg_in.message
        )
        db.add(new_msg)
        
        if current_user.role == "author" and ticket.status == "Resolved":
             ticket.status = "Open"
             
        db.commit()
        db.refresh(new_msg)
        return new_msg
