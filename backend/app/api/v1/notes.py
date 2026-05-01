from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models import CustomerNote, Customer

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.get("/customer/{customer_id}", response_model=dict)
def get_customer_notes(
    customer_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all notes for a customer"""
    notes = db.query(CustomerNote).filter(
        CustomerNote.customer_id == customer_id
    ).order_by(CustomerNote.created_at.desc()).offset(skip).limit(limit).all()
    
    total = db.query(CustomerNote).filter(CustomerNote.customer_id == customer_id).count()
    
    items = []
    for note in notes:
        items.append({
            "note_id": str(note.note_id),
            "customer_id": str(note.customer_id),
            "note_text": note.note_text,
            "note_type": note.note_type,
            "created_by": note.created_by,
            "created_at": note.created_at.isoformat() if note.created_at else None,
            "is_edited": note.is_edited,
            "edited_at": note.edited_at.isoformat() if note.edited_at else None,
            "edited_by": note.edited_by
        })
    
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("/customer/{customer_id}", response_model=dict, status_code=201)
def create_note(
    customer_id: UUID,
    note_data: dict,
    db: Session = Depends(get_db)
):
    """Create a new note for a customer"""
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    try:
        new_note = CustomerNote(
            customer_id=customer_id,
            note_text=note_data.get("note_text"),
            note_type=note_data.get("note_type", "GENERAL"),
            created_by=note_data.get("created_by", "SYSTEM")
        )
        
        db.add(new_note)
        db.commit()
        db.refresh(new_note)
        
        return {
            "note_id": str(new_note.note_id),
            "message": "Note created successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
