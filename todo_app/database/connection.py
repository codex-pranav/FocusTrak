import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Local SQLite database destination
DB_DIR = os.path.join(os.path.expanduser("~"), ".local", "share", "ubuntu_todo_app")
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "production.db")

DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}, 
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    """Create all local SQLite tables based on SQLAlchemy models."""
    from .models import User, Task, Category, Note, Attachment, Tag, Settings, Statistics, Reminder, Session
    Base.metadata.create_all(bind=engine)

def get_db():
    """Context manager style database session dispenser."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
