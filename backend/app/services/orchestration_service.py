"""
Multi-Channel AI Orchestrator Service.

This service coordinates all providers (WhatsApp, Email, Notion, ClickUp, Google Calendar)
and orchestrates the flow of information through the decision engine.
"""

from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.models.commitment import Commitment
from app.models.notification import Notification
from app.providers import (
    BaseProvider,
    ChannelType,
    EmailProvider,
    ProviderMessage,
    ProviderResponse,
    ClickUpProvider,
    GoogleCalendarProvider,
    NotionProvider,
    WhatsAppProvider,
)
from app.schemas.notification import NotificationType
from app.services.ai_service import extract_commitment
from app.services.commitment_service import create_commitment
from app.schemas.commitment import CommitmentCreateRequest


class OrchestrationService:
    """
    Main service for orchestrating multi-channel communication and task management.
    
    Responsibilities:
    1. Manage all provider instances
    2. Route messages from different channels to the decision engine
    3. Sync task updates across platforms
    4. Generate and dispatch notifications
    5. Handle errors and rate limiting
    """
    
    def __init__(self, db: Session):
        """Initialize the orchestration service with database session."""
        self.db = db
        self.providers: dict[ChannelType, BaseProvider] = {}
        self.notification_queue: list[Notification] = []
    
    def register_provider(
        self,
        channel: ChannelType,
        config: dict[str, Any]
    ) -> bool:
        """
        Register a provider for a specific channel.
        
        Args:
            channel: The channel type
            config: Provider-specific configuration
            
        Returns:
            bool: True if registration succeeds
        """
        try:
            provider = self._create_provider(channel, config)
            if provider:
                self.providers[channel] = provider
                return True
            return False
        except Exception as e:
            print(f"Failed to register provider for {channel}: {str(e)}")
            return False
    
    def _create_provider(
        self,
        channel: ChannelType,
        config: dict[str, Any]
    ) -> Optional[BaseProvider]:
        """Factory method to create provider instances."""
        if channel == ChannelType.WHATSAPP:
            return WhatsAppProvider(config)
        elif channel == ChannelType.EMAIL:
            return EmailProvider(config)
        elif channel == ChannelType.NOTION:
            return NotionProvider(config)
        elif channel == ChannelType.CLICKUP:
            return ClickUpProvider(config)
        elif channel == ChannelType.GOOGLE_CALENDAR:
            return GoogleCalendarProvider(config)
        return None
    
    async def process_incoming_message(
        self,
        message: ProviderMessage
    ) -> ProviderResponse:
        """
        Process an incoming message from any channel.
        
        Flow:
        1. Extract commitment from message content
        2. Send to decision engine
        3. Generate AI reply
        4. Sync to task management (Notion/ClickUp)
        5. Create calendar event if deadline mentioned
        6. Send notification to user
        
        Args:
            message: The incoming message
            
        Returns:
            ProviderResponse: Result of processing
        """
        try:
            # Step 1: Extract commitment from message
            structured = extract_commitment(message.content)
            
            # Step 2: Create commitment in database
            commitment_request = CommitmentCreateRequest(text=message.content)
            commitment = create_commitment(self.db, commitment_request)
            
            # Step 3: Generate AI reply using commitment service
            reply = f"I've captured this commitment: {structured['task']} with priority {structured['priority']}"
            
            # Step 4: Send reply back through the same channel
            provider = self.providers.get(message.channel)
            if provider:
                await provider.send_message(
                    recipient_id=message.sender_id,
                    content=reply,
                    metadata={"commitment_id": commitment.id}
                )
            
            # Step 5: Sync to task management platforms
            await self._sync_commitment_to_tasks(commitment, structured)
            
            # Step 6: Create calendar event if deadline mentioned
            if structured.get("deadline"):
                await self._create_calendar_event(commitment, structured)
            
            # Step 7: Send notification
            await self._send_notification(
                notification_type=NotificationType.SUCCESS,
                title="Commitment Captured",
                message=f"Task captured: {structured['task']}",
                channel=message.channel,
                commitment_id=commitment.id
            )
            
            return ProviderResponse(
                success=True,
                message="Message processed successfully",
                data={
                    "commitment_id": commitment.id,
                    "channel": message.channel,
                    "action_taken": "commitment_created_and_synced"
                }
            )
        except Exception as e:
            print(f"Error processing message: {str(e)}")
            await self._send_notification(
                notification_type=NotificationType.ERROR,
                title="Message Processing Failed",
                message=f"Error: {str(e)}",
                channel=message.channel
            )
            return ProviderResponse(
                success=False,
                message="Failed to process message",
                error=str(e)
            )
    
    async def _sync_commitment_to_tasks(
        self,
        commitment: Commitment,
        structured: dict[str, Any]
    ) -> None:
        """
        Sync a commitment to task management platforms (Notion, ClickUp).
        
        Args:
            commitment: The commitment to sync
            structured: Structured commitment data
        """
        try:
            # Sync to Notion
            notion_provider = self.providers.get(ChannelType.NOTION)
            if notion_provider:
                response = await notion_provider.send_message(
                    recipient_id="default",
                    content=commitment.task,
                    metadata={
                        "priority": structured.get("priority"),
                        "deadline": structured.get("deadline"),
                        "commitment_id": commitment.id
                    }
                )
                if response.success:
                    print(f"✓ Synced to Notion: {commitment.task}")
            
            # Sync to ClickUp
            clickup_provider = self.providers.get(ChannelType.CLICKUP)
            if clickup_provider:
                response = await clickup_provider.send_message(
                    recipient_id="default",
                    content=commitment.task,
                    metadata={
                        "priority": structured.get("priority"),
                        "due_date": structured.get("deadline"),
                        "commitment_id": commitment.id
                    }
                )
                if response.success:
                    print(f"✓ Synced to ClickUp: {commitment.task}")
        except Exception as e:
            print(f"Error syncing commitment to task management: {str(e)}")
    
    async def _create_calendar_event(
        self,
        commitment: Commitment,
        structured: dict[str, Any]
    ) -> None:
        """
        Create a calendar event if a deadline is mentioned.
        
        Args:
            commitment: The commitment
            structured: Structured commitment data
        """
        try:
            calendar_provider = self.providers.get(ChannelType.GOOGLE_CALENDAR)
            if calendar_provider and structured.get("deadline"):
                response = await calendar_provider.send_message(
                    recipient_id="primary",
                    content=commitment.task,
                    metadata={
                        "deadline": structured.get("deadline"),
                        "commitment_id": commitment.id
                    }
                )
                if response.success:
                    print(f"✓ Calendar event created: {commitment.task}")
        except Exception as e:
            print(f"Error creating calendar event: {str(e)}")
    
    async def _send_notification(
        self,
        notification_type: NotificationType,
        title: str,
        message: str,
        channel: Optional[str] = None,
        commitment_id: Optional[str] = None
    ) -> None:
        """
        Create and store a notification.
        
        Args:
            notification_type: Type of notification
            title: Notification title
            message: Notification message
            channel: Optional channel information
            commitment_id: Optional related commitment ID
        """
        try:
            notification = Notification(
                type=notification_type.value,
                title=title,
                message=message,
                channel=channel,
                related_commitment_id=commitment_id
            )
            self.db.add(notification)
            self.db.commit()
            self.notification_queue.append(notification)
            print(f"✓ Notification created: {title}")
        except Exception as e:
            print(f"Error creating notification: {str(e)}")
    
    async def get_unread_notifications(
        self,
        limit: int = 10
    ) -> list[Notification]:
        """Get unread notifications."""
        try:
            notifications = self.db.query(Notification).filter(
                Notification.is_read == False
            ).order_by(
                Notification.created_at.desc()
            ).limit(limit).all()
            return notifications
        except Exception as e:
            print(f"Error fetching notifications: {str(e)}")
            return []
    
    async def mark_notification_read(self, notification_id: str) -> bool:
        """Mark a notification as read."""
        try:
            notification = self.db.query(Notification).filter(
                Notification.id == notification_id
            ).first()
            if notification:
                notification.is_read = True
                self.db.commit()
                return True
            return False
        except Exception as e:
            print(f"Error marking notification as read: {str(e)}")
            return False
    
    async def sync_all_platforms(self) -> dict[str, bool]:
        """Sync data from all connected platforms."""
        results = {}
        for channel, provider in self.providers.items():
            try:
                if await provider.validate_credentials():
                    response = await provider.sync_data("tasks")
                    results[channel.value] = response.success
                    print(f"✓ Synced {channel.value}")
                else:
                    results[channel.value] = False
                    print(f"✗ Failed to validate credentials for {channel.value}")
            except Exception as e:
                results[channel.value] = False
                print(f"✗ Error syncing {channel.value}: {str(e)}")
        return results
    
    async def validate_all_providers(self) -> dict[str, bool]:
        """Validate all provider credentials."""
        results = {}
        for channel, provider in self.providers.items():
            try:
                is_valid = await provider.validate_credentials()
                results[channel.value] = is_valid
            except Exception as e:
                results[channel.value] = False
                print(f"Validation error for {channel.value}: {str(e)}")
        return results
