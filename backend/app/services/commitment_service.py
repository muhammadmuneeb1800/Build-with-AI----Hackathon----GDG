from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.action import Action
from app.models.commitment import Commitment
from app.schemas.commitment import CommitmentCreateRequest, CommitmentStatusUpdateRequest
from app.services.ai_service import analyze_risk, extract_commitment, generate_daily_brief


def serialize_commitment(commitment: Commitment) -> dict[str, object]:
    return {
        "id": commitment.id,
        "content": commitment.content,
        "task": commitment.task,
        "deadline": commitment.deadline,
        "priority": commitment.priority,
        "status": commitment.status,
        "created_at": commitment.created_at,
        "actions": [
            {
                "id": action.id,
                "commitment_id": action.commitment_id,
                "action_text": action.action_text,
                "status": action.status,
                "created_at": action.created_at,
            }
            for action in commitment.actions
        ],
    }


def create_commitment(db: Session, payload: CommitmentCreateRequest) -> Commitment:
    structured = extract_commitment(payload.text)
    commitment = Commitment(
        content=str(structured["content"]),
        task=str(structured["task"]),
        deadline=structured["deadline"],
        priority=str(structured["priority"]),
        status=str(structured["status"]),
    )
    db.add(commitment)
    db.flush()

    action = Action(
        commitment_id=commitment.id,
        action_text=f"Review and progress: {commitment.task}",
        status="pending",
    )
    db.add(action)
    db.commit()
    db.refresh(commitment)
    return commitment


def update_commitment_status(db: Session, commitment_id: str, payload: CommitmentStatusUpdateRequest) -> Commitment:
    commitment = db.get(Commitment, commitment_id)
    if commitment is None:
        raise LookupError('Commitment not found')

    commitment.status = payload.status
    db.commit()
    db.refresh(commitment)
    return commitment


def list_commitments(db: Session) -> list[Commitment]:
    return db.query(Commitment).order_by(Commitment.created_at.desc()).all()


def build_risk_payload(db: Session) -> dict[str, object]:
    commitments = [serialize_commitment(commitment) for commitment in list_commitments(db)]
    return analyze_risk(commitments)


def build_daily_brief_payload(db: Session) -> dict[str, object]:
    commitments = [serialize_commitment(commitment) for commitment in list_commitments(db)]
    return generate_daily_brief(commitments)