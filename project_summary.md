<!-- Project summary with architecture diagram (Mermaid) -->

# Project Summary — Build With AI

## One-line summary
Multi-channel AI Orchestrator: captures user commitments across channels, extracts structured tasks, syncs them to productivity platforms, schedules calendar events, and surfaces notifications to the UI.

## Goals
- Demonstrate ingestion from chat/email
- Use a lightweight AI service to extract structured commitments
- Keep provider implementations modular and testable

## Components
- Backend: FastAPI application that exposes API routes, services, and provider abstractions
- Frontend: React app for displaying commitments and notifications
- Providers: ClickUp, Notion, Google Calendar, WhatsApp, Email (each implements send/receive/validate)

## Flow (high-level)
```mermaid
flowchart LR
  A[User Message (WhatsApp/Email)] --> B[Backend Ingest]
  B --> C[AI Extraction Service]
  C --> D[Create Commitment (DB)]
  D --> E[Sync to Notion/ClickUp]
  D --> F[Create Calendar Event]
  E --> G[Provider APIs]
  F --> G
  G --> H[Notification Stored]
  H --> I[Frontend Notification Center]
```

## Diagrams
- See the above Mermeid diagram for the core flow.

## Operational notes
- Use environment variables for API keys.
- Replace simulated provider logic with real HTTP client usage and retry/backoff.
- Use structured logging (the backend uses `logging`) and configure level in production.

## How to produce a PDF summary
1. Install `reportlab` in your Python environment: `pip install reportlab`
2. Run: `python scripts/generate_summary_pdf.py`
