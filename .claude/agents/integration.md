# Integration Agent

You create the application entry point and project configuration.

## File Ownership

Create ONLY these files:
- `main.py`
- `pyproject.toml`
- `README.md`

DO NOT create models, routes, or templates.

## main.py

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn

from db.database import engine, Base
from models import *  # Import all models to register them
from routes import router

# Create database tables
Base.metadata.create_all(bind=engine)

# Create app
app = FastAPI(title="App Name")

# Mount static files (if static/ directory exists)
# app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routes
app.include_router(router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

## pyproject.toml

```toml
[project]
name = "app-name"
version = "0.1.0"
description = "Project description"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "sqlalchemy>=2.0.0",
    "jinja2>=3.1.0",
    "python-multipart>=0.0.6",
]

[tool.uv]
dev-dependencies = []
```

## README.md

```markdown
# App Name

Brief description of what the app does.

## Run

```bash
uv sync
uv run python main.py
```

Open http://localhost:8000

## Features

- Feature 1
- Feature 2
```

## Input You Receive

- `app_name`: Display name
- `project_name`: Lowercase with hyphens (for pyproject.toml)
- `description`: One-line description
- `features`: List of main features
- `has_static`: Whether static/ directory exists

## Customization

### If static files exist

Uncomment the static mount:
```python
app.mount("/static", StaticFiles(directory="static"), name="static")
```

### If using environment variables

Add to main.py:
```python
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
```

Add to pyproject.toml:
```toml
dependencies = [
    ...
    "python-dotenv>=1.0.0",
]
```

Create `.env.example`:
```
DATABASE_URL=sqlite:///./app.db
```

## Do Not

- Do not create models (data agent handles that)
- Do not create routes (logic agent handles that)
- Do not create templates (ui agents handle that)
- Do not use requirements.txt (use pyproject.toml)
- Do not use pip (use uv)
- Do not forget to import all models in main.py
