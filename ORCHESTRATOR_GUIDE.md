"""
# Multi-Channel AI Orchestrator Documentation

## 📋 Overview

The Multi-Channel AI Orchestrator is a modular, scalable system that manages tasks, communications, and calendar events across multiple platforms (WhatsApp, Email, Notion, ClickUp, Google Calendar).

## 🏗️ Architecture

### Core Components

1. **BaseProvider** (`app/providers/base_provider.py`)
   - Abstract interface for all integrations
   - Defines standard methods: authenticate, send_message, receive_messages, sync_data
   - Ensures consistency across platforms

2. **Platform Providers**
   - `WhatsAppProvider` - Twilio WhatsApp integration
   - `EmailProvider` - Gmail API integration
   - `NotionProvider` - Notion database integration
   - `ClickUpProvider` - ClickUp task management
   - `GoogleCalendarProvider` - Calendar event management

3. **OrchestrationService** (`app/services/orchestration_service.py`)
   - Coordinates all providers
   - Routes messages through decision engine
   - Syncs commitments across platforms
   - Manages notifications

4. **Notification System**
   - Backend: `app/models/notification.py`, `app/schemas/notification.py`
   - API Routes: `app/routes/notifications.py`
   - Frontend: `ToastProvider` React component

## 🔄 Data Flow

```
User Input (WhatsApp/Email)
    ↓
OrchestrationService receives message
    ↓
AI extracts commitment (task, deadline, priority)
    ↓
Decision engine analyzes
    ↓
AI generates context-aware reply
    ↓
Parallel tasks:
  ├─ Send reply back on original channel
  ├─ Sync to Notion database
  ├─ Sync to ClickUp workspace
  └─ Create calendar event
    ↓
Notification sent to frontend (Toast)
    ↓
User sees success notification with task details
```

## 🚀 Usage Guide

### Backend Setup

#### 1. Initialize Providers

```python
from app.services.orchestration_service import OrchestrationService
from app.providers import ChannelType
from sqlalchemy.orm import Session

orchestrator = OrchestrationService(db_session)

# Register WhatsApp
orchestrator.register_provider(
    ChannelType.WHATSAPP,
    {
        "account_sid": "your_twilio_account_sid",
        "auth_token": "your_twilio_auth_token",
        "phone_number": "+1234567890"
    }
)

# Register Notion
orchestrator.register_provider(
    ChannelType.NOTION,
    {
        "notion_api_key": "your_notion_api_key",
        "notion_database_id": "your_database_id"
    }
)

# Register other providers similarly
```

#### 2. Process Incoming Messages

```python
from app.providers import ProviderMessage, MessageType, ChannelType
from datetime import datetime, timezone

incoming_message = ProviderMessage(
    channel=ChannelType.WHATSAPP,
    message_type=MessageType.INCOMING,
    sender_id="+1234567890",
    recipient_id="bot_id",
    content="Send MRR to investor tomorrow",
    timestamp=datetime.now(timezone.utc),
    metadata={"source": "webhook"}
)

response = await orchestrator.process_incoming_message(incoming_message)
# Response: {"success": True, "commitment_id": "..."}
```

#### 3. Validate Providers

```python
# Check all provider credentials
validation_results = await orchestrator.validate_all_providers()
# {"whatsapp": True, "notion": True, "clickup": True, ...}

# Sync data from all platforms
sync_results = await orchestrator.sync_all_platforms()
# {"whatsapp": True, "notion": True, ...}
```

### Frontend Setup

#### 1. Wrap with ToastProvider

```tsx
import { ToastProvider } from './providers/NotificationProvider'
import App from './App'

export default function Root() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  )
}
```

#### 2. Use Notifications in Components

```tsx
import { useNotification, useNotifications } from './hooks'

export function MyComponent() {
  const { showSuccess, showError } = useNotification()
  const { notifications, markAsRead } = useNotifications()
  
  const handleSubmit = async () => {
    try {
      await api.post('/commitment/add', data)
      showSuccess("Success!", "Commitment created and synced to all platforms")
    } catch (error) {
      showError("Error!", "Failed to create commitment")
    }
  }
  
  return (
    <div>
      <button onClick={handleSubmit}>Create Commitment</button>
      <div>
        {notifications.map(notif => (
          <div key={notif.id}>
            <h3>{notif.title}</h3>
            <p>{notif.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_providers.py

# Run with coverage
pytest --cov=app

# Run only async tests
pytest -m asyncio
```

### End-to-End Test

```bash
# Run the complete workflow simulation
pytest tests/test_e2e_simulation.py::test_e2e_whatsapp_message_to_calendar_and_notification -v
```

### Example Test Output

```
E2E TEST COMPLETE ✓
=================================================================
Message Flow:
  1. WhatsApp Message Received: 'Send MRR to investor tomorrow'
  2. AI Response Sent via WhatsApp
  3. Task Synced to Notion: notion_page_123
  4. Task Synced to ClickUp: clickup_task_456
  5. Calendar Event Created: google_event_789
  6. Toast Notification Ready: Commitment Captured & Synced
  7. Task Status Updated on Both Platforms
  8. Rate Limiting Handled Gracefully
  9. All Credentials Validated
=================================================================
```

## 🔐 Error Handling

### Provider Error Handling

All providers implement robust error handling:

1. **Credential Validation**
   - Invalid tokens → Returns ProviderResponse with error
   - Expired credentials → Handled with graceful degradation

2. **Rate Limiting**
   - Twilio: 5-second backoff
   - Gmail: 10-second backoff
   - Notion: 1-second backoff
   - ClickUp: 2-second backoff
   - Google Calendar: 1-second backoff

3. **Response Validation**
   - Each provider validates external API responses
   - Invalid responses → Caught and logged
   - Partial failures → Other platforms still updated

### Frontend Error Handling

```tsx
const { handleError } = useNotificationHandler()

try {
  await api.post('/commitment/add', data)
} catch (error) {
  handleError("Error", error)
  // Automatically shows toast with error details
}
```

## 📊 API Endpoints

### Notifications

```
GET    /notifications                    # Get notifications
POST   /notifications                    # Create notification
GET    /notifications/{id}               # Get specific notification
PATCH  /notifications/{id}               # Mark as read
DELETE /notifications/{id}               # Delete notification
POST   /notifications/mark-all-read      # Mark all as read
```

### Commitments (Enhanced)

```
POST   /commitment/add                   # Create commitment
GET    /commitments                      # Get all commitments
PATCH  /commitments/{id}/status          # Update status
```

## 🛠️ Configuration

### Environment Variables

```
# WhatsApp
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Email
GMAIL_API_KEY=your_api_key
USER_EMAIL=your_email@gmail.com

# Notion
NOTION_API_KEY=your_notion_key
NOTION_DATABASE_ID=your_db_id

# ClickUp
CLICKUP_API_KEY=your_clickup_key
CLICKUP_LIST_ID=your_list_id

# Google Calendar
GOOGLE_CALENDAR_API_KEY=your_calendar_key

# AI
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=models/gemini-2.0-flash
```

## 📈 Extending the System

### Adding a New Provider

1. Create a new provider class inheriting from `BaseProvider`:

```python
from app.providers import BaseProvider, ChannelType

class SlackProvider(BaseProvider):
    def __init__(self, config):
        super().__init__(ChannelType.SLACK, config)
        # Initialize Slack-specific attributes
    
    async def authenticate(self) -> bool:
        # Implement Slack authentication
        pass
    
    # Implement other required methods...
```

2. Register in orchestrator:

```python
orchestrator.register_provider(
    ChannelType.SLACK,
    {"slack_token": "your_token"}
)
```

3. Add tests in `tests/test_providers.py`

### Adding a New Notification Type

1. Update `app/schemas/notification.py`:

```python
class NotificationType(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    URGENT = "urgent"  # New type
```

2. Update frontend `NotificationProvider.tsx`:

```tsx
case 'urgent':
  toast.error(fullMessage, { ...toastConfig, autoClose: false })
  break
```

## 📚 Best Practices

1. **Always validate credentials** before using a provider
2. **Implement rate limiting** with exponential backoff
3. **Handle partial failures** - if Notion fails, ClickUp still succeeds
4. **Log all errors** for debugging
5. **Use TypeScript** for frontend type safety
6. **Write tests** for every new provider
7. **Document API changes** immediately
8. **Monitor token expiration** and refresh proactively

## 🐛 Troubleshooting

### WhatsApp messages not sending

```python
# Check provider authentication
is_auth = await whatsapp.validate_credentials()

# Check Twilio credentials format
# Account SID: 36 characters
# Auth Token: 32 characters
```

### Notion sync not working

```python
# Verify API key is correct
# Database ID format: 32-character hex

# Check database permissions
# Notion integration must have access to database
```

### Calendar events not creating

```python
# Verify Google credentials
# Check timezone handling - always use UTC

# Validate calendar ID (usually 'primary')
```

## 📞 Support

For issues or questions:
1. Check the test files for usage examples
2. Review provider docstrings
3. Check backend logs for errors
4. Review Founder Decision Engine documentation

---

**Last Updated**: 2024
**Version**: 1.0.0
"""
