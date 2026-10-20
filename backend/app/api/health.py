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
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

@router.post("/seed")
def trigger_seed(db: Session = Depends(get_db)):
    """Seeds database with initial verified opportunities, demo accounts, books, and mentors."""
    result = seed_database(db)
    return result

@router.get("/gemini-check")
async def gemini_check():
    """Diagnostic endpoint to test live Gemini connectivity and return non-sensitive diagnostic status."""
    import httpx
    clean_key = settings.GEMINI_API_KEY.strip().strip('"').strip("'").strip()
    if not clean_key:
        return {"configured": False, "is_working": False, "detail": "GEMINI_API_KEY is not set or empty"}

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={clean_key}"
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post(
                url,
                json={"contents": [{"parts": [{"text": "Reply with only the word OK"}]}]}
            )
            is_ok = res.status_code == 200
            preview = ""
            if is_ok:
                try:
                    data = res.json()
                    preview = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                except Exception:
                    preview = "Success (could not parse candidate text)"
            else:
                try:
                    preview = res.text[:200]
                except Exception:
                    preview = f"HTTP {res.status_code}"

            return {
                "configured": True,
                "key_prefix": clean_key[:6] + "..." if len(clean_key) > 6 else "short",
                "key_length": len(clean_key),
                "google_status_code": res.status_code,
                "is_working": is_ok,
                "google_response": preview
            }
    except Exception as e:
        return {
            "configured": True,
            "key_prefix": clean_key[:6] + "..." if len(clean_key) > 6 else "short",
            "is_working": False,
            "error": str(e)
        }

