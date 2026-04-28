# 🚀 Multi-Channel AI Orchestrator - Quick Start

## In 5 Minutes

### Backend - Start Using Orchestrator

```python
# 1. Initialize
from app.services.orchestration_service import OrchestrationService
from app.providers import ChannelType
from app.db.session import get_db

db = next(get_db())
orchestrator = OrchestrationService(db)

# 2. Register Providers
await orchestrator.register_provider(
    ChannelType.WHATSAPP,
    {"account_sid": "...", "auth_token": "...", "phone_number": "..."}
)
await orchestrator.register_provider(
    ChannelType.NOTION,
    {"notion_api_key": "...", "notion_database_id": "..."}
)

# 3. Process Message
from app.providers import ProviderMessage, MessageType
from datetime import datetime, timezone

message = ProviderMessage(
    channel=ChannelType.WHATSAPP,
    message_type=MessageType.INCOMING,
    sender_id="+1234567890",
    content="Send MRR to investor tomorrow",
    timestamp=datetime.now(timezone.utc)
)

result = await orchestrator.process_incoming_message(message)
# Automatically:
# ✓ Extracts commitment
# ✓ Sends AI reply
# ✓ Syncs to Notion & ClickUp
# ✓ Creates calendar event
# ✓ Sends notification
```

### Frontend - Show Notifications

```tsx
// 1. Wrap app with provider
<ToastProvider>
  <App />
</ToastProvider>

// 2. Use in component
const { showSuccess, showError } = useNotification()

// 3. Show toast
showSuccess("Done!", "Commitment created and synced")
// Toast appears automatically in top-right corner
```

## 🧪 Test Everything

```bash
# Run all tests
pytest

# Run e2e simulation (WhatsApp → Calendar → Toast)
pytest tests/test_e2e_simulation.py::test_e2e_whatsapp_message_to_calendar_and_notification -v
```

## 📋 What Works

✅ WhatsApp messages trigger workflow
✅ AI extracts tasks and deadlines
✅ Tasks sync to Notion and ClickUp
✅ Calendar events auto-created
✅ Toast notifications appear
✅ All errors handled gracefully
✅ Rate limiting implemented
✅ Credentials validated
✅ 40+ tests passing

## 🔌 Add a New Platform

```python
# 1. Create provider
class SlackProvider(BaseProvider):
    async def authenticate(self): ...
    async def send_message(self, ...): ...
    # Implement all abstract methods

# 2. Register
orchestrator.register_provider(
    ChannelType.SLACK,
    {"slack_token": "..."}
)

# 3. Use in workflow - automatically syncs!
```

## 📊 Architecture Overview

```
WhatsApp → Orchestrator → Notion
                      ├→ ClickUp
                      ├→ Calendar
                      └→ Toast
```

Each step has error handling, validation, and fallbacks.

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `app/providers/base_provider.py` | Interface for all providers |
| `app/services/orchestration_service.py` | Coordinates everything |
| `frontend/src/providers/NotificationProvider.tsx` | Toast notifications |
| `tests/test_e2e_simulation.py` | Complete workflow test |

## 💡 Common Tasks

### Send notification
```python
await orchestrator._send_notification(
    NotificationType.SUCCESS,
    "Task Created",
    "Your commitment has been captured"
)
```

### Update task status
```python
await notion_provider.update_task_status("page_id", "Done")
```

### Validate all credentials
```python
results = await orchestrator.validate_all_providers()
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| NotFound error | Check API keys in `.env` |
| Rate limit | Built-in backoff handles it |
| Toast not showing | Ensure `<ToastProvider>` wraps app |
| Test fails | Run `pytest -v -s` for detailed output |

## 📚 More Info

- `ORCHESTRATOR_GUIDE.md` - Detailed documentation
- `IMPLEMENTATION_COMPLETE.md` - Full feature list
- Provider docstrings - API reference
- `tests/` - Usage examples

---

**Ready to go!** 🎉
