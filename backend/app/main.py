import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from starlette.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database
from app.api import (
    auth,
    students,
    ai,
    roadmaps,
    opportunities,
    books,
    mentors,
    facilitator,
    health
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist & seed initial data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        print(f"Startup seed notice: {e}")
    finally:
        db.close()

    from app.services.ai_provider import get_ai_provider
    provider = get_ai_provider()
    is_demo = "Demo" in provider.__class__.__name__
    print(f"[AROHAN AI] Server startup complete: Database connected, AI Provider={provider.__class__.__name__} (is_demo_mode={is_demo})")

    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AROHAN AI — Rural Indian student career discovery, roadmaps, verified opportunities, BookBridge, and Arohan Connect mentorship.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
clean_origins = [o for o in origins if o != "*"]
if not clean_origins:
    clean_origins = ["https://arohan-phi.vercel.app", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=clean_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler for unhandled exceptions to avoid leaking tracebacks
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log exception safely on server
    print(f"Unhandled Exception: {type(exc).__name__}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again shortly."}
    )

# Include API v1 Routers
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(students.router, prefix=api_v1)
app.include_router(ai.router, prefix=api_v1)
app.include_router(roadmaps.router, prefix=api_v1)
app.include_router(opportunities.router, prefix=api_v1)
app.include_router(books.router, prefix=api_v1)
app.include_router(mentors.router, prefix=api_v1)
app.include_router(facilitator.router, prefix=api_v1)
app.include_router(health.router, prefix=api_v1)

@app.get("/health")
def root_health():
    return {"status": "healthy"}

# Mount frontend build if dist directory exists
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist):
    @app.middleware("http")
    async def spa_fallback_middleware(request: Request, call_next):
        response = await call_next(request)
        if response.status_code == 404 and not request.url.path.startswith(("/api", "/docs", "/openapi.json", "/health", "/assets")):
            index_file = os.path.join(frontend_dist, "index.html")
            if os.path.exists(index_file):
                return FileResponse(index_file)
        return response

    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
else:
    @app.get("/")
    def root():
        return {
            "message": "Welcome to AROHAN AI API",
            "tagline": "Every dream deserves a pathway.",
            "docs": "/docs",
            "health": f"{api_v1}/health"
        }
