from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models import Affiliation, Customer

router = APIRouter(prefix="/affiliations", tags=["Affiliations"])


@router.get("/", response_model=dict)
def get_affiliations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all affiliations"""
    try:
        affiliations = db.query(Affiliation).offset(skip).limit(limit).all()
        total = db.query(Affiliation).count()
        
        items = []
        for aff in affiliations:
            parent = db.query(Customer).filter(Customer.customer_id == aff.parent_customer_id).first()
            affiliate = db.query(Customer).filter(Customer.customer_id == aff.affiliate_customer_id).first()
            
            items.append({
                "affiliation_id": str(aff.affiliation_id),
                "parent_customer_id": str(aff.parent_customer_id),
                "parent_customer_name": parent.customer_name if parent else None,
                "affiliate_customer_id": str(aff.affiliate_customer_id),
                "affiliate_customer_name": affiliate.customer_name if affiliate else None,
                "relationship_type": aff.relationship_type,
                "notes": aff.notes,
                "status": aff.status,
                "created_by": aff.created_by,
                "created_at": aff.created_at.isoformat() if aff.created_at else None,
                "updated_at": aff.updated_at.isoformat() if aff.updated_at else None
            })
        
        return {
            "items": items,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict, status_code=201)
def create_affiliation(
    affiliation_data: dict,
    db: Session = Depends(get_db)
):
    """Create a new affiliation"""
    try:
        parent = db.query(Customer).filter(Customer.customer_id == affiliation_data.get("parent_customer_id")).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent customer not found")
        
        affiliate = db.query(Customer).filter(Customer.customer_id == affiliation_data.get("affiliate_customer_id")).first()
        if not affiliate:
            raise HTTPException(status_code=404, detail="Affiliate customer not found")
        
        existing = db.query(Affiliation).filter(
            Affiliation.parent_customer_id == affiliation_data["parent_customer_id"],
            Affiliation.affiliate_customer_id == affiliation_data["affiliate_customer_id"]
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Affiliation already exists")
        
        new_affiliation = Affiliation(
            parent_customer_id=affiliation_data["parent_customer_id"],
            affiliate_customer_id=affiliation_data["affiliate_customer_id"],
            relationship_type=affiliation_data.get("relationship_type", "AFFILIATE"),
            notes=affiliation_data.get("notes"),
            created_by=affiliation_data.get("created_by", "SYSTEM"),
            status="ACTIVE"
        )
        
        db.add(new_affiliation)
        db.commit()
        db.refresh(new_affiliation)
        
        return {
            "affiliation_id": str(new_affiliation.affiliation_id),
            "message": "Affiliation created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{affiliation_id}", response_model=dict)
def delete_affiliation(
    affiliation_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete affiliation"""
    affiliation = db.query(Affiliation).filter(Affiliation.affiliation_id == affiliation_id).first()
    if not affiliation:
        raise HTTPException(status_code=404, detail="Affiliation not found")
    
    try:
        db.delete(affiliation)
        db.commit()
        
        return {
            "affiliation_id": str(affiliation_id),
            "message": "Affiliation deleted successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
