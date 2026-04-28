# Build With AI — Multi-Channel AI Orchestrator

A demonstration project that captures commitments from multiple communication channels (WhatsApp, Email), extracts structured tasks using AI, syncs tasks to productivity platforms (Notion, ClickUp), creates calendar events (Google Calendar), and exposes notifications and APIs for a frontend UI.

## Highlights
- Multi-channel ingestion: WhatsApp, Email (simulated providers)
- AI extraction: simple extraction service to parse commitments and deadlines
- Task sync: Notion and ClickUp providers (simulated)
- Calendar integration: Google Calendar provider (simulated)
- Backend: FastAPI + SQLAlchemy
- Frontend: React + Vite + TypeScript

## Tech Stack
- Backend: Python 3.10+, FastAPI, SQLAlchemy
- Frontend: React 18, TypeScript, Vite
- Tests: pytest (async tests)
- Dev & tooling: Poetry/pyproject or pip (see backend/pyproject.toml)

## Repository layout
- `backend/` — FastAPI application, providers, services, models, tests
- `frontend/` — React + Vite single-page app

## Quick setup
Prerequisites: Python 3.10+, Node 18+, npm/yarn

Backend

```powershell
cd backend
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt  # or use pyproject/poetry
uvicorn app.main:app --reload
```

Frontend

```bash
cd frontend
npm install
npm run dev
```

## Tests
Run backend tests:

```bash
cd backend
pytest -q
```

## Architecture
See `project_summary.md` for an executive summary and diagrams (Mermaid). A `scripts/generate_summary_pdf.py` helper can convert the summary markdown into a simple PDF for presentations.

## Contributing
- Fixes should prefer structured logging over prints.
- Keep provider implementations stubbed and secure secrets via environment variables.

## Next steps
- Replace simulated provider requests with real API integrations and add secure credential management.
- Add CI for tests and linting for both frontend and backend.
