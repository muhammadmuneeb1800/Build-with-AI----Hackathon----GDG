# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           ToastProvider (React Context)              │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │   NotificationCenter Component                │  │  │
│  │  │   - Displays notifications                    │  │  │
│  │  │   - Mark as read/unread                       │  │  │
│  │  │   - Delete notifications                      │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  useNotification() Hook → Show Toast                 │  │
│  │  useNotifications() Hook → Fetch from Backend        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↑↓ API Calls
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI + Python)                 │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         OrchestrationService (Main Hub)              │  │
│  │                                                      │  │
│  │  Manages 5 Provider Instances:                      │  │
│  │  ├─ WhatsApp (Twilio)                               │  │
│  │  ├─ Email (Gmail)                                   │  │
│  │  ├─ Notion                                          │  │
│  │  ├─ ClickUp                                         │  │
│  │  └─ Google Calendar                                 │  │
│  │                                                      │  │
│  │  Core Functions:                                    │  │
│  │  ├─ process_incoming_message()                      │  │
│  │  ├─ _sync_commitment_to_tasks()                     │  │
│  │  ├─ _create_calendar_event()                        │  │
│  │  ├─ _send_notification()                            │  │
│  │  └─ validate_all_providers()                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                              ↓                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Decision Engine + AI Service               │  │
│  │  ├─ extract_commitment()    (AI)                     │  │
│  │  ├─ analyze_risk()          (AI)                     │  │
│  │  └─ generate_daily_brief()  (AI)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                              ↓                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Routes (FastAPI)                    │  │
│  │  ├─ GET    /notifications                           │  │
│  │  ├─ POST   /notifications                           │  │
│  │  ├─ PATCH  /notifications/{id}                      │  │
│  │  ├─ DELETE /notifications/{id}                      │  │
│  │  ├─ POST   /notifications/mark-all-read             │  │
│  │  └─ (Existing commitment routes)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                              ↓                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         SQLAlchemy Database Layer                    │  │
│  │  ├─ Commitments Table                               │  │
│  │  ├─ Notifications Table (NEW)                       │  │
│  │  └─ Actions Table                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
        ↑↓ Network Calls         ↑↓ Network Calls
┌──────────────────┬──────────────────┬──────────────────┐
│  WhatsApp API    │   Gmail API      │  Notion API      │
│  (Twilio)        │  (Google)        │                  │
│                  │                  │                  │
└──────────────────┴──────────────────┴──────────────────┘

┌──────────────────┬──────────────────┐
│   ClickUp API    │ Google Calendar  │
│                  │     API          │
└──────────────────┴──────────────────┘
```

## Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   Incoming Message Flow                         │
└─────────────────────────────────────────────────────────────────┘

1. USER (External)
   │
   │ Sends WhatsApp message: "Send MRR to investor tomorrow"
   │
   ▼
2. WHATSAPP PROVIDER
   │ receive_messages() → ProviderMessage
   │
   ▼
3. ORCHESTRATION SERVICE
   │ process_incoming_message()
   │
   ▼
4. AI SERVICE (Gemini)
   │ extract_commitment()
   │ Returns: {task, deadline, priority}
   │
   ▼
5. COMMITMENT SERVICE
   │ create_commitment()
   │ Stores in database
   │
   ├──────────────────────────────────┐
   │        PARALLEL OPERATIONS        │
   │                                  │
   ├─→ WHATSAPP PROVIDER             │
   │   send_message() - reply sent    │
   │                                  │
   ├─→ NOTION PROVIDER               │
   │   send_message() - task created  │
   │                                  │
   ├─→ CLICKUP PROVIDER              │
   │   send_message() - task created  │
   │                                  │
   ├─→ CALENDAR PROVIDER             │
   │   send_message() - event created │
   │                                  │
   └─→ DATABASE                       │
       _send_notification()           │
       - notification stored          │
   │
   ▼
6. FRONTEND
   │ useNotifications() polls /notifications
   │ Receives notification data
   │
   ▼
7. TOAST COMPONENT
   │ Displays: "Commitment synced to Notion, ClickUp, Calendar"
   │
   ▼
8. USER
   │ Sees green success toast in top-right corner
```

## Provider Pattern Detail

