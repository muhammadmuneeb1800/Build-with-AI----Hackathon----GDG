from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.action import ActionRead


class CommitmentCreateRequest(BaseModel):
    text: str = Field(min_length=3, max_length=5000)


class CommitmentStatusUpdateRequest(BaseModel):
    status: Literal['pending', 'done', 'missed']


class CommitmentRead(BaseModel):
    id: str
    content: str
    task: str
    deadline: datetime | None
    priority: str
    status: str
    created_at: datetime
    actions: list[ActionRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class RiskSummary(BaseModel):
    commitment_id: str
    task: str
    reason: str
    priority: str
    deadline: datetime | None = None
    action_text: str


class RiskResponse(BaseModel):
    overdue: list[RiskSummary]
    high_priority_pending: list[RiskSummary]
    generated_at: datetime


class DailyBriefResponse(BaseModel):
    top_priorities: list[str]
    risks: list[str]
    suggested_actions: list[str]
    generated_at: datetime