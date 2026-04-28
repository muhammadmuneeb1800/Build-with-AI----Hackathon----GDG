from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.integration import Integration
from app.providers import ClickUpProvider, EmailProvider, GoogleCalendarProvider, NotionProvider, WhatsAppProvider
from app.schemas.integration import (
    IntegrationConnectRequest,
    IntegrationDisconnectRequest,
    IntegrationRead,
    IntegrationTestConnectionRequest,
    IntegrationTestConnectionResponse,
    IntegrationUpdateRequest,
)

router = APIRouter(tags=["integrations"], prefix="/integrations")

DISPLAY_NAMES = {
    "whatsapp": "WhatsApp",
    "email": "Email (Gmail/SMTP)",
    "notion": "Notion",
    "clickup": "ClickUp",
    "calendar": "Google Calendar",
}

SUPPORTED_TYPES = tuple(DISPLAY_NAMES.keys())


def _serialize(item: Integration) -> IntegrationRead:
    return IntegrationRead(
        id=item.id,
        userId=item.user_id,
        type=item.type,  # type: ignore[arg-type]
        displayName=item.display_name,
        isConnected=item.is_connected,
        credentials=item.credentials or {},
        config=item.config or {},
        lastSynced=item.last_synced,
        createdAt=item.created_at,
        updatedAt=item.updated_at,
    )


def _provider_config(integration_type: str, credentials: dict[str, str]) -> dict:
    if integration_type == "whatsapp":
        api_key = credentials.get("whatsapp_api_key", "")
        return {
            "account_sid": credentials.get("account_sid") or api_key or "placeholder_sid",
            "auth_token": credentials.get("auth_token") or api_key or "placeholder_token",
            "phone_number": credentials.get("phone_number", ""),
        }
    if integration_type == "email":
        token = credentials.get("gmail_api_key") or credentials.get("app_password", "")
        return {
            "gmail_api_key": token,
            "user_email": credentials.get("user_email", ""),
        }
    if integration_type == "notion":
        return {
            "notion_api_key": credentials.get("notion_api_key", ""),
            "notion_database_id": credentials.get("notion_database_id", ""),
        }
    if integration_type == "clickup":
        return {
            "clickup_api_key": credentials.get("clickup_api_key", ""),
            "clickup_list_id": credentials.get("clickup_list_id", ""),
            "clickup_team_id": credentials.get("clickup_team_id", ""),
        }
    if integration_type == "calendar":
        return {
            "calendar_api_key": credentials.get("calendar_api_key", ""),
            "user_email": credentials.get("user_email", ""),
            "calendar_id": credentials.get("calendar_id", "primary"),
        }
    return credentials


async def _validate_credentials(integration_type: str, credentials: dict[str, str]) -> tuple[bool, str]:
    config = _provider_config(integration_type, credentials)
    provider = None

    if integration_type == "whatsapp":
        provider = WhatsAppProvider(config)
    elif integration_type == "email":
        provider = EmailProvider(config)
    elif integration_type == "notion":
        provider = NotionProvider(config)
    elif integration_type == "clickup":
        provider = ClickUpProvider(config)
    elif integration_type == "calendar":
        provider = GoogleCalendarProvider(config)

    if provider is None:
        return False, "Unsupported integration type"

    authenticated = await provider.authenticate()
    if not authenticated:
        return False, "Authentication failed with provided credentials"

    valid = await provider.validate_credentials()
    if not valid:
        return False, "Credentials are invalid or incomplete"

    return True, "Connection test passed"


@router.get("", response_model=list[IntegrationRead])
def get_integrations(db: Session = Depends(get_db)):
    stored = db.query(Integration).all()
    existing_by_type = {item.type: item for item in stored}

    results: list[Integration] = []
    now = datetime.now(timezone.utc)
    for integration_type in SUPPORTED_TYPES:
        existing = existing_by_type.get(integration_type)
        if existing is not None:
            results.append(existing)
            continue

        fresh = Integration(
            user_id="default_user",
            type=integration_type,
            display_name=DISPLAY_NAMES[integration_type],
            is_connected=False,
            credentials={},
            config={},
            last_synced=None,
            created_at=now,
            updated_at=now,
        )
        db.add(fresh)
        results.append(fresh)

    db.commit()
    for item in results:
        db.refresh(item)

    return [_serialize(item) for item in results]


@router.post("/test-connection", response_model=IntegrationTestConnectionResponse)
async def test_connection(payload: IntegrationTestConnectionRequest):
    valid, message = await _validate_credentials(payload.type, payload.credentials)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )
    return IntegrationTestConnectionResponse(success=True, message=message)


@router.post("/connect", response_model=IntegrationRead)
async def connect_integration(payload: IntegrationConnectRequest, db: Session = Depends(get_db)):
    valid, message = await _validate_credentials(payload.type, payload.credentials)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    item = db.query(Integration).filter(Integration.type == payload.type).first()
    if item is None:
        item = Integration(
            user_id="default_user",
            type=payload.type,
            display_name=DISPLAY_NAMES[payload.type],
        )
        db.add(item)

    item.is_connected = True
    item.credentials = payload.credentials
    item.last_synced = datetime.now(timezone.utc)

    db.commit()
    db.refresh(item)
    return _serialize(item)


@router.post("/disconnect", response_model=IntegrationRead)
def disconnect_integration(payload: IntegrationDisconnectRequest, db: Session = Depends(get_db)):
    item = db.query(Integration).filter(Integration.type == payload.type).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")

    item.is_connected = False
    item.credentials = {}
    item.last_synced = None
    db.commit()
    db.refresh(item)
    return _serialize(item)


@router.patch("/{integration_type}", response_model=IntegrationRead)
def update_integration(integration_type: str, payload: IntegrationUpdateRequest, db: Session = Depends(get_db)):
    item = db.query(Integration).filter(Integration.type == integration_type).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")

    item.config = payload.config
    db.commit()
    db.refresh(item)
    return _serialize(item)


@router.post("/{integration_type}/sync", response_model=IntegrationRead)
def sync_integration(integration_type: str, db: Session = Depends(get_db)):
    item = db.query(Integration).filter(Integration.type == integration_type).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
    if not item.is_connected:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Integration is not connected")

    item.last_synced = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return _serialize(item)
