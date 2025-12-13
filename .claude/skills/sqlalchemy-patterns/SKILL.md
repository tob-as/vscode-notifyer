---
name: sqlalchemy-patterns
description: SQLAlchemy ORM models, database setup, relationships, session management. Use when creating database models, setting up SQLAlchemy, or working with SQLite databases.
allowed-tools: WebFetch, Read, Grep, Glob
last_verified: "2025-12-13"
target_versions:
  sqlalchemy: "2.x"
  python: "3.11+"
---

# SQLAlchemy Standards

SQLAlchemy with SQLite.

## When to Use This Skill

- Creating SQLAlchemy models
- Setting up database connections
- Working with relationships
- Managing database sessions
- Need to check latest SQLAlchemy patterns

## Fetch Latest Docs When Needed

If unsure about current best practices, fetch from:
- **SQLAlchemy ORM**: https://docs.sqlalchemy.org/en/20/orm/
- **Declarative Base**: https://docs.sqlalchemy.org/en/20/orm/declarative_styles.html
- **Relationships**: https://docs.sqlalchemy.org/en/20/orm/relationships.html
- **Sessions**: https://docs.sqlalchemy.org/en/20/orm/session.html

## Database Setup

```python
# db/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## Model Pattern

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    name = Column(String, nullable=False)
    status = Column(String, default="pending")

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", back_populates="items")
```

## Rules

- Always include `id`, `created_at`, `updated_at`
- Export all models from `models/__init__.py`
- Use `nullable=False` for required fields
- Relations need `back_populates` on both sides

## Verify Existing Models

```bash
# Find model definitions
grep -r "class.*Base" models/ --include="*.py"

# Find relationships
grep -r "relationship" models/ --include="*.py"

# Find column definitions
grep -r "Column" models/ --include="*.py"
```

## Do Not

- No raw SQL unless necessary
- No missing timestamps
- No bare `except:` clauses
