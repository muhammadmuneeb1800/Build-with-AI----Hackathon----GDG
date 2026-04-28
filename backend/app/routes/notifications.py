"""Routes for notification management."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.notification import Notification
from app.schemas.notification import (
    NotificationCreateRequest,
    NotificationRead,
    NotificationMarkReadRequest,
)

router = APIRouter(tags=["notifications"], prefix="/notifications")


@router.post("", response_model=NotificationRead, status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: NotificationCreateRequest,
    db: Session = Depends(get_db)
):
    """Create a new notification."""
    try:
        notification = Notification(
            type=payload.type.value,
            title=payload.title,
            message=payload.message,
            channel=payload.channel,
            related_commitment_id=payload.related_commitment_id
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to create notification") from exc


@router.get("", response_model=list[NotificationRead])
def get_notifications(
    unread_only: bool = True,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get notifications, optionally filtered to unread only."""
    try:
        query = db.query(Notification)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        notifications = query.order_by(
            Notification.created_at.desc()
        ).limit(limit).all()
        return notifications
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to fetch notifications") from exc


@router.get("/{notification_id}", response_model=NotificationRead)
def get_notification(
    notification_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific notification by ID."""
    try:
        notification = db.query(Notification).filter(
            Notification.id == notification_id
        ).first()
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        return notification
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to fetch notification") from exc


@router.patch("/{notification_id}", response_model=NotificationRead)
def update_notification(
    notification_id: str,
    payload: NotificationMarkReadRequest,
    db: Session = Depends(get_db)
):
    """Mark a notification as read/unread."""
    try:
        notification = db.query(Notification).filter(
            Notification.id == notification_id
        ).first()
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        notification.is_read = payload.is_read
        db.commit()
        db.refresh(notification)
        return notification
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to update notification") from exc


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: str,
    db: Session = Depends(get_db)
):
    """Delete a notification."""
    try:
        notification = db.query(Notification).filter(
            Notification.id == notification_id
        ).first()
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        db.delete(notification)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to delete notification") from exc


@router.post("/mark-all-read")
def mark_all_as_read(db: Session = Depends(get_db)):
    """Mark all notifications as read."""
    try:
        db.query(Notification).filter(Notification.is_read == False).update(
            {"is_read": True}
        )
        db.commit()
        return {"message": "All notifications marked as read"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to mark notifications as read") from exc
