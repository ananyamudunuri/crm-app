"""
CRUD operations package
"""

from app.crud import customer
from app.crud import affiliation
from app.crud import note
from app.crud import audit

__all__ = ['customer', 'affiliation', 'note', 'audit']