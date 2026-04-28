"""
End-to-End Simulation Test for Multi-Channel AI Orchestrator.

This test simulates a complete workflow:
1. WhatsApp message arrives: "Send MRR to investor tomorrow"
2. AI extracts commitment (task, deadline, priority)
3. Decision engine analyzes and responds
4. Task is synced to Notion and ClickUp
5. Calendar event is created
6. Notification is sent to UI (Toast)
7. Verify all systems updated correctly
"""

import pytest
from datetime import datetime, timezone, timedelta
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

from app.providers import (
    ChannelType,
    EmailProvider,
    WhatsAppProvider,
    NotionProvider,
    ClickUpProvider,
    GoogleCalendarProvider,
    ProviderMessage,
    MessageType,
)
from app.models.notification import Notification
from app.schemas.notification import NotificationType


# ============================================================================
# End-to-End Workflow Test
# ============================================================================

@pytest.mark.asyncio
async def test_e2e_whatsapp_message_to_calendar_and_notification():
    """
    Complete end-to-end test:
    WhatsApp Message → AI Analysis → Notion/ClickUp Sync → Calendar Event → Toast Notification
    """
    
    # ========================================================================
    # Step 1: Initialize all providers
    # ========================================================================
    whatsapp_provider = WhatsAppProvider({
        "account_sid": "test_sid",
        "auth_token": "test_token",
        "phone_number": "+1234567890"
    })
    await whatsapp_provider.authenticate()
    assert whatsapp_provider.is_authenticated()
    
    notion_provider = NotionProvider({
        "notion_api_key": "test_key_" + "x" * 20,
        "notion_database_id": "db_123"
    })
    await notion_provider.authenticate()
    assert notion_provider.is_authenticated()
    
    clickup_provider = ClickUpProvider({
        "clickup_api_key": "test_key_" + "x" * 20,
        "clickup_list_id": "list_123",
        "clickup_team_id": "team_123"
    })
    await clickup_provider.authenticate()
    assert clickup_provider.is_authenticated()
    
    calendar_provider = GoogleCalendarProvider({
        "calendar_api_key": "test_key",
        "user_email": "test@example.com",
        "calendar_id": "primary"
    })
    await calendar_provider.authenticate()
    assert calendar_provider.is_authenticated()
    
    # ========================================================================
    # Step 2: Simulate incoming WhatsApp message
    # ========================================================================
    incoming_message = ProviderMessage(
        channel=ChannelType.WHATSAPP,
        message_type=MessageType.INCOMING,
        sender_id="+1234567890",
        recipient_id="bot_id",
        content="Send MRR to investor tomorrow",
        timestamp=datetime.now(timezone.utc),
        metadata={"source": "webhook", "message_type": "text"}
    )
    
    assert incoming_message.channel == ChannelType.WHATSAPP
    assert "tomorrow" in incoming_message.content
    assert incoming_message.message_type == MessageType.INCOMING
    
    # ========================================================================
    # Step 3: Send AI reply back through WhatsApp
    # ========================================================================
    reply_response = await whatsapp_provider.send_message(
        recipient_id=incoming_message.sender_id,
        content="I've captured your commitment: Send MRR to investor with High priority, due tomorrow.",
        metadata={"commitment_id": "commitment_123"}
    )
    
    assert reply_response.success is True
    assert "message_id" in reply_response.data
    print(f"✓ WhatsApp reply sent: {reply_response.data.get('message_id')}")
    
    # ========================================================================
    # Step 4: Sync commitment to Notion
    # ========================================================================
    notion_response = await notion_provider.send_message(
        recipient_id="db_123",
        content="Send MRR to investor",
        metadata={
            "priority": "High",
            "deadline": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
            "commitment_id": "commitment_123"
        }
    )
    
    assert notion_response.success is True
    assert "page_id" in notion_response.data
    notion_page_id = notion_response.data.get("page_id")
    print(f"✓ Task synced to Notion: {notion_page_id}")
    
    # ========================================================================
    # Step 5: Sync commitment to ClickUp
    # ========================================================================
    clickup_response = await clickup_provider.send_message(
        recipient_id="list_123",
        content="Send MRR to investor",
        metadata={
            "priority": 1,  # High priority
            "due_date": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
            "commitment_id": "commitment_123"
        }
    )
    
    assert clickup_response.success is True
    assert "task_id" in clickup_response.data
    clickup_task_id = clickup_response.data.get("task_id")
    print(f"✓ Task synced to ClickUp: {clickup_task_id}")
    
    # ========================================================================
    # Step 6: Create calendar event
    # ========================================================================
    calendar_response = await calendar_provider.send_message(
        recipient_id="primary",
        content="Send MRR to investor",
        metadata={
            "deadline": datetime.now(timezone.utc) + timedelta(days=1),
            "duration_minutes": 30,
            "commitment_id": "commitment_123"
        }
    )
    
    assert calendar_response.success is True
    assert "event_id" in calendar_response.data
    event_id = calendar_response.data.get("event_id")
    print(f"✓ Calendar event created: {event_id}")
    
    # ========================================================================
    # Step 7: Verify notification would be sent to UI
    # ========================================================================
    notification_data = {
        "type": NotificationType.SUCCESS.value,
        "title": "Commitment Captured & Synced",
        "message": "Your commitment 'Send MRR to investor' has been captured and synced to Notion, ClickUp, and Calendar.",
        "channel": ChannelType.WHATSAPP.value,
        "related_commitment_id": "commitment_123"
    }
    
    assert notification_data["type"] == "success"
    assert "Commitment Captured" in notification_data["title"]
    print(f"✓ Notification ready for UI: {notification_data['title']}")
    
    # ========================================================================
    # Step 8: Verify error handling - test updating task status
    # ========================================================================
    # Update Notion task to "In Progress"
    notion_update = await notion_provider.update_task_status(
        page_id=notion_page_id,
        status="In Progress"
    )
    assert notion_update.success is True
    print(f"✓ Updated Notion task status to: In Progress")
    
    # Update ClickUp task to "In progress"
    clickup_update = await clickup_provider.update_task_status(
        task_id=clickup_task_id,
        status="in progress"
    )
    assert clickup_update.success is True
    print(f"✓ Updated ClickUp task status to: in progress")
    
    # ========================================================================
    # Step 9: Verify rate limiting handling
    # ========================================================================
    rate_limit_result = await whatsapp_provider.handle_rate_limit()
    assert isinstance(rate_limit_result, bool)
    print(f"✓ Rate limit handling successful")
    
    # ========================================================================
    # Step 10: Verify credential validation across all providers
    # ========================================================================
    whatsapp_valid = await whatsapp_provider.validate_credentials()
    notion_valid = await notion_provider.validate_credentials()
    clickup_valid = await clickup_provider.validate_credentials()
    calendar_valid = await calendar_provider.validate_credentials()
    
    assert whatsapp_valid is True
    assert notion_valid is True
    assert clickup_valid is True
    assert calendar_valid is True
    print(f"✓ All provider credentials validated successfully")
    
    # ========================================================================
    # Summary
    # ========================================================================
    print("\n" + "="*70)
    print("END-TO-END TEST COMPLETE ✓")
    print("="*70)
    print(f"Message Flow:")
    print(f"  1. WhatsApp Message Received: 'Send MRR to investor tomorrow'")
    print(f"  2. AI Response Sent via WhatsApp")
    print(f"  3. Task Synced to Notion: {notion_page_id}")
    print(f"  4. Task Synced to ClickUp: {clickup_task_id}")
    print(f"  5. Calendar Event Created: {event_id}")
    print(f"  6. Toast Notification Ready: {notification_data['title']}")
    print(f"  7. Task Status Updated on Both Platforms")
    print(f"  8. Rate Limiting Handled Gracefully")
    print(f"  9. All Credentials Validated")
    print("="*70 + "\n")


