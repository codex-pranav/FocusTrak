import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from .connection import Base

# Association table for Task <-> Tag (Many-to-Many)
task_tags = Table(
    'task_tags',
    Base.metadata,
    Column('task_id', Integer, ForeignKey('tasks.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)

# Association table for Task <-> Task Dependencies (Self-Referential Many-to-Many)
task_dependencies = Table(
    'task_dependencies',
    Base.metadata,
    Column('task_id', Integer, ForeignKey('tasks.id', ondelete='CASCADE'), primary_key=True),
    Column('depends_on_id', Integer, ForeignKey('tasks.id', ondelete='CASCADE'), primary_key=True)
)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, default="ubuntu_user")
    email = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    settings = relationship("Settings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    color = Column(String, default="#6366f1") # HEX String
    icon = Column(String, default="Folder") # Lucide/Qt icon name

    tasks = relationship("Task", back_populates="category_rel")

class Tag(Base):
    __tablename__ = 'tags'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

class Task(Base):
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    
    title = Column(String, nullable=False)
    description = Column(String, default="")
    priority = Column(String, default="Medium") # Critical, High, Medium, Low
    status = Column(String, default="Pending") # Pending, In Progress, Completed, Cancelled, Archived
    
    due_date = Column(DateTime, nullable=True)
    due_time = Column(String, default="12:00")
    created_date = Column(DateTime, default=datetime.datetime.utcnow)
    completed_date = Column(DateTime, nullable=True)
    
    estimated_duration = Column(Integer, default=25) # In minutes
    actual_duration = Column(Integer, default=0) # In minutes
    
    reminder_interval = Column(String, default="none") # 5min, 15min, 30min, 1hr, 1day, custom
    repeat_cycle = Column(String, default="none") # none, daily, weekly, monthly
    notes = Column(String, default="")
    color = Column(String, default="#6366f1")
    
    pinned = Column(Boolean, default=False)
    favorite = Column(Boolean, default=False)
    recently_deleted = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="tasks")
    category_rel = relationship("Category", back_populates="tasks")
    attachments = relationship("Attachment", back_populates="task", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=task_tags)
    
    # Dependencies (Self-referential Many-to-Many)
    dependencies = relationship(
        'Task',
        secondary=task_dependencies,
        primaryjoin=(id == task_dependencies.c.task_id),
        secondaryjoin=(id == task_dependencies.c.depends_on_id),
        backref='dependent_on'
    )

class Attachment(Base):
    __tablename__ = 'attachments'
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey('tasks.id', ondelete='CASCADE'))
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    task = relationship("Task", back_populates="attachments")

class Note(Base):
    __tablename__ = 'notes'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    
    title = Column(String, default="Untitled Note")
    content = Column(String, default="") # Markdown/Plain text
    is_checklist = Column(Boolean, default=False)
    checklist_json = Column(String, default="[]") # Structured checklist JSON
    task_link_id = Column(Integer, ForeignKey('tasks.id', ondelete='SET NULL'), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notes")

class Settings(Base):
    __tablename__ = 'settings'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    
    theme = Column(String, default="dark") # dark, light
    accent_color = Column(String, default="#8b5cf6") # Hex color string
    font_size = Column(String, default="md") # sm, md, lg
    notifications_enabled = Column(Boolean, default=True)
    shortcuts_enabled = Column(Boolean, default=True)
    auto_backup = Column(Boolean, default=True)

    user = relationship("User", back_populates="settings")

class Statistics(Base):
    __tablename__ = 'statistics'
    id = Column(Integer, primary_key=True, index=True)
    total_completed = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_completed_date = Column(DateTime, nullable=True)

class Reminder(Base):
    __tablename__ = 'reminders'
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey('tasks.id', ondelete='CASCADE'))
    trigger_time = Column(DateTime, nullable=False)
    triggered = Column(Boolean, default=False)

class Session(Base):
    __tablename__ = 'sessions'
    id = Column(Integer, primary_key=True, index=True)
    session_type = Column(String, default="work") # work, break
    duration = Column(Integer, default=25) # duration in minutes
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)
