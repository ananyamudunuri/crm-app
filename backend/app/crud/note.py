"""
CRUD operations for Customer Notes
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import logging

from app.models import CustomerNote, Customer
from app.schemas import NoteCreate, NoteUpdate

logger = logging.getLogger(__name__)


class NoteCRUD:
    """Note CRUD operations"""
    
    @staticmethod
    def create(
        db: Session,
        customer_id: UUID,
        note_data: NoteCreate,
        user: str = "SYSTEM"
    ) -> CustomerNote:
        """
        Create a new note for a customer.
        
        Args:
            db: Database session
            customer_id: Customer ID
            note_data: Note creation data
            user: User creating the note
            
        Returns:
            Created note object
        """
        # Verify customer exists
        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if not customer:
            raise ValueError(f"Customer with ID {customer_id} not found")
        
        # Create note
        db_note = CustomerNote(
            customer_id=customer_id,
            note_text=note_data.note_text,
            note_type=note_data.note_type.value,
            created_by=user
        )
        
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        
        logger.info(f"Note created for customer {customer.customer_name} by {user}")
        return db_note
    
    @staticmethod
    def get(db: Session, note_id: UUID) -> Optional[CustomerNote]:
        """Get note by ID"""
        return db.query(CustomerNote).filter(CustomerNote.note_id == note_id).first()
    
    @staticmethod
    def get_customer_notes(
        db: Session,
        customer_id: UUID,
        skip: int = 0,
        limit: int = 100,
        note_type: Optional[str] = None
    ) -> List[CustomerNote]:
        """
        Get all notes for a customer.
        
        Args:
            db: Database session
            customer_id: Customer ID
            skip: Number of records to skip
            limit: Maximum records to return
            note_type: Filter by note type
            
        Returns:
            List of notes in reverse chronological order
        """
        query = db.query(CustomerNote).filter(CustomerNote.customer_id == customer_id)
        
        if note_type:
            query = query.filter(CustomerNote.note_type == note_type)
        
        # Order by created_at descending (newest first)
        query = query.order_by(CustomerNote.created_at.desc())
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def update(
        db: Session,
        note_id: UUID,
        update_data: NoteUpdate,
        user: str = "SYSTEM"
    ) -> CustomerNote:
        """
        Update a note (only note_type can be updated, text is immutable).
        
        Args:
            db: Database session
            note_id: Note ID
            update_data: Update data
            user: User performing the update
            
        Returns:
            Updated note
        """
        note = NoteCRUD.get(db, note_id)
        if not note:
            raise ValueError(f"Note with ID {note_id} not found")
        
        # Only note_type can be updated (text is immutable for audit trail)
        if update_data.note_type:
            note.note_type = update_data.note_type.value
            note.is_edited = True
            note.edited_at = datetime.now()
            note.edited_by = user
        
        db.commit()
        db.refresh(note)
        
        logger.info(f"Note {note_id} updated by {user}")
        return note
    
    @staticmethod
    def delete(db: Session, note_id: UUID, user: str = "SYSTEM") -> bool:
        """
        Delete a note (hard delete - use with caution).
        
        For audit purposes, consider soft delete instead.
        """
        note = NoteCRUD.get(db, note_id)
        if not note:
            raise ValueError(f"Note with ID {note_id} not found")
        
        db.delete(note)
        db.commit()
        
        logger.warning(f"Note {note_id} deleted by {user}")
        return True


# Convenience functions
def create_note(db: Session, customer_id: UUID, note_data: NoteCreate, user: str = "SYSTEM") -> CustomerNote:
    return NoteCRUD.create(db, customer_id, note_data, user)

def get_customer_notes(db: Session, customer_id: UUID, **kwargs) -> List[CustomerNote]:
    return NoteCRUD.get_customer_notes(db, customer_id, **kwargs)

def update_note(db: Session, note_id: UUID, update_data: NoteUpdate, user: str = "SYSTEM") -> CustomerNote:
    return NoteCRUD.update(db, note_id, update_data, user)

def delete_note(db: Session, note_id: UUID, user: str = "SYSTEM") -> bool:
    return NoteCRUD.delete(db, note_id, user)