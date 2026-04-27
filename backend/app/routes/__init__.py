from fastapi import APIRouter

from app.routes.ai import router as ai_router
from app.routes.commitments import router as commitments_router

api_router = APIRouter()
api_router.include_router(commitments_router)
api_router.include_router(ai_router)

__all__ = ["api_router"]