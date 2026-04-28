"""
Comprehensive pytest tests for Multi-Channel AI Orchestrator.

This test suite validates:
1. Provider initialization and authentication
2. Message sending and receiving
3. Data synchronization
4. Error handling and rate limiting
5. Credential validation
6. Response validation
"""

import pytest
from datetime import datetime, timezone
from typing import Any

from app.providers import (
    BaseProvider,
    ChannelType,
    EmailProvider,
    WhatsAppProvider,
    NotionProvider,
    ClickUpProvider,
    GoogleCalendarProvider,
    ProviderMessage,
    ProviderResponse,
    MessageType,
)


# ============================================================================
# Test Fixtures
# ============================================================================

@pytest.fixture
def whatsapp_config() -> dict[str, Any]:
    """WhatsApp provider configuration."""
    return {
        "account_sid": "test_account_sid",
        "auth_token": "test_auth_token",
        "phone_number": "+1234567890"
    }


@pytest.fixture
def email_config() -> dict[str, Any]:
    """Email provider configuration."""
    return {
        "gmail_api_key": "test_api_key_123456789",
        "user_email": "test@example.com"
    }


@pytest.fixture
def notion_config() -> dict[str, Any]:
    """Notion provider configuration."""
    return {
        "notion_api_key": "notiontestkey123456789012345",
        "notion_database_id": "database_id_123"
    }


@pytest.fixture
def clickup_config() -> dict[str, Any]:
    """ClickUp provider configuration."""
    return {
        "clickup_api_key": "clickuptestkey123456789012345",
        "clickup_list_id": "list_id_123",
        "clickup_team_id": "team_id_123"
    }


@pytest.fixture
def google_calendar_config() -> dict[str, Any]:
    """Google Calendar provider configuration."""
    return {
        "calendar_api_key": "calendar_key_test",
        "user_email": "test@example.com",
        "calendar_id": "primary"
    }


@pytest.fixture
def sample_message() -> ProviderMessage:
    """Sample incoming message."""
    return ProviderMessage(
        channel=ChannelType.WHATSAPP,
        message_type=MessageType.INCOMING,
        sender_id="+1234567890",
        recipient_id="bot_id",
        content="Send MRR to investor tomorrow",
        timestamp=datetime.now(timezone.utc),
        metadata={"message_source": "webhook"}
    )


# ============================================================================
# WhatsApp Provider Tests
# ============================================================================

@pytest.mark.asyncio
async def test_whatsapp_provider_initialization(whatsapp_config):
    """Test WhatsApp provider initialization."""
    provider = WhatsAppProvider(whatsapp_config)
    assert provider.channel == ChannelType.WHATSAPP
    assert provider.account_sid == "test_account_sid"
    assert provider.auth_token == "test_auth_token"
    assert not provider.is_authenticated()


@pytest.mark.asyncio
async def test_whatsapp_provider_authentication(whatsapp_config):
    """Test WhatsApp provider authentication."""
    provider = WhatsAppProvider(whatsapp_config)
    result = await provider.authenticate()
    assert result is True
    assert provider.is_authenticated()


@pytest.mark.asyncio
async def test_whatsapp_send_message_success(whatsapp_config):
    """Test sending a WhatsApp message."""
    provider = WhatsAppProvider(whatsapp_config)
    await provider.authenticate()
    
    response = await provider.send_message(
        recipient_id="+9876543210",
        content="Test message"
    )
    
    assert response.success is True
    assert "message_id" in response.data
    assert response.data["recipient_id"] == "+9876543210"


@pytest.mark.asyncio
async def test_whatsapp_send_message_without_recipient(whatsapp_config):
    """Test sending a WhatsApp message without recipient."""
    provider = WhatsAppProvider(whatsapp_config)
    await provider.authenticate()
    
    response = await provider.send_message(
        recipient_id="",
        content="Test message"
    )
    
    assert response.success is False
    assert any(keyword in response.message for keyword in ["Invalid parameters", "Missing recipient"])


@pytest.mark.asyncio
async def test_whatsapp_credentials_validation(whatsapp_config):
    """Test WhatsApp credentials validation."""
    provider = WhatsAppProvider(whatsapp_config)
    await provider.authenticate()
    
    is_valid = await provider.validate_credentials()
    assert is_valid is True


@pytest.mark.asyncio
async def test_whatsapp_missing_credentials():
    """Test WhatsApp with missing credentials."""
    provider = WhatsAppProvider({})
    result = await provider.authenticate()
    assert result is False
    assert not provider.is_authenticated()


# ============================================================================
# Email Provider Tests
# ============================================================================