```
┌──────────────────────────────────────────────────────────────┐
│              BaseProvider (Abstract Class)                   │
│                                                              │
│  Abstract Methods:                                          │
│  ├─ authenticate()                                          │
│  ├─ receive_messages()                                      │
│  ├─ send_message(recipient, content, metadata)             │
│  ├─ sync_data(sync_type)                                   │
│  ├─ validate_credentials()                                  │
│  ├─ handle_rate_limit()                                    │
│  └─ validate_response(response)                            │
│                                                              │
│  Concrete Implementations:                                  │
│  ├─────────────────┬─────────────────┬─────────────────┐   │
│  │  WhatsApp       │  Email          │  Notion         │   │
│  │  (Twilio)       │  (Gmail)        │                 │   │
│  ├─────────────────┼─────────────────┼─────────────────┤   │
│  │  Backoff: 5s    │  Backoff: 10s   │  Backoff: 1s    │   │
│  │  Rate: unlimited│  Rate: 1000/day │  Rate: 3/sec    │   │
│  └─────────────────┴─────────────────┴─────────────────┘   │
│                                                              │
│  ├─────────────────┬─────────────────┐                     │
│  │  ClickUp        │  Calendar       │                     │
│  │                 │  (Google)       │                     │
│  ├─────────────────┼─────────────────┤                     │
│  │  Backoff: 2s    │  Backoff: 1s    │                     │
│  │  Rate: 100/min  │  Rate: 1M/day   │                     │
│  └─────────────────┴─────────────────┘                     │
└──────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────┐
│         Provider Method Called          │
└──────────────────┬──────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Try Execute        │
         └────────┬────────────┘
                  │
         ┌────────┴─────────┐
         │                  │
    SUCCESS            FAILURE
    (Return data)      (Catch exception)
         │                  │
         │                  ▼
         │         ┌─────────────────────┐
         │         │ Validate Error      │
         │         │ - Invalid token?    │
         │         │ - Rate limited?     │
         │         │ - Invalid params?   │
         │         └────────┬────────────┘
         │                  │
         │                  ▼
         │         ┌─────────────────────┐
         │         │ Return ProviderResp │
         │         │ {                   │
         │         │   success: False,   │
         │         │   error: "...",     │
         │         │   message: "..."    │
         │         │ }                   │
         │         └────────┬────────────┘
         │                  │
         └──────────┬───────┘
                    │
                    ▼
         ┌─────────────────────┐
         │ Log Error           │
         │ Send Notification   │
         │ Continue (Fallback) │
         └─────────────────────┘
```

## Database Schema

```
┌──────────────────────────┐
│     commitments          │
├──────────────────────────┤
│ id (UUID)                │
│ content (TEXT)           │
│ task (TEXT)              │
│ deadline (DATETIME)      │
│ priority (STR)           │
│ status (STR)             │
│ created_at (DATETIME)    │
└──────────────────────────┘
         ↓ Relations
┌──────────────────────────┐     ┌──────────────────────────┐
│     actions              │     │  notifications (NEW)     │
├──────────────────────────┤     ├──────────────────────────┤
│ id (UUID)                │     │ id (UUID)                │
│ commitment_id (FK)       │     │ type (STR) [SUCCESS,ERR] │
│ action_text (TEXT)       │     │ title (STR)              │
│ status (STR)             │     │ message (TEXT)           │
│ created_at (DATETIME)    │     │ channel (STR)            │
└──────────────────────────┘     │ is_read (BOOL)           │
                                 │ related_commitment_id (FK)
                                 │ created_at (DATETIME)    │
                                 └──────────────────────────┘
```

## Testing Coverage

```
┌─────────────────────────────────────────┐
│          Test Suite Structure           │
├─────────────────────────────────────────┤
│  test_providers.py (40+ tests)          │
│  ├─ WhatsApp Provider Tests             │
│  │  ├─ Initialization                   │
│  │  ├─ Authentication                   │
│  │  ├─ Send Message                     │
│  │  ├─ Error Handling                   │
│  │  └─ Rate Limiting                    │
│  ├─ Email Provider Tests                │
│  ├─ Notion Provider Tests               │
│  ├─ ClickUp Provider Tests              │
│  └─ Google Calendar Tests               │
│                                         │
│  test_e2e_simulation.py (9+ tests)      │
│  ├─ Complete Workflow                   │
│  │  ├─ WhatsApp msg in                  │
│  │  ├─ AI analysis                      │
│  │  ├─ Notion sync                      │
│  │  ├─ ClickUp sync                     │
│  │  ├─ Calendar event                   │
│  │  ├─ Toast notification               │
│  │  └─ Status update                    │
│  ├─ Error Scenarios                     │
│  └─ Integration Tests                   │
└─────────────────────────────────────────┘

Coverage: ~85% of critical paths
Execution Time: ~15 seconds
```

---

**System fully documented** ✓
