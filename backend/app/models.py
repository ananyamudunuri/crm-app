"""
SQLAlchemy ORM Models for all tables.
"""

from sqlalchemy import (
    Column, String, Integer, Text, DateTime, Boolean, 
    CheckConstraint, UniqueConstraint, ForeignKey, 
    Index, JSON, BigInteger, Enum as PgEnum
)
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from enum import Enum

from app.database import Base


class CustomerStatus(str, Enum):
    """Customer status enum"""
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class RelationshipType(str, Enum):
    """Affiliation relationship types"""
    AFFILIATE = "AFFILIATE"
    SUBSIDIARY = "SUBSIDIARY"
    PARTNER = "PARTNER"
    VENDOR = "VENDOR"


class NoteType(str, Enum):
    """Note type enum"""
    GENERAL = "GENERAL"
    IMPORTANT = "IMPORTANT"
    FOLLOW_UP = "FOLLOW_UP"
    MEETING = "MEETING"
    CALL = "CALL"


class Customer(Base):
    """Customer model - main entity"""
    __tablename__ = "customers"
    
    # Primary key
    customer_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic info
    customer_name = Column(String(255), nullable=False, unique=True, index=True)
    industry = Column(String(255), nullable=True)
    phone = Column(String(500), nullable=True)  # Can store multiple numbers
    email = Column(String(255), nullable=True)
    location = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    
    # Business metrics
    no_of_employees = Column(Integer, nullable=True)
    established_year = Column(Integer, nullable=True)
    
    # Status & tracking
    status = Column(
        String(20), 
        default=CustomerStatus.ACTIVE.value, 
        nullable=False,
        index=True
    )
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    version = Column(Integer, default=1)
    
    # Relationships
    notes = relationship("CustomerNote", back_populates="customer", cascade="all, delete-orphan")
    parent_affiliations = relationship(
        "Affiliation", 
        foreign_keys="Affiliation.parent_customer_id",
        back_populates="parent_customer",
        cascade="all, delete-orphan"
    )
    affiliate_affiliations = relationship(
        "Affiliation",
        foreign_keys="Affiliation.affiliate_customer_id",
        back_populates="affiliate_customer"
    )
    
    def __repr__(self):
        return f"<Customer {self.customer_name}>"


class Affiliation(Base):
    """Affiliation model - self-referential relationship"""
    __tablename__ = "affiliations"
    
    affiliation_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.customer_id", ondelete="CASCADE"), nullable=False)
    affiliate_customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.customer_id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String(50), default=RelationshipType.AFFILIATE.value)
    notes = Column(Text, nullable=True)
    status = Column(String(20), default="ACTIVE")
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # Relationships
    parent_customer = relationship("Customer", foreign_keys=[parent_customer_id], back_populates="parent_affiliations")
    affiliate_customer = relationship("Customer", foreign_keys=[affiliate_customer_id], back_populates="affiliate_affiliations")
    
    __table_args__ = (
        CheckConstraint("parent_customer_id != affiliate_customer_id", name="no_self_affiliation"),
        UniqueConstraint("parent_customer_id", "affiliate_customer_id", "relationship_type", name="unique_affiliation"),
        Index("idx_affiliations_parent", "parent_customer_id"),
        Index("idx_affiliations_affiliate", "affiliate_customer_id"),
    )


class CustomerNote(Base):
    """Customer notes - append-only history"""
    __tablename__ = "customer_notes"
    
    note_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.customer_id", ondelete="CASCADE"), nullable=False)
    note_text = Column(Text, nullable=False)
    note_type = Column(String(50), default=NoteType.GENERAL.value)
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime(timezone=True), nullable=True)
    edited_by = Column(String(255), nullable=True)
    
    # Relationships
    customer = relationship("Customer", back_populates="notes")
    
    __table_args__ = (
        Index("idx_notes_customer", "customer_id"),
        Index("idx_notes_created_at", "created_at"),
    )


class AuditLog(Base):
    """Audit log - tracks all changes"""
    __tablename__ = "audit_logs"
    
    log_id = Column(BigInteger, primary_key=True, autoincrement=True)
    table_name = Column(String(100), nullable=False)
    record_id = Column(UUID(as_uuid=True), nullable=False)
    action = Column(String(20), nullable=False)
    old_data = Column(JSON, nullable=True)
    new_data = Column(JSON, nullable=True)
    changed_by = Column(String(255), nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
    
    __table_args__ = (
        Index("idx_audit_record", "table_name", "record_id"),
        Index("idx_audit_changed_at", "changed_at"),
    )