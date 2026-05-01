"""
Data validation utilities
"""

import re
from typing import Optional, Any
from datetime import datetime
from urllib.parse import urlparse


class Validators:
    """Collection of validation methods"""
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        if not email:
            return True  # Email is optional
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate phone number format"""
        if not phone:
            return True  # Phone is optional
        # Remove common separators and check digits
        cleaned = re.sub(r'[\s\+\-\(\)]', '', phone)
        return cleaned.isdigit() and 7 <= len(cleaned) <= 15
    
    @staticmethod
    def validate_url(url: str) -> bool:
        """Validate URL format"""
        if not url:
            return True
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except:
            return False
    
    @staticmethod
    def validate_year(year: int) -> bool:
        """Validate year is reasonable"""
        if not year:
            return True
        current_year = datetime.now().year
        return 1800 <= year <= current_year
    
    @staticmethod
    def validate_positive_integer(value: Any) -> bool:
        """Validate positive integer"""
        if value is None:
            return True
        try:
            return int(value) >= 0
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def validate_customer_name(name: str) -> bool:
        """Validate customer name"""
        if not name:
            return False
        return len(name.strip()) >= 2 and len(name) <= 255
    
    @staticmethod
    def validate_uuid(uuid_string: str) -> bool:
        """Validate UUID format"""
        pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        return bool(re.match(pattern, uuid_string.lower()))


class InputSanitizer:
    """Input sanitization utilities"""
    
    @staticmethod
    def sanitize_string(value: str) -> str:
        """Sanitize string input"""
        if not value:
            return ""
        # Remove leading/trailing whitespace
        value = value.strip()
        # Escape HTML entities
        html_escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
        }
        for char, escape in html_escape.items():
            value = value.replace(char, escape)
        return value
    
    @staticmethod
    def sanitize_email(email: str) -> str:
        """Sanitize email address"""
        if not email:
            return ""
        email = email.strip().lower()
        return email
    
    @staticmethod
    def truncate_text(text: str, max_length: int = 1000) -> str:
        """Truncate text to maximum length"""
        if not text:
            return ""
        if len(text) <= max_length:
            return text
        return text[:max_length - 3] + "..."


class BusinessValidators:
    """Business logic validators"""
    
    @staticmethod
    def can_create_affiliation(
        parent_id: str,
        affiliate_id: str,
        existing_affiliations: list
    ) -> tuple[bool, str]:
        """Check if affiliation can be created"""
        
        # Can't affiliate with self
        if parent_id == affiliate_id:
            return False, "Cannot affiliate a customer with itself"
        
        # Check for duplicate
        for aff in existing_affiliations:
            if aff.get('affiliate_customer_id') == affiliate_id:
                return False, "Affiliation already exists"
        
        return True, "OK"
    
    @staticmethod
    def can_deactivate_customer(
        customer_id: str,
        has_active_affiliations: bool,
        has_active_notes: bool
    ) -> tuple[bool, str]:
        """Check if customer can be deactivated"""
        
        if has_active_affiliations:
            return False, "Cannot deactivate customer with active affiliations"
        
        # Notes don't block deactivation, just warning
        if has_active_notes:
            return True, "Customer has notes, but can still be deactivated"
        
        return True, "OK"
    
    @staticmethod
    def validate_note_content(content: str) -> tuple[bool, str]:
        """Validate note content"""
        
        if not content or not content.strip():
            return False, "Note content cannot be empty"
        
        if len(content) > 5000:
            return False, f"Note content exceeds maximum length of 5000 characters (current: {len(content)})"
        
        return True, "OK"


# Convenience functions
validate_email = Validators.validate_email
validate_phone = Validators.validate_phone
validate_url = Validators.validate_url
validate_year = Validators.validate_year
sanitize_string = InputSanitizer.sanitize_string
can_create_affiliation = BusinessValidators.can_create_affiliation