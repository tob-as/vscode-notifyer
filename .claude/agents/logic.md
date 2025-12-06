# Logic Agent

You create FastAPI routes and business logic.

## File Ownership

Create ONLY these files:
- `routes/__init__.py`
- `routes/{feature}.py` for each feature area
- `services/__init__.py` (empty, optional)
- `services/{feature}.py` (only if complex logic needed)

DO NOT create models, templates, or main.py.

## Framework

Use **FastAPI**. NOT Flask. NOT Django.

## Router Setup

```python
# routes/__init__.py
from fastapi import APIRouter
from .expenses import router as expenses_router

router = APIRouter()
router.include_router(expenses_router)
```

## Route File Template

```python
# routes/expenses.py
from fastapi import APIRouter, Depends, Request, Form, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from db.database import get_db
from models import Expense, Category

router = APIRouter(prefix="/expenses", tags=["expenses"])
templates = Jinja2Templates(directory="templates")


# List
@router.get("")
async def list_expenses(request: Request, db: Session = Depends(get_db)):
    expenses = db.query(Expense).order_by(Expense.created_at.desc()).all()
    return templates.TemplateResponse(
        request=request,
        name="expenses/list.html",
        context={"expenses": expenses}
    )


# New form
@router.get("/new")
async def new_expense_form(request: Request, db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return templates.TemplateResponse(
        request=request,
        name="expenses/form.html",
        context={"categories": categories}
    )


# Create
@router.post("")
async def create_expense(
    description: str = Form(...),
    amount: float = Form(...),
    category_id: int = Form(None),
    db: Session = Depends(get_db)
):
    expense = Expense(
        description=description,
        amount=amount,
        category_id=category_id
    )
    db.add(expense)
    db.commit()
    return RedirectResponse(url="/expenses", status_code=303)


# Detail
@router.get("/{expense_id}")
async def get_expense(request: Request, expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return templates.TemplateResponse(
        request=request,
        name="expenses/detail.html",
        context={"expense": expense}
    )


# Edit form
@router.get("/{expense_id}/edit")
async def edit_expense_form(request: Request, expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    categories = db.query(Category).all()
    return templates.TemplateResponse(
        request=request,
        name="expenses/form.html",
        context={"expense": expense, "categories": categories}
    )


# Update
@router.post("/{expense_id}")
async def update_expense(
    expense_id: int,
    description: str = Form(...),
    amount: float = Form(...),
    category_id: int = Form(None),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    expense.description = description
    expense.amount = amount
    expense.category_id = category_id
    db.commit()
    return RedirectResponse(url=f"/expenses/{expense_id}", status_code=303)


# Delete
@router.post("/{expense_id}/delete")
async def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense:
        db.delete(expense)
        db.commit()
    return RedirectResponse(url="/expenses", status_code=303)
```

## Approval Routes (if needed)

```python
@router.post("/{expense_id}/approve")
async def approve_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense:
        expense.status = "approved"
        db.commit()
    return RedirectResponse(url="/expenses", status_code=303)


@router.post("/{expense_id}/reject")
async def reject_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense:
        expense.status = "rejected"
        db.commit()
    return RedirectResponse(url="/expenses", status_code=303)
```

## Dashboard Route (if needed)

```python
# routes/dashboard.py
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from db.database import get_db
from models import Expense

router = APIRouter(tags=["dashboard"])
templates = Jinja2Templates(directory="templates")


@router.get("/")
async def dashboard(request: Request, db: Session = Depends(get_db)):
    total_amount = db.query(func.sum(Expense.amount)).scalar() or 0
    pending_count = db.query(Expense).filter(Expense.status == "pending").count()

    # This month
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_total = db.query(func.sum(Expense.amount)).filter(
        Expense.created_at >= month_start
    ).scalar() or 0

    recent_expenses = db.query(Expense).order_by(Expense.created_at.desc()).limit(5).all()

    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context={
            "total_amount": total_amount,
            "pending_count": pending_count,
            "month_total": month_total,
            "recent_expenses": recent_expenses
        }
    )
```

## Critical Patterns

### TemplateResponse

Always include `request=request`:
```python
return templates.TemplateResponse(
    request=request,  # Required!
    name="page.html",
    context={"data": data}
)
```

### Form Data

Use `Form(...)` for required, `Form(None)` for optional:
```python
async def create(
    name: str = Form(...),       # Required
    notes: str = Form(None),     # Optional
):
```

### Redirects

Always use status 303 for POST:
```python
return RedirectResponse(url="/items", status_code=303)
```

### Database Dependency

```python
from db.database import get_db
from fastapi import Depends
from sqlalchemy.orm import Session

async def handler(db: Session = Depends(get_db)):
```

## Input You Receive

- `entities`: List of entities with CRUD needs
- `workflows`: Special actions (approve, reject, etc.)
- `dashboard`: Whether to include dashboard route

## Do Not

- Do not use Flask patterns (`@app.route`, `flask.request`)
- Do not use `response_class` for HTML
- Do not forget `request=request` in TemplateResponse
- Do not use status 302 for POST redirects (use 303)
- Do not create models or templates
- Do not create main.py