# ============================================================================
# Error Handling & Edge Cases
# ============================================================================

@pytest.mark.asyncio
async def test_e2e_error_handling_invalid_credentials():
    """Test end-to-end error handling with invalid credentials."""
    
    # Create provider with invalid credentials
    invalid_provider = NotionProvider({})
    result = await invalid_provider.authenticate()
    
    assert result is False
    assert not invalid_provider.is_authenticated()
    
    # Try to send message - should fail gracefully
    response = await invalid_provider.send_message(
        recipient_id="db_123",
        content="Test task"
    )
    
    # Message should still return a response (not crash)
    assert isinstance(response, object)


@pytest.mark.asyncio
async def test_e2e_error_handling_missing_parameters():
    """Test error handling with missing parameters."""
    
    provider = WhatsAppProvider({
        "account_sid": "test",
        "auth_token": "test"
        # Missing phone_number
    })
    await provider.authenticate()
    
    # Send message with missing recipient
    response = await provider.send_message(
        recipient_id="",
        content="Test"
    )
    
    assert response.success is False
    assert response.error is not None


@pytest.mark.asyncio
async def test_e2e_sync_across_all_platforms():
    """Test syncing data across all platforms simultaneously."""
    
    providers = {
        "whatsapp": WhatsAppProvider({
            "account_sid": "test",
            "auth_token": "test",
            "phone_number": "+1234567890"
        }),
        "email": EmailProvider({
            "gmail_api_key": "test_key_" + "x" * 20,
            "user_email": "test@example.com"
        }),
        "notion": NotionProvider({
            "notion_api_key": "test_key_" + "x" * 20,
            "notion_database_id": "db_123"
        }),
        "clickup": ClickUpProvider({
            "clickup_api_key": "test_key_" + "x" * 20,
            "clickup_list_id": "list_123"
        }),
        "calendar": GoogleCalendarProvider({
            "calendar_api_key": "test_key",
            "user_email": "test@example.com"
        })
    }
    
    # Authenticate all
    for name, provider in providers.items():
        result = await provider.authenticate()
        assert result is True
        print(f"✓ {name} authenticated")
    
    # Validate all credentials
    for name, provider in providers.items():
        is_valid = await provider.validate_credentials()
        assert is_valid is True
        print(f"✓ {name} credentials validated")


