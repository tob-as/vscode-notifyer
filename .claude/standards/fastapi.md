# FastAPI Standards

## Framework

Use FastAPI. NOT Flask, NOT Django.

## Project Structure

```
routes/
  __init__.py      # Exports router
  items.py         # Feature routes
services/
  __init__.py
  items.py         # Business logic (optional)
```

## Router Setup

```python
# routes/__init__.py
from fastapi import APIRouter
from .items import router as items_router

router = APIRouter()
router.include_router(items_router)
```

```python
# routes/items.py
from fastapi import APIRouter, Depends, Request, Form
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from db.database import get_db
from models import Item

router = APIRouter(prefix="/items", tags=["items"])
```

## Route Patterns

### List View

```python
@router.get("")
async def list_items(request: Request, db: Session = Depends(get_db)):
    items = db.query(Item).all()
    return templates.TemplateResponse(
        request=request,
        name="items/list.html",
        context={"items": items}
    )
```

### Detail View

```python
@router.get("/{item_id}")
async def get_item(request: Request, item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return templates.TemplateResponse(
        request=request,
        name="items/detail.html",
        context={"item": item}
    )
```

### Create Form

```python
@router.get("/new")
async def new_item_form(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="items/form.html",
        context={}
    )
```

### Create Handler

```python
@router.post("")
async def create_item(
    name: str = Form(...),
    amount: float = Form(...),
    db: Session = Depends(get_db)
):
    item = Item(name=name, amount=amount)
    db.add(item)
    db.commit()
    return RedirectResponse(url="/items", status_code=303)
```

### Update Handler

```python
@router.post("/{item_id}")
async def update_item(
    item_id: int,
    name: str = Form(...),
    amount: float = Form(...),
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.name = name
    item.amount = amount
    db.commit()
    return RedirectResponse(url=f"/items/{item_id}", status_code=303)
```

### Delete Handler

```python
@router.post("/{item_id}/delete")
async def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return RedirectResponse(url="/items", status_code=303)
```

## Templates Setup

```python
# In main.py or routes file
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")
```

Pass `request` to every template response:
```python
templates.TemplateResponse(
    request=request,  # Required
    name="page.html",
    context={"data": data}
)
```

## Form Handling

Use `Form(...)` for required fields, `Form(None)` for optional:

```python
from fastapi import Form

@router.post("")
async def create(
    name: str = Form(...),           # Required
    description: str = Form(None),   # Optional
    amount: float = Form(...),
):
    ...
```

## Redirects

Always use status code 303 for POST redirects:

```python
from fastapi.responses import RedirectResponse

return RedirectResponse(url="/items", status_code=303)
```

## Database Dependency

```python
from db.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

@router.get("")
async def list_items(db: Session = Depends(get_db)):
    ...
```

## Error Handling

```python
from fastapi import HTTPException

if not item:
    raise HTTPException(status_code=404, detail="Not found")
```

## Do Not

- Do not use Flask patterns (`@app.route`, `flask.request`)
- Do not use `response_class` for HTML (use TemplateResponse)
- Do not forget `request=request` in TemplateResponse
- Do not use status 302 for POST redirects (use 303)
- Do not put business logic in routes (use services/ if complex)
