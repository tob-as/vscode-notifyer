# SQLAlchemy Standards

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

## Model Structure

```python
# models/item.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from db.database import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Fields
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)

    # Foreign key
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    # Relationship
    category = relationship("Category", back_populates="items")
```

## Models Init

```python
# models/__init__.py
from .item import Item
from .category import Category

__all__ = ["Item", "Category"]
```

## Common Field Types

```python
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, Date

# Primary key
id = Column(Integer, primary_key=True, index=True)

# Strings
name = Column(String, nullable=False)
email = Column(String, unique=True, nullable=False)
description = Column(Text, nullable=True)

# Numbers
amount = Column(Float, nullable=False)
quantity = Column(Integer, default=0)

# Boolean
is_active = Column(Boolean, default=True)
is_approved = Column(Boolean, default=False)

# Dates
created_at = Column(DateTime, default=datetime.utcnow)
due_date = Column(Date, nullable=True)

# With default
status = Column(String, default="pending")
```

## Relationships

### One-to-Many

```python
# Category has many Items
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    items = relationship("Item", back_populates="category")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))

    category = relationship("Category", back_populates="items")
```

### Many-to-Many

```python
from sqlalchemy import Table

item_tags = Table(
    "item_tags",
    Base.metadata,
    Column("item_id", Integer, ForeignKey("items.id")),
    Column("tag_id", Integer, ForeignKey("tags.id")),
)


class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True)
    tags = relationship("Tag", secondary=item_tags, back_populates="items")


class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True)
    items = relationship("Item", secondary=item_tags, back_populates="tags")
```

## Queries

```python
from sqlalchemy.orm import Session

# Get all
items = db.query(Item).all()

# Get by ID
item = db.query(Item).filter(Item.id == item_id).first()

# Filter
active_items = db.query(Item).filter(Item.is_active == True).all()
pending = db.query(Item).filter(Item.status == "pending").all()

# Order
recent = db.query(Item).order_by(Item.created_at.desc()).all()

# Limit
top_5 = db.query(Item).order_by(Item.amount.desc()).limit(5).all()

# Count
count = db.query(Item).filter(Item.is_active == True).count()

# With relationship
items = db.query(Item).filter(Item.category_id == category_id).all()
```

## CRUD Operations

```python
# Create
item = Item(name="Test", amount=100.0)
db.add(item)
db.commit()
db.refresh(item)  # Get updated fields like id

# Update
item.name = "Updated"
db.commit()

# Delete
db.delete(item)
db.commit()
```

## Create Tables

In main.py:

```python
from db.database import engine, Base
from models import *  # Import all models

# Create tables on startup
Base.metadata.create_all(bind=engine)
```

## Do Not

- Do not use raw SQL unless absolutely necessary
- Do not forget `nullable=False` for required fields
- Do not skip `created_at` and `updated_at` on models
- Do not use `db.commit()` without error handling in complex operations
- Do not forget to import models in `models/__init__.py`
