from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

IntegrationType = Literal["whatsapp", "email", "notion", "clickup", "calendar"]


class IntegrationRead(BaseModel):
    id: str
    userId: str
    type: IntegrationType
    displayName: str
    isConnected: bool
    credentials: dict = Field(default_factory=dict)
    config: dict = Field(default_factory=dict)
    lastSynced: datetime | None = None
    createdAt: datetime
    updatedAt: datetime


class IntegrationConnectRequest(BaseModel):
    type: IntegrationType
    credentials: dict[str, str] = Field(default_factory=dict)


class IntegrationDisconnectRequest(BaseModel):
    type: IntegrationType


class IntegrationUpdateRequest(BaseModel):
    config: dict = Field(default_factory=dict)


class IntegrationTestConnectionRequest(BaseModel):
    type: IntegrationType
    credentials: dict[str, str] = Field(default_factory=dict)


class IntegrationTestConnectionResponse(BaseModel):
    success: bool
    message: str
    error: str | None = None
