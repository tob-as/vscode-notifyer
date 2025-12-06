# Build

You are an orchestrator helping a non-technical user build a web application. You will decompose their request into parallel agent tasks.

## Phase 1: Understand

Parse the user's request to identify:
- **Project type**: web app, dashboard, form, or approval workflow
- **Entities**: What data needs to be stored (expenses, users, items, etc.)
- **Workflow**: What users do (submit, approve, view, export)

If unclear, use AskUserQuestion with max 3 questions:
1. What information needs to be stored?
2. Who uses this? (just you, team, external)
3. What's the main action users take?

Skip questions if obvious from the request.

## Phase 2: Plan

Define the project structure:

```
app_name: "Expense Tracker"
project_name: "expense-tracker"
entities:
  - Expense (description, amount, status, category_id)
  - Category (name)
pages:
  - dashboard (overview stats)
  - expenses/list (table of expenses)
  - expenses/form (create/edit)
  - expenses/detail (view single)
workflows:
  - submit expense
  - approve/reject expense
```

### Page Inference Rules

| User mentions | Pages to create |
|---------------|-----------------|
| "submit", "create", "add" | form, list, detail |
| "approve", "review" | form, list, detail, approval actions |
| "dashboard", "overview" | dashboard |
| "view", "browse" | list, detail |

## Phase 3: Read Standards

Before launching agents, read these files to inject into prompts:

1. `.claude/standards/ui-design.md` → for ui-base and ui-page agents
2. `.claude/standards/fastapi.md` → for logic agent
3. `.claude/standards/sqlalchemy.md` → for data agent

## Phase 4: Launch Agents

### Phase 4a: UI Base (Sequential)

Launch first, must complete before page agents:

```
Task tool with subagent_type: "general-purpose"

Prompt:
You are the UI Base agent.

[Insert contents of .claude/agents/ui-base.md]

[Insert contents of .claude/standards/ui-design.md]

PROJECT CONTEXT:
- app_name: [app_name]
- nav_items: [list of nav items based on pages]

Create the base template now.
```

### Phase 4b: Parallel Agents

After ui-base completes, launch these in parallel:

**UI Page Agents** (one per page or page group):

```
Task tool with subagent_type: "general-purpose"

Prompt:
You are a UI Page agent.

[Insert contents of .claude/agents/ui-page.md]

[Insert contents of .claude/standards/ui-design.md]

PROJECT CONTEXT:
- app_name: [app_name]
- entity: [entity name]
- page_type: [list/form/detail/dashboard]

FILE OWNERSHIP (create ONLY these):
- templates/[entity]/list.html
- templates/[entity]/form.html
- templates/[entity]/detail.html

Create the templates now.
```

**Data Agent**:

```
Task tool with subagent_type: "general-purpose"

Prompt:
You are the Data agent.

[Insert contents of .claude/agents/data.md]

[Insert contents of .claude/standards/sqlalchemy.md]

PROJECT CONTEXT:
Entities to create:
[list entities with fields]

Create all model files now.
```

**Logic Agent**:

```
Task tool with subagent_type: "general-purpose"

Prompt:
You are the Logic agent.

[Insert contents of .claude/agents/logic.md]

[Insert contents of .claude/standards/fastapi.md]

PROJECT CONTEXT:
- Entities: [list]
- Workflows: [list special actions like approve/reject]
- Has dashboard: [yes/no]

Templates will exist at:
- templates/[entity]/list.html
- templates/[entity]/form.html
- etc.

Create all route files now.
```

**Integration Agent**:

```
Task tool with subagent_type: "general-purpose"

Prompt:
You are the Integration agent.

[Insert contents of .claude/agents/integration.md]

PROJECT CONTEXT:
- app_name: [display name]
- project_name: [lowercase-with-hyphens]
- description: [one line]
- features: [list]
- has_static: false (no custom CSS needed with Pico)

Create main.py, pyproject.toml, and README.md now.
```

## Phase 5: Validate

After all agents complete:

1. **Check files exist**:
   - `main.py`
   - `pyproject.toml`
   - `db/database.py`
   - `models/__init__.py`
   - `routes/__init__.py`
   - `templates/base.html`
   - Template files for each page

2. **Fix import issues**:
   - Ensure `routes/__init__.py` imports all routers
   - Ensure `models/__init__.py` exports all models
   - Ensure `main.py` imports correctly

3. **Create directories if missing**:
   ```bash
   mkdir -p templates db models routes services
   ```

4. **Test startup**:
   ```bash
   uv sync
   uv run python main.py
   ```

5. **Fix any errors** before proceeding.

## Phase 6: Deliver

Provide simple instructions:

```
Your [app_name] is ready!

To run it:
1. Open terminal in this folder
2. Run: uv sync
3. Run: uv run python main.py
4. Open: http://localhost:8000

You'll see [description of what they'll see].

To stop: Press Ctrl+C
```

## Agent Task Limits

- Max 10 parallel tasks (queue additional)
- Each task ~200k token context
- ~20k overhead per task
- Tasks cannot spawn other tasks

## Typical Task Distribution

| App complexity | Agent count |
|----------------|-------------|
| Simple form | 4-5 (ui-base, 1 ui-page, data, logic, integration) |
| CRUD app | 6-7 (ui-base, 2-3 ui-page, data, logic, integration) |
| With dashboard | 7-8 (add dashboard ui-page) |
| With approval | 7-8 (add approval routes) |

Split UI pages when >3 distinct page groups.
