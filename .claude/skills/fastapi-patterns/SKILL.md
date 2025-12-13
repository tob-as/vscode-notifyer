---
name: fastapi-patterns
description: FastAPI route patterns with Jinja2 templates, dependency injection, form handling. Use when creating FastAPI routes, templates, or API endpoints. NOT Flask.
allowed-tools: WebFetch, Read, Grep, Glob
last_verified: "2025-12-13"
target_versions:
  fastapi: "0.11x"
  python: "3.11+"
---

# FastAPI Standards

FastAPI with Jinja2 templates. **NOT Flask.**

## When to Use This Skill

- Creating FastAPI routes or API endpoints
- Working with Jinja2 templates
- Handling form submissions
- Setting up dependency injection
- Need to verify latest FastAPI patterns

## Fetch Latest Docs When Needed

If unsure about current best practices, fetch from:
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Dependencies**: https://fastapi.tiangolo.com/tutorial/dependencies/
- **Templates**: https://fastapi.tiangolo.com/advanced/templates/
- **Forms**: https://fastapi.tiangolo.com/tutorial/request-forms/

## Structure

```
routes/
  __init__.py    # Exports router
  items.py       # Feature routes
templates/
  base.html
  items/
    list.html
    form.html
```

## Route Pattern

```python
from fastapi import APIRouter, Depends, Request, Form
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from db.database import get_db

router = APIRouter(prefix="/items", tags=["items"])
templates = Jinja2Templates(directory="templates")

@router.get("")
async def list_items(request: Request, db: Session = Depends(get_db)):
    items = db.query(Item).all()
    return templates.TemplateResponse(request=request, name="items/list.html", context={"items": items})

@router.post("")
async def create_item(name: str = Form(...), db: Session = Depends(get_db)):
    db.add(Item(name=name))
    db.commit()
    return RedirectResponse(url="/items", status_code=303)
```

## Rules

- Use `@router.get/post`, NOT `@app.route`
- Always pass `request=request` to TemplateResponse
- Use `Form(...)` for required, `Form(None)` for optional
- Redirects after POST use `status_code=303`
- Use `Depends(get_db)` for database sessions

## Verify Existing Patterns

```bash
# Find route patterns
grep -r "@router\." routes/ --include="*.py"

# Find template usage
grep -r "TemplateResponse" routes/ --include="*.py"

# Find dependency injection
grep -r "Depends" routes/ --include="*.py"
```

## Do Not

- No Flask patterns (`@app.route`, `flask.request`)
- No status 302 for POST redirects (use 303)
- No forgetting `request=request` in templates