@pytest.mark.asyncio
async def test_email_provider_initialization(email_config):
    """Test Email provider initialization."""
    provider = EmailProvider(email_config)
    assert provider.channel == ChannelType.EMAIL
    assert provider.user_email == "test@example.com"
    assert not provider.is_authenticated()


@pytest.mark.asyncio
async def test_email_provider_authentication(email_config):
    """Test Email provider authentication."""
    provider = EmailProvider(email_config)
    result = await provider.authenticate()
    assert result is True
    assert provider.is_authenticated()


@pytest.mark.asyncio
async def test_email_send_message_success(email_config):
    """Test sending an email."""
    provider = EmailProvider(email_config)
    await provider.authenticate()
    
    response = await provider.send_message(
        recipient_id="recipient@example.com",
        content="Test email content",
        metadata={"subject": "Test Subject"}
    )
    
    assert response.success is True
    assert "message_id" in response.data
    assert response.data["recipient"] == "recipient@example.com"


@pytest.mark.asyncio
async def test_email_send_invalid_recipient(email_config):
    """Test sending email to invalid recipient."""
    provider = EmailProvider(email_config)
    await provider.authenticate()
    
    response = await provider.send_message(
        recipient_id="invalid_email",
        content="Test content"
    )
    
    assert response.success is False
    assert "Invalid email" in response.message


@pytest.mark.asyncio
async def test_email_credentials_validation(email_config):
    """Test Email credentials validation."""
    provider = EmailProvider(email_config)
    await provider.authenticate()
    
    is_valid = await provider.validate_credentials()
    assert is_valid is True


# ============================================================================
# Notion Provider Tests
# ============================================================================

@pytest.mark.asyncio
async def test_notion_provider_initialization(notion_config):
    """Test Notion provider initialization."""
    provider = NotionProvider(notion_config)
    assert provider.channel == ChannelType.NOTION
    assert provider.notion_database_id == "database_id_123"


@pytest.mark.asyncio
async def test_notion_provider_authentication(notion_config):
    """Test Notion provider authentication."""
    provider = NotionProvider(notion_config)
    result = await provider.authenticate()
    assert result is True
    assert provider.is_authenticated()


@pytest.mark.asyncio
async def test_notion_create_task(notion_config):
    """Test creating a task in Notion."""
    provider = NotionProvider(notion_config)
    await provider.authenticate()
    
    response = await provider.send_message(
        recipient_id="notion_db_id",
        content="New task for Notion",
        metadata={"priority": "High"}
    )
    
    assert response.success is True
    assert "page_id" in response.data
    assert response.data["title"] == "New task for Notion"


@pytest.mark.asyncio
async def test_notion_update_task_status(notion_config):
    """Test updating task status in Notion."""
    provider = NotionProvider(notion_config)
    await provider.authenticate()
    
    response = await provider.update_task_status(
        page_id="page_123",
        status="Done"
    )
    
    assert response.success is True
    assert response.data["status"] == "Done"


@pytest.mark.asyncio
async def test_notion_credentials_validation_invalid():
    """Test Notion with invalid credentials."""
    provider = NotionProvider({})
    result = await provider.authenticate()
    assert result is False


# ============================================================================
# ClickUp Provider Tests
# ============================================================================

@pytest.mark.asyncio
async def test_clickup_provider_initialization(clickup_config):
    """Test ClickUp provider initialization."""
    provider = ClickUpProvider(clickup_config)
    assert provider.channel == ChannelType.CLICKUP
    assert provider.clickup_team_id == "team_id_123"


@pytest.mark.asyncio
async def test_clickup_provider_authentication(clickup_config):
    """Test ClickUp provider authentication."""
    provider = ClickUpProvider(clickup_config)
    result = await provider.authenticate()
    assert result is True
    assert provider.is_authenticated()


@pytest.mark.asyncio
async def test_clickup_create_task(clickup_config):
    """Test creating a task in ClickUp."""
    provider = ClickUpProvider(clickup_config)
    await provider.authenticate()
    
    response = await provider.send_message(
        recipient_id="list_123",
        content="New task for ClickUp",
        metadata={"priority": 1, "due_date": "2024-12-31"}
    )
    
    assert response.success is True
    assert "task_id" in response.data


@pytest.mark.asyncio
async def test_clickup_update_task_status(clickup_config):
    """Test updating task status in ClickUp."""
    provider = ClickUpProvider(clickup_config)
    await provider.authenticate()
    
    response = await provider.update_task_status(
        task_id="task_123",
        status="done"
    )
    
    assert response.success is True
    assert response.data["status"] == "done"


# ============================================================================
# Google Calendar Provider Tests
# ============================================================================

@pytest.mark.asyncio
async def test_google_calendar_provider_initialization(google_calendar_config):
    """Test Google Calendar provider initialization."""
    provider = GoogleCalendarProvider(google_calendar_config)
    assert provider.channel == ChannelType.GOOGLE_CALENDAR
    assert provider.user_email == "test@example.com"


