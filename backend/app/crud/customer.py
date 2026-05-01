"""
CRUD operations for Customer management with soft delete and audit logging.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional, List, Tuple
from uuid import UUID
import logging

from app.models import Customer, CustomerStatus, Affiliation, CustomerNote
from app.schemas import CustomerCreate, CustomerUpdate

logger = logging.getLogger(__name__)


class CustomerCRUD:
    """Customer CRUD operations"""
    
    @staticmethod
    def create(db: Session, customer_data: CustomerCreate, user: str = "SYSTEM") -> Customer:
        """Create a new customer."""
        # Check if customer with same name exists
        existing = db.query(Customer).filter(
            Customer.customer_name == customer_data.customer_name
        ).first()
        
        if existing:
            raise ValueError(f"Customer with name '{customer_data.customer_name}' already exists")
        
        # Create new customer
        db_customer = Customer(
            **customer_data.model_dump(exclude_unset=True),
            created_by=user
        )
        
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        
        logger.info(f"Customer created: {db_customer.customer_name} (ID: {db_customer.customer_id}) by {user}")
        return db_customer
    
    @staticmethod
    def get(db: Session, customer_id: UUID) -> Optional[Customer]:
        """Get customer by ID (including soft-deleted)"""
        return db.query(Customer).filter(Customer.customer_id == customer_id).first()
    
    @staticmethod
    def get_active(db: Session, customer_id: UUID) -> Optional[Customer]:
        """Get active customer only"""
        return db.query(Customer).filter(
            Customer.customer_id == customer_id,
            Customer.status == CustomerStatus.ACTIVE.value
        ).first()
    
    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[Customer]:
        """Get customer by name"""
        return db.query(Customer).filter(
            func.lower(Customer.customer_name) == func.lower(name)
        ).first()
    
    @staticmethod
    def get_multi(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[str] = None,
        industry: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[Customer], int]:
        """Get list of customers with filtering and pagination."""
        query = db.query(Customer)
        
        # Apply filters
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Customer.customer_name.ilike(search_term),
                    Customer.industry.ilike(search_term),
                    Customer.location.ilike(search_term)
                )
            )
        
        if status:
            query = query.filter(Customer.status == status)
        
        if industry:
            query = query.filter(Customer.industry == industry)
        
        # Get total count
        total = query.count()
        
        # Apply sorting
        if sort_order == "desc":
            query = query.order_by(getattr(Customer, sort_by).desc())
        else:
            query = query.order_by(getattr(Customer, sort_by).asc())
        
        # Apply pagination
        customers = query.offset(skip).limit(limit).all()
        
        return customers, total
    
    @staticmethod
    def update(
        db: Session,
        customer_id: UUID,
        update_data: CustomerUpdate,
        user: str = "SYSTEM"
    ) -> Customer:
        """Update customer details."""
        customer = CustomerCRUD.get(db, customer_id)
        if not customer:
            raise ValueError(f"Customer with ID {customer_id} not found")
        
        # Update fields
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(customer, field, value)
        
        customer.version += 1
        
        db.commit()
        db.refresh(customer)
        
        logger.info(f"Customer updated: {customer.customer_name} (ID: {customer_id}) by {user}")
        return customer
    
    @staticmethod
    def soft_delete(db: Session, customer_id: UUID, user: str = "SYSTEM") -> Customer:
        """Soft delete a customer (set status to INACTIVE)."""
        customer = CustomerCRUD.get(db, customer_id)
        if not customer:
            raise ValueError(f"Customer with ID {customer_id} not found")
        
        if customer.status == CustomerStatus.INACTIVE.value:
            raise ValueError(f"Customer {customer.customer_name} is already inactive")
        
        # Check for active affiliations
        active_affiliations = db.query(Affiliation).filter(
            or_(
                Affiliation.parent_customer_id == customer_id,
                Affiliation.affiliate_customer_id == customer_id
            ),
            Affiliation.status == "ACTIVE"
        ).count()
        
        if active_affiliations > 0:
            raise ValueError(f"Cannot deactivate customer with {active_affiliations} active affiliations")
        
        # Set status to inactive
        customer.status = CustomerStatus.INACTIVE.value
        customer.version += 1
        
        db.commit()
        db.refresh(customer)
        
        logger.warning(f"Customer soft deleted: {customer.customer_name} (ID: {customer_id}) by {user}")
        return customer
    
    @staticmethod
    def restore(db: Session, customer_id: UUID, user: str = "SYSTEM") -> Customer:
        """Restore a soft-deleted customer."""
        customer = CustomerCRUD.get(db, customer_id)
        if not customer:
            raise ValueError(f"Customer with ID {customer_id} not found")
        
        if customer.status != CustomerStatus.INACTIVE.value:
            raise ValueError(f"Customer {customer.customer_name} is not inactive")
        
        # Restore status
        customer.status = CustomerStatus.ACTIVE.value
        customer.version += 1
        
        db.commit()
        db.refresh(customer)
        
        logger.info(f"Customer restored: {customer.customer_name} (ID: {customer_id}) by {user}")
        return customer
    
    @staticmethod
    def get_with_details(db: Session, customer_id: UUID) -> dict:
        """Get customer with all related data."""
        customer = CustomerCRUD.get(db, customer_id)
        if not customer:
            return None
        
        # Get affiliations
        parent_affiliations = db.query(Affiliation).filter(
            Affiliation.parent_customer_id == customer_id,
            Affiliation.status == "ACTIVE"
        ).all()
        
        child_affiliations = db.query(Affiliation).filter(
            Affiliation.affiliate_customer_id == customer_id,
            Affiliation.status == "ACTIVE"
        ).all()
        
        # Get notes
        notes = db.query(CustomerNote).filter(
            CustomerNote.customer_id == customer_id
        ).order_by(CustomerNote.created_at.desc()).limit(50).all()
        
        return {
            "customer": customer,
            "affiliations_as_parent": parent_affiliations,
            "affiliations_as_affiliate": child_affiliations,
            "recent_notes": notes
        }


# Convenience functions
def create_customer(db: Session, customer_data: CustomerCreate, user: str = "SYSTEM") -> Customer:
    return CustomerCRUD.create(db, customer_data, user)

def get_customer(db: Session, customer_id: UUID) -> Optional[Customer]:
    return CustomerCRUD.get(db, customer_id)

def get_customer_by_name(db: Session, name: str) -> Optional[Customer]:
    return CustomerCRUD.get_by_name(db, name)

def get_customers(db: Session, skip: int = 0, limit: int = 100, **filters) -> Tuple[List[Customer], int]:
    return CustomerCRUD.get_multi(db, skip, limit, **filters)

def update_customer(db: Session, customer_id: UUID, update_data: CustomerUpdate, user: str = "SYSTEM") -> Customer:
    return CustomerCRUD.update(db, customer_id, update_data, user)

def delete_customer(db: Session, customer_id: UUID, user: str = "SYSTEM") -> Customer:
    return CustomerCRUD.soft_delete(db, customer_id, user)

def restore_customer(db: Session, customer_id: UUID, user: str = "SYSTEM") -> Customer:
    return CustomerCRUD.restore(db, customer_id, user)

def get_customer_details(db: Session, customer_id: UUID) -> dict:
    return CustomerCRUD.get_with_details(db, customer_id)