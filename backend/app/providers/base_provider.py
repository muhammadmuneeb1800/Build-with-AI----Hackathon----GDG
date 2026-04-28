"""
BaseProvider interface for multi-channel orchestration.

Defines the contract that all provider integrations (WhatsApp, Email, Notion, ClickUp, etc.)
must implement for a modular, scalable architecture.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel


class ChannelType(str, Enum):
    """Supported communication channels."""
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    NOTION = "notion"
    CLICKUP = "clickup"
    GOOGLE_CALENDAR = "google_calendar"


class MessageType(str, Enum):
    """Types of messages that can be processed."""
    INCOMING = "incoming"
    OUTGOING = "outgoing"
    NOTIFICATION = "notification"


class ProviderMessage(BaseModel):
    """Standardized message format across all providers."""
    channel: ChannelType
    message_type: MessageType
    sender_id: str
    recipient_id: Optional[str] = None
    content: str
    timestamp: datetime
    metadata: dict[str, Any] = {}
    external_id: Optional[str] = None  # ID from the external platform


class ProviderResponse(BaseModel):
    """Standard response from provider operations."""
    success: bool
    message: str
    data: Optional[dict[str, Any]] = None
    error: Optional[str] = None


class BaseProvider(ABC):
    """
    Abstract base class for all provider integrations.
    
    Defines the interface that all providers must implement:
    - Initialize with configuration
    - Authenticate with the external service
    - Send/receive messages
    - Sync data
    - Handle errors gracefully
    """
    
    def __init__(self, channel: ChannelType, config: dict[str, Any]):
        """
        Initialize the provider with channel type and configuration.
        
        Args:
            channel: The ChannelType this provider handles
            config: Provider-specific configuration (API keys, credentials, etc.)
        """
        self.channel = channel
        self.config = config
        self._authenticated = False
    
    @abstractmethod
    async def authenticate(self) -> bool:
        """
        Authenticate with the external service.
        
        Returns:
            bool: True if authentication succeeds, False otherwise
            
        Raises:
            Exception: Any authentication-related errors should be caught and re-raised
        """
        pass
    
    @abstractmethod
    async def receive_messages(self) -> list[ProviderMessage]:
        """
        Fetch incoming messages from the provider.
        
        Returns:
            list[ProviderMessage]: List of received messages
        """
        pass
    
    @abstractmethod
    async def send_message(
        self,
        recipient_id: str,
        content: str,
        metadata: Optional[dict[str, Any]] = None
    ) -> ProviderResponse:
        """
        Send a message through the provider.
        
        Args:
            recipient_id: ID of the recipient in the external service
            content: Message content
            metadata: Optional metadata to attach to the message
            
        Returns:
            ProviderResponse: Result of the send operation
        """
        pass
    
    @abstractmethod
    async def sync_data(self, sync_type: str) -> ProviderResponse:
        """
        Sync data from the provider (tasks, calendar events, etc.).
        
        Args:
            sync_type: Type of data to sync (e.g., "tasks", "calendar", "notes")
            
        Returns:
            ProviderResponse: Result of the sync operation
        """
        pass
    
    @abstractmethod
    async def validate_credentials(self) -> bool:
        """
        Validate that the current credentials are valid.
        
        Returns:
            bool: True if credentials are valid, False otherwise
        """
        pass
    
    def is_authenticated(self) -> bool:
        """Check if the provider is currently authenticated."""
        return self._authenticated
    
    @abstractmethod
    async def handle_rate_limit(self) -> bool:
        """
        Handle rate limiting gracefully.
        
        Returns:
            bool: True if rate limit is resolved, False otherwise
        """
        pass
    
    @abstractmethod
    async def validate_response(self, response: dict[str, Any]) -> bool:
        """
        Validate the response from the external service.
        
        Args:
            response: Response data from the external service
            
        Returns:
            bool: True if response is valid, False otherwise
        """
        pass
