from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.commitment import CommitmentCreateRequest, CommitmentRead, CommitmentStatusUpdateRequest
from app.services.commitment_service import (
    create_commitment,
    list_commitments,
    serialize_commitment,
    update_commitment_status,
)


router = APIRouter(tags=["commitments"])


@router.post("/commitment/add", response_model=CommitmentRead, status_code=status.HTTP_201_CREATED)
def add_commitment(payload: CommitmentCreateRequest, db: Session = Depends(get_db)):
    try:
        commitment = create_commitment(db, payload)
        return serialize_commitment(commitment)
    except Exception as exc:  # pragma: no cover - defensive boundary
        raise HTTPException(status_code=500, detail="Failed to create commitment") from exc


@router.get("/commitments", response_model=list[CommitmentRead])
def get_commitments(db: Session = Depends(get_db)):
    return [serialize_commitment(commitment) for commitment in list_commitments(db)]


@router.patch('/commitments/{commitment_id}/status', response_model=CommitmentRead)
def patch_commitment_status(
    commitment_id: str,
    payload: CommitmentStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    try:
        commitment = update_commitment_status(db, commitment_id, payload)
        return serialize_commitment(commitment)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail='Commitment not found') from exc