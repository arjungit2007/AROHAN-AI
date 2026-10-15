import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

db_url = settings.DATABASE_URL
# Automatically normalize postgres:// (used by Render, Supabase, Neon, Railway) to postgresql://
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    # If using relative sqlite path like sqlite:///./arohan.db, resolve to consistent root arohan.db
    if db_url.startswith("sqlite:///./") or db_url == "sqlite:///arohan.db":
        db_filename = db_url.split("///")[-1].lstrip("./")
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
        backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        root_db_path = os.path.join(root_dir, db_filename)
        backend_db_path = os.path.join(backend_dir, db_filename)

        if os.path.exists(root_db_path):
            db_path = root_db_path
        elif os.path.exists(backend_db_path):
            db_path = backend_db_path
        else:
            db_path = root_db_path

        normalized_path = db_path.replace("\\", "/")
        db_url = f"sqlite:///{normalized_path}"

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
