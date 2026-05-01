# backend/app/schemas.py
"""
Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field, field_validator, EmailStr, HttpUrl
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


# Enums
class CustomerStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class RelationshipType(str, Enum):
    AFFILIATE = "AFFILIATE"
    SUBSIDIARY = "SUBSIDIARY"
    PARTNER = "PARTNER"
    VENDOR = "VENDOR"


class NoteType(str, Enum):
    GENERAL = "GENERAL"
    IMPORTANT = "IMPORTANT"
    FOLLOW_UP = "FOLLOW_UP"
    MEETING = "MEETING"
    CALL = "CALL"


# Customer Schemas
class CustomerBase(BaseModel):
    """Base customer schema"""
    customer_name: str = Field(..., min_length=1, max_length=255)
    industry: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=500)
    email: Optional[EmailStr] = None
    location: Optional[str] = None
    website: Optional[HttpUrl] = None
    linkedin_url: Optional[HttpUrl] = None
    no_of_employees: Optional[int] = Field(None, ge=0)
    established_year: Optional[int] = Field(None, ge=1800, le=datetime.now().year)
    
    @field_validator('customer_name')
    @classmethod
    def validate_customer_name(cls, v):
        if not v.strip():
            raise ValueError('Customer name cannot be empty')
        return v.strip()
    
    @field_validator('established_year')
    @classmethod
    def validate_year(cls, v):
        if v and v > datetime.now().year:
            raise ValueError('Established year cannot be in the future')
        return v


class CustomerCreate(CustomerBase):
    """Create customer schema"""
    created_by: Optional[str] = "SYSTEM"
    status: CustomerStatus = CustomerStatus.ACTIVE


class CustomerUpdate(BaseModel):
    """Update customer schema (all fields optional)"""
    customer_name: Optional[str] = Field(None, min_length=1, max_length=255)
    industry: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=500)
    email: Optional[EmailStr] = None
    location: Optional[str] = None
    website: Optional[HttpUrl] = None
    linkedin_url: Optional[HttpUrl] = None
    no_of_employees: Optional[int] = Field(None, ge=0)
    established_year: Optional[int] = Field(None, ge=1800, le=datetime.now().year)
    status: Optional[CustomerStatus] = None


class CustomerResponse(CustomerBase):
    """Customer response schema"""
    customer_id: UUID
    status: CustomerStatus
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime
    version: int
    
    class Config:
        from_attributes = True


# Affiliation Schemas
class AffiliationBase(BaseModel):
    """Base affiliation schema"""
    parent_customer_id: UUID
    affiliate_customer_id: UUID
    relationship_type: RelationshipType = RelationshipType.AFFILIATE
    notes: Optional[str] = None
    
    @field_validator('parent_customer_id', 'affiliate_customer_id')
    @classmethod
    def validate_uuids(cls, v):
        if not v:
            raise ValueError('UUID cannot be empty')
        return v


class AffiliationCreate(AffiliationBase):
    """Create affiliation schema"""
    created_by: Optional[str] = "SYSTEM"
    status: str = "ACTIVE"


class AffiliationUpdate(BaseModel):
    """Update affiliation schema"""
    relationship_type: Optional[RelationshipType] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class AffiliationResponse(AffiliationBase):
    """Affiliation response schema with full details"""
    affiliation_id: UUID
    status: str
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime
    parent_customer_name: Optional[str] = None
    affiliate_customer_name: Optional[str] = None
    
    class Config:
        from_attributes = True


# Note Schemas
class NoteBase(BaseModel):
    """Base note schema"""
    note_text: str = Field(..., min_length=1, max_length=5000)
    note_type: NoteType = NoteType.GENERAL


class NoteCreate(NoteBase):
    """Create note schema"""
    created_by: str = "SYSTEM"


class NoteUpdate(BaseModel):
    """Update note schema (only type can be updated, text is immutable)"""
    note_type: Optional[NoteType] = None


class NoteResponse(NoteBase):
    """Note response schema"""
    note_id: UUID
    customer_id: UUID
    created_by: str
    created_at: datetime
    is_edited: bool
    edited_at: Optional[datetime]
    edited_by: Optional[str]
    
    class Config:
        from_attributes = True


# Customer Detail Response (with relationships)
class CustomerDetailResponse(CustomerResponse):
    """Full customer detail with notes and affiliations"""
    notes: List[NoteResponse] = []
    affiliations_as_parent: List[AffiliationResponse] = []
    affiliations_as_affiliate: List[AffiliationResponse] = []
    
    class Config:
        from_attributes = True


# Pagination - FIXED: regex changed to pattern
class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_by: Optional[str] = "created_at"
    sort_order: str = Field("desc", pattern="^(asc|desc)$")  # Fixed: regex -> pattern


class PaginatedResponse(BaseModel):
    """Generic paginated response"""
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int


# Audit Log Schema
class AuditLogResponse(BaseModel):
    """Audit log entry response"""
    log_id: int
    table_name: str
    record_id: UUID
    action: str
    old_data: Optional[dict]
    new_data: Optional[dict]
    changed_by: str
    changed_at: datetime
    
    class Config:
        from_attributes = True