@pytest.mark.asyncio
async def test_google_calendar_authentication(google_calendar_config):
    """Test Google Calendar provider authentication."""
    provider = GoogleCalendarProvider(google_calendar_config)
    result = await provider.authenticate()
    assert result is True
    assert provider.is_authenticated()


@pytest.mark.asyncio
async def test_google_calendar_create_event(google_calendar_config):
    """Test creating a calendar event."""
    provider = GoogleCalendarProvider(google_calendar_config)
    await provider.authenticate()
    
    response = await provider.send_message(
        recipient_id="primary",
        content="Team meeting",
        metadata={"duration_minutes": 60}
    )
    
    assert response.success is True
    assert "event_id" in response.data
    assert response.data["title"] == "Team meeting"


@pytest.mark.asyncio
async def test_google_calendar_update_event(google_calendar_config):
    """Test updating a calendar event."""
    provider = GoogleCalendarProvider(google_calendar_config)
    await provider.authenticate()
    
    response = await provider.update_event(
        event_id="event_123",
        update_data={"summary": "Updated Meeting"}
    )
    
    assert response.success is True


# ============================================================================
# Rate Limiting Tests
# ============================================================================

@pytest.mark.asyncio
async def test_whatsapp_rate_limit_handling(whatsapp_config):
    """Test WhatsApp rate limiting."""
    provider = WhatsAppProvider(whatsapp_config)
    await provider.authenticate()
    
    result = await provider.handle_rate_limit()
    assert isinstance(result, bool)


@pytest.mark.asyncio
async def test_notion_rate_limit_handling(notion_config):
    """Test Notion rate limiting."""
    provider = NotionProvider(notion_config)
    await provider.authenticate()
    
    result = await provider.handle_rate_limit()
    assert isinstance(result, bool)


# ============================================================================
# Response Validation Tests
# ============================================================================

@pytest.mark.asyncio
async def test_whatsapp_response_validation(whatsapp_config):
    """Test WhatsApp response validation."""
    provider = WhatsAppProvider(whatsapp_config)
    await provider.authenticate()
    
    valid_response = {"status": "queued"}
    assert await provider.validate_response(valid_response)
    
    invalid_response = {"status": "failed"}
    assert not await provider.validate_response(invalid_response)


@pytest.mark.asyncio
async def test_notion_response_validation(notion_config):
    """Test Notion response validation."""
    provider = NotionProvider(notion_config)
    await provider.authenticate()
    
    valid_response = {"object": "page"}
    assert await provider.validate_response(valid_response)
    
    invalid_response = {"object": "invalid"}
    assert not await provider.validate_response(invalid_response)


@pytest.mark.asyncio
async def test_clickup_response_validation(clickup_config):
    """Test ClickUp response validation."""
    provider = ClickUpProvider(clickup_config)
    await provider.authenticate()
    
    valid_response = {"task": {"id": "task_123"}}
    assert await provider.validate_response(valid_response)
    
    valid_response_list = {"tasks": []}
    assert await provider.validate_response(valid_response_list)


# ============================================================================
# Error Handling Tests
# ============================================================================

@pytest.mark.asyncio
async def test_provider_error_handling_on_send():
    """Test error handling when sending messages."""
    provider = WhatsAppProvider({})
    response = await provider.send_message("", "")
    
    assert response.success is False
    assert response.error is not None


@pytest.mark.asyncio
async def test_provider_sync_error_handling(whatsapp_config):
    """Test error handling during sync."""
    provider = WhatsAppProvider(whatsapp_config)
    await provider.authenticate()
    
    response = await provider.sync_data("invalid_sync_type")
    assert isinstance(response, ProviderResponse)


# ============================================================================
# Provider Response Model Tests
# ============================================================================

def test_provider_response_success():
    """Test ProviderResponse with success."""
    response = ProviderResponse(
        success=True,
        message="Operation successful",
        data={"key": "value"}
    )
    assert response.success is True
    assert response.message == "Operation successful"
    assert response.data["key"] == "value"


def test_provider_response_error():
    """Test ProviderResponse with error."""
    response = ProviderResponse(
        success=False,
        message="Operation failed",
        error="Some error occurred"
    )
    assert response.success is False
    assert response.error == "Some error occurred"


# ============================================================================
# Provider Message Model Tests
# ============================================================================

def test_provider_message_creation(sample_message):
    """Test ProviderMessage creation."""
    assert sample_message.channel == ChannelType.WHATSAPP
    assert sample_message.message_type == MessageType.INCOMING
    assert sample_message.sender_id == "+1234567890"
    assert sample_message.content == "Send MRR to investor tomorrow"
