# Code Quality

## Toolchain

```bash
uv run ruff check --fix .    # Lint + autofix
uv run ruff format .         # Format
uv run mypy .                # Type check
uv run pytest                # Run tests
```

## Type Hints

Required on all functions:

```python
def get_user(user_id: int) -> User | None:
    ...

def process_items(items: list[str]) -> dict[str, int]:
    ...
```

Avoid `Any`. Be specific.

## Naming

- Functions: `snake_case` verbs — `get_user`, `validate_input`
- Variables: `snake_case` descriptive — `user_count`, `is_valid`
- Classes: `PascalCase` nouns — `UserService`, `PaymentProcessor`
- Constants: `UPPER_SNAKE` — `MAX_RETRIES`, `DEFAULT_TIMEOUT`

## Functions

- Keep under 50 lines
- Single responsibility
- Return early to reduce nesting

```python
# Good: early return
def get_user(user_id: int) -> User | None:
    if user_id <= 0:
        return None
    return db.find_user(user_id)

# Bad: nested
def get_user(user_id: int) -> User | None:
    if user_id > 0:
        return db.find_user(user_id)
    else:
        return None
```

## Error Handling

Wrap external calls. Handle specific exceptions.

```python
try:
    response = api.fetch_data()
except requests.Timeout:
    logger.warning("API timeout")
    return None
except requests.RequestException as e:
    logger.error(f"API error: {e}")
    raise
```

Never use bare `except:`.

## Do Not

- Do not use `print()` for debugging — use `logging`
- Do not leave commented-out code — delete it
- Do not hardcode secrets — use environment variables
- Do not ignore type checker errors — fix them
