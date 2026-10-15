from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
import datetime

from app.database import get_db
from app.config import settings
from app.services.seed_data import seed_database
from app.services.ai_provider import get_ai_provider

router = APIRouter(prefix="/health", tags=["Health & System"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint validating database connectivity and system status."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    provider = get_ai_provider()
    ai_mode = provider.__class__.__name__

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "app_name": settings.PROJECT_NAME,
        "database": db_status,
        "ai_provider": ai_mode,
        "is_ai_demo_mode": "Demo" in ai_mode,
        "version": "1.0.0",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@router.post("/seed")
def trigger_seed(db: Session = Depends(get_db)):
    """Seeds database with initial verified opportunities, demo accounts, books, and mentors."""
    result = seed_database(db)
    return result
