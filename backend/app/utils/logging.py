"""
Logging configuration and utilities
"""

import logging
import sys
from datetime import datetime
from typing import Optional
from app.config import settings

# Custom log formatter with colors for development
class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors for console output"""
    
    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
    }
    RESET = '\033[0m'
    
    def format(self, record):
        log_message = super().format(record)
        if settings.ENVIRONMENT == 'development':
            color = self.COLORS.get(record.levelname, self.RESET)
            return f"{color}{log_message}{self.RESET}"
        return log_message


def setup_logging():
    """Configure application logging"""
    
    # Create formatters
    console_formatter = ColoredFormatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    console_handler.setFormatter(console_formatter)
    
    # File handler (if log file is configured)
    file_handler = None
    if hasattr(settings, 'LOG_FILE') and settings.LOG_FILE:
        file_handler = logging.FileHandler(settings.LOG_FILE)
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(file_formatter)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    root_logger.addHandler(console_handler)
    if file_handler:
        root_logger.addHandler(file_handler)
    
    # Set third-party loggers to WARNING
    logging.getLogger('sqlalchemy').setLevel(logging.WARNING)
    logging.getLogger('uvicorn').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    
    return root_logger


class AuditLogger:
    """Audit logging for database operations"""
    
    def __init__(self, user: str = "SYSTEM"):
        self.user = user
        self.logger = logging.getLogger('audit')
    
    def log_insert(self, table: str, record_id: str, data: dict):
        """Log INSERT operation"""
        self.logger.info(
            f"AUDIT|INSERT|{table}|{record_id}|{self.user}|{data}"
        )
    
    def log_update(self, table: str, record_id: str, old_data: dict, new_data: dict):
        """Log UPDATE operation"""
        changes = self._get_changes(old_data, new_data)
        self.logger.info(
            f"AUDIT|UPDATE|{table}|{record_id}|{self.user}|{changes}"
        )
    
    def log_delete(self, table: str, record_id: str, data: dict):
        """Log DELETE operation"""
        self.logger.info(
            f"AUDIT|DELETE|{table}|{record_id}|{self.user}|{data}"
        )
    
    def log_soft_delete(self, table: str, record_id: str, data: dict):
        """Log SOFT DELETE operation"""
        self.logger.warning(
            f"AUDIT|SOFT_DELETE|{table}|{record_id}|{self.user}|{data}"
        )
    
    @staticmethod
    def _get_changes(old: dict, new: dict) -> dict:
        """Get only changed fields"""
        changes = {}
        for key in new:
            if key in old and old[key] != new[key]:
                changes[key] = {
                    'old': old[key],
                    'new': new[key]
                }
        return changes


# Global logger instance
app_logger = setup_logging()

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance"""
    return logging.getLogger(name)