"""
CRUD operations for Audit Logs
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
import logging

from app.models import AuditLog

logger = logging.getLogger(__name__)


class AuditCRUD:
    """Audit log CRUD operations"""
    
    @staticmethod
    def get_logs(
        db: Session,
        table_name: Optional[str] = None,
        record_id: Optional[UUID] = None,
        action: Optional[str] = None,
        user: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[AuditLog]:
        """
        Get audit logs with filters.
        
        Args:
            db: Database session
            table_name: Filter by table name
            record_id: Filter by record ID
            action: Filter by action (INSERT, UPDATE, DELETE)
            user: Filter by user
            start_date: Filter by start date
            end_date: Filter by end date
            skip: Number of records to skip
            limit: Maximum records to return
        """
        query = db.query(AuditLog)
        
        if table_name:
            query = query.filter(AuditLog.table_name == table_name)
        
        if record_id:
            query = query.filter(AuditLog.record_id == record_id)
        
        if action:
            query = query.filter(AuditLog.action == action)
        
        if user:
            query = query.filter(AuditLog.changed_by == user)
        
        if start_date:
            query = query.filter(AuditLog.changed_at >= start_date)
        
        if end_date:
            query = query.filter(AuditLog.changed_at <= end_date)
        
        # Order by most recent first
        query = query.order_by(AuditLog.changed_at.desc())
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_record_history(
        db: Session,
        table_name: str,
        record_id: UUID,
        limit: int = 50
    ) -> List[AuditLog]:
        """
        Get complete change history for a specific record.
        
        Args:
            db: Database session
            table_name: Name of the table
            record_id: ID of the record
            limit: Maximum number of history entries to return
        """
        return db.query(AuditLog).filter(
            AuditLog.table_name == table_name,
            AuditLog.record_id == record_id
        ).order_by(AuditLog.changed_at.desc()).limit(limit).all()
    
    @staticmethod
    def get_recent_changes(
        db: Session,
        hours: int = 24,
        limit: int = 100
    ) -> List[AuditLog]:
        """
        Get recent changes within the last X hours.
        
        Args:
            db: Database session
            hours: Number of hours to look back
            limit: Maximum number of records to return
        """
        since = datetime.now() - timedelta(hours=hours)
        
        return db.query(AuditLog).filter(
            AuditLog.changed_at >= since
        ).order_by(AuditLog.changed_at.desc()).limit(limit).all()
    
    @staticmethod
    def get_user_activity(
        db: Session,
        user: str,
        days: int = 7,
        limit: int = 100
    ) -> List[AuditLog]:
        """
        Get activity for a specific user.
        
        Args:
            db: Database session
            user: Username
            days: Number of days to look back
            limit: Maximum number of records to return
        """
        since = datetime.now() - timedelta(days=days)
        
        return db.query(AuditLog).filter(
            AuditLog.changed_by == user,
            AuditLog.changed_at >= since
        ).order_by(AuditLog.changed_at.desc()).limit(limit).all()
    
    @staticmethod
    def get_summary(
        db: Session,
        days: int = 7
    ) -> dict:
        """
        Get audit summary statistics.
        
        Args:
            db: Database session
            days: Number of days to analyze
            
        Returns:
            Dictionary with summary statistics
        """
        since = datetime.now() - timedelta(days=days)
        
        # Total changes
        total_changes = db.query(AuditLog).filter(
            AuditLog.changed_at >= since
        ).count()
        
        # Changes by action
        actions = db.query(
            AuditLog.action,
            db.func.count(AuditLog.action)
        ).filter(
            AuditLog.changed_at >= since
        ).group_by(AuditLog.action).all()
        
        # Changes by table
        tables = db.query(
            AuditLog.table_name,
            db.func.count(AuditLog.table_name)
        ).filter(
            AuditLog.changed_at >= since
        ).group_by(AuditLog.table_name).all()
        
        # Changes by user
        users = db.query(
            AuditLog.changed_by,
            db.func.count(AuditLog.changed_by)
        ).filter(
            AuditLog.changed_at >= since
        ).group_by(AuditLog.changed_by).order_by(
            db.func.count(AuditLog.changed_by).desc()
        ).limit(10).all()
        
        return {
            "period_days": days,
            "total_changes": total_changes,
            "by_action": dict(actions),
            "by_table": dict(tables),
            "top_users": [{"user": u[0], "count": u[1]} for u in users]
        }
    
    @staticmethod
    def cleanup_old_logs(
        db: Session,
        days_to_keep: int = 90,
        dry_run: bool = True
    ) -> int:
        """
        Delete audit logs older than specified days.
        
        Args:
            db: Database session
            days_to_keep: Number of days to keep
            dry_run: If True, only count records without deleting
            
        Returns:
            Number of records deleted (or would be deleted)
        """
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)
        
        query = db.query(AuditLog).filter(AuditLog.changed_at < cutoff_date)
        count = query.count()
        
        if not dry_run and count > 0:
            query.delete()
            db.commit()
            logger.info(f"Cleaned up {count} audit logs older than {days_to_keep} days")
        
        return count


# Convenience functions
def get_audit_logs(db: Session, **kwargs) -> List[AuditLog]:
    return AuditCRUD.get_logs(db, **kwargs)

def get_record_history(db: Session, table_name: str, record_id: UUID) -> List[AuditLog]:
    return AuditCRUD.get_record_history(db, table_name, record_id)

def get_audit_summary(db: Session, days: int = 7) -> dict:
    return AuditCRUD.get_summary(db, days)

def cleanup_audit_logs(db: Session, days_to_keep: int = 90, dry_run: bool = False) -> int:
    return AuditCRUD.cleanup_old_logs(db, days_to_keep, dry_run)