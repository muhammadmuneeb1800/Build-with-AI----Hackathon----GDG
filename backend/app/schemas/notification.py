"""Schemas for notification validation and serialization."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class NotificationType(str, Enum):
    """Types of notifications."""
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    INFO = "info"


class NotificationCreateRequest(BaseModel):
    """Request model for creating a notification."""
    
    type: NotificationType
    title: str
    message: str
    channel: str | None = None
    related_commitment_id: str | None = None


class NotificationRead(BaseModel):
    """Response model for notification data."""
    
    id: str
    type: str
    title: str
    message: str
    channel: str | None
    related_commitment_id: str | None
    is_read: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class NotificationMarkReadRequest(BaseModel):
    """Request model for marking notification as read."""
    
    is_read: bool
