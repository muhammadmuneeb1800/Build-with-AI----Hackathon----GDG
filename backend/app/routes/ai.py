from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.commitment import DailyBriefResponse, RiskResponse
from app.services.commitment_service import build_daily_brief_payload, build_risk_payload


router = APIRouter(tags=["ai"])


@router.get("/risks", response_model=RiskResponse)
def get_risks(db: Session = Depends(get_db)):
    payload = build_risk_payload(db)
    return {
        "overdue": payload["overdue"],
        "high_priority_pending": payload["high_priority_pending"],
        "generated_at": payload.get("generated_at") or datetime.now(timezone.utc),
    }


@router.get("/daily-brief", response_model=DailyBriefResponse)
def get_daily_brief(db: Session = Depends(get_db)):
    payload = build_daily_brief_payload(db)
    return {
        "top_priorities": payload["top_priorities"],
        "risks": payload["risks"],
        "suggested_actions": payload["suggested_actions"],
        "generated_at": payload.get("generated_at") or datetime.now(timezone.utc),
    }