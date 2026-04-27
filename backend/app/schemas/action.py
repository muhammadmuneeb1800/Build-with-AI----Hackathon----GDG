from datetime import datetime

from pydantic import BaseModel


class ActionRead(BaseModel):
    id: str
    commitment_id: str
    action_text: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}