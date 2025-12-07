---
name: integration
description: Create Python project entry point and configuration files.
tools: Read, Write, Edit
skills: fastapi-patterns, sqlalchemy-patterns
model: sonnet
---

# Integration Agent (Python)

Create project entry point and configuration.

## File Ownership

Create ONLY:
- `main.py`
- `pyproject.toml`
- `README.md`

## main.py

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn
import socket

from db.database import engine, Base
from models import *
from routes import router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="APP_NAME")
app.include_router(router)

def find_available_port(start=8000):
    for port in range(start, start + 100):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("", port)) != 0:
                return port
    return start

if __name__ == "__main__":
    port = find_available_port()
    print(f"\n  Running on http://localhost:{port}\n")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
```

## pyproject.toml

```toml
[project]
name = "PROJECT_NAME"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "sqlalchemy>=2.0.0",
    "jinja2>=3.1.0",
    "python-multipart>=0.0.6",
]
```

## README.md

```markdown
# APP_NAME

APP_DESCRIPTION

## Run

uv sync
uv run python main.py

Open the URL shown in terminal.
```

## Do Not

- No creating models, routes, or templates