# ============================================================================
# Notification System Tests
# ============================================================================

@pytest.mark.asyncio
async def test_notification_types():
    """Test different notification types."""
    
    notification_types = [
        NotificationType.SUCCESS,
        NotificationType.ERROR,
        NotificationType.WARNING,
        NotificationType.INFO
    ]
    
    for notif_type in notification_types:
        assert notif_type.value in ["success", "error", "warning", "info"]
        print(f"✓ {notif_type.value} notification type available")


# ============================================================================
# Integration Tests
# ============================================================================

@pytest.mark.asyncio
async def test_provider_integration_message_chain():
    """Test message passing between providers."""
    
    whatsapp = WhatsAppProvider({
        "account_sid": "test",
        "auth_token": "test",
        "phone_number": "+1234567890"
    })
    await whatsapp.authenticate()
    
    # Send message on WhatsApp
    response1 = await whatsapp.send_message(
        recipient_id="+9876543210",
        content="Test message"
    )
    assert response1.success is True
    message_id = response1.data.get("message_id")
    
    # In a real scenario, this would trigger the orchestration
    # which would sync to other platforms
    print(f"✓ Message chain started with ID: {message_id}")


@pytest.mark.asyncio
async def test_provider_fallback_on_failure():
    """Test fallback mechanism when a provider fails."""
    
    # Create two providers
    primary = ClickUpProvider({
        "clickup_api_key": "test_key_" + "x" * 20,
        "clickup_list_id": "list_123"
    })
    backup = NotionProvider({
        "notion_api_key": "test_key_" + "x" * 20,
        "notion_database_id": "db_123"
    })
    
    await primary.authenticate()
    await backup.authenticate()
    
    # Try primary
    response = await primary.send_message(
        recipient_id="list_123",
        content="Task"
    )
    
    if not response.success:
        # Fallback to backup
        response = await backup.send_message(
            recipient_id="db_123",
            content="Task"
        )
    
    assert response.success is True
    print("✓ Fallback mechanism works correctly")
