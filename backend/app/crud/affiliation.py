"""
CRUD operations for Affiliations (customer relationships)
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import logging

from app.models import Affiliation, Customer, CustomerStatus
from app.schemas import AffiliationCreate, AffiliationUpdate

logger = logging.getLogger(__name__)


class AffiliationCRUD:
    """Affiliation CRUD operations"""
    
    @staticmethod
    def create(
        db: Session,
        affiliation_data: AffiliationCreate,
        user: str = "SYSTEM"
    ) -> Affiliation:
        """
        Create a new affiliation between two customers.
        
        Args:
            db: Database session
            affiliation_data: Affiliation creation data
            user: User performing the action
            
        Returns:
            Created affiliation object
        """
        # Verify both customers exist and are active
        parent = db.query(Customer).filter(
            Customer.customer_id == affiliation_data.parent_customer_id
        ).first()
        
        affiliate = db.query(Customer).filter(
            Customer.customer_id == affiliation_data.affiliate_customer_id
        ).first()
        
        if not parent:
            raise ValueError(f"Parent customer with ID {affiliation_data.parent_customer_id} not found")
        if not affiliate:
            raise ValueError(f"Affiliate customer with ID {affiliation_data.affiliate_customer_id} not found")
        
        # Check if customers are active
        if parent.status != CustomerStatus.ACTIVE.value:
            raise ValueError(f"Parent customer {parent.customer_name} is not active")
        if affiliate.status != CustomerStatus.ACTIVE.value:
            raise ValueError(f"Affiliate customer {affiliate.customer_name} is not active")
        
        # Check for self-affiliation
        if affiliation_data.parent_customer_id == affiliation_data.affiliate_customer_id:
            raise ValueError("Cannot create affiliation with the same customer")
        
        # Check for existing affiliation
        existing = db.query(Affiliation).filter(
            Affiliation.parent_customer_id == affiliation_data.parent_customer_id,
            Affiliation.affiliate_customer_id == affiliation_data.affiliate_customer_id
        ).first()
        
        if existing:
            raise ValueError(f"Affiliation already exists between {parent.customer_name} and {affiliate.customer_name}")
        
        # Create affiliation
        db_affiliation = Affiliation(
            parent_customer_id=affiliation_data.parent_customer_id,
            affiliate_customer_id=affiliation_data.affiliate_customer_id,
            relationship_type=affiliation_data.relationship_type.value,
            notes=affiliation_data.notes,
            created_by=user,
            status="ACTIVE"
        )
        
        db.add(db_affiliation)
        db.commit()
        db.refresh(db_affiliation)
        
        logger.info(f"Affiliation created: {parent.customer_name} -> {affiliate.customer_name} ({affiliation_data.relationship_type.value}) by {user}")
        return db_affiliation
    
    @staticmethod
    def get(db: Session, affiliation_id: UUID) -> Optional[Affiliation]:
        """Get affiliation by ID"""
        return db.query(Affiliation).filter(Affiliation.affiliation_id == affiliation_id).first()
    
    @staticmethod
    def get_by_customer(
        db: Session,
        customer_id: UUID,
        as_parent: bool = True,
        include_inactive: bool = False
    ) -> List[Affiliation]:
        """
        Get all affiliations for a customer.
        
        Args:
            db: Database session
            customer_id: Customer ID
            as_parent: If True, get where customer is parent; else get where customer is affiliate
            include_inactive: Include inactive affiliations
        """
        query = db.query(Affiliation)
        
        if as_parent:
            query = query.filter(Affiliation.parent_customer_id == customer_id)
        else:
            query = query.filter(Affiliation.affiliate_customer_id == customer_id)
        
        if not include_inactive:
            query = query.filter(Affiliation.status == "ACTIVE")
        
        return query.all()
    
    @staticmethod
    def get_all_with_details(
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[dict]:
        """
        Get all affiliations with customer names.
        """
        results = db.query(
            Affiliation,
            Customer.customer_name.label('parent_name'),
            Customer.customer_name.label('affiliate_name')
        ).join(
            Customer, Affiliation.parent_customer_id == Customer.customer_id
        ).offset(skip).limit(limit).all()
        
        return results
    
    @staticmethod
    def update(
        db: Session,
        affiliation_id: UUID,
        update_data: AffiliationUpdate,
        user: str = "SYSTEM"
    ) -> Affiliation:
        """
        Update affiliation details.
        """
        affiliation = AffiliationCRUD.get(db, affiliation_id)
        if not affiliation:
            raise ValueError(f"Affiliation with ID {affiliation_id} not found")
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            if field == 'relationship_type' and value:
                setattr(affiliation, field, value.value)
            else:
                setattr(affiliation, field, value)
        
        db.commit()
        db.refresh(affiliation)
        
        logger.info(f"Affiliation {affiliation_id} updated by {user}")
        return affiliation
    
    @staticmethod
    def delete(db: Session, affiliation_id: UUID, user: str = "SYSTEM") -> bool:
        """
        Hard delete an affiliation.
        """
        affiliation = AffiliationCRUD.get(db, affiliation_id)
        if not affiliation:
            raise ValueError(f"Affiliation with ID {affiliation_id} not found")
        
        db.delete(affiliation)
        db.commit()
        
        logger.warning(f"Affiliation {affiliation_id} deleted by {user}")
        return True
    
    @staticmethod
    def soft_delete(db: Session, affiliation_id: UUID, user: str = "SYSTEM") -> Affiliation:
        """
        Soft delete an affiliation (set status to INACTIVE).
        """
        affiliation = AffiliationCRUD.get(db, affiliation_id)
        if not affiliation:
            raise ValueError(f"Affiliation with ID {affiliation_id} not found")
        
        affiliation.status = "INACTIVE"
        db.commit()
        db.refresh(affiliation)
        
        logger.warning(f"Affiliation {affiliation_id} soft deleted by {user}")
        return affiliation


# Convenience functions
def create_affiliation(db: Session, affiliation_data: AffiliationCreate, user: str = "SYSTEM") -> Affiliation:
    return AffiliationCRUD.create(db, affiliation_data, user)

def get_customer_affiliations(db: Session, customer_id: UUID) -> dict:
    """Get both parent and affiliate relationships for a customer"""
    return {
        "as_parent": AffiliationCRUD.get_by_customer(db, customer_id, as_parent=True),
        "as_affiliate": AffiliationCRUD.get_by_customer(db, customer_id, as_parent=False)
    }

def update_affiliation(db: Session, affiliation_id: UUID, update_data: AffiliationUpdate, user: str = "SYSTEM") -> Affiliation:
    return AffiliationCRUD.update(db, affiliation_id, update_data, user)

def delete_affiliation(db: Session, affiliation_id: UUID, user: str = "SYSTEM") -> bool:
    return AffiliationCRUD.delete(db, affiliation_id, user)