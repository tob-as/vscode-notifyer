# Claude Code optimization guide for small Python teams

Claude Code transforms developer productivity through **four key systems**: automation hooks that run code quality tools automatically, MCP servers that connect to external services, skills that encode team-specific workflows, and deep integrations with Git/GitHub and VSCode. For a team of 5-10 developers new to Claude Teams, the fastest path to value starts with a well-crafted CLAUDE.md file and auto-formatting hooks—these two changes alone eliminate repetitive manual work from day one.

The platform handles approximately **90% of Git operations** for many Anthropic engineers, from generating context-aware commit messages to resolving rebase conflicts. Combined with pytest integration and GitHub Actions automation, Claude Code can become your team's primary interface for code development, testing, and review.

---

## Week one quick wins deliver immediate value

### Create your foundational CLAUDE.md file

The single highest-impact action is creating a CLAUDE.md file in your project root. Claude reads this file at every session start, ensuring it always understands your project's conventions.

```markdown
# CLAUDE.md

## Tech Stack
- Python 3.11+ with type hints everywhere
- uv for package management (NOT pip)
- FastAPI for APIs, SQLAlchemy 2.0 for ORM
- ruff for linting/formatting, mypy for types
- pytest with pytest-cov for testing

## Commands
- `uv sync` - Install dependencies
- `uv run pytest` - Run tests
- `uv run ruff check . && uv run ruff format .` - Lint and format
- `uv run mypy src/` - Type check

## Code Standards
- Use type hints on all public functions
- Write Google-style docstrings
- Prefer f-strings over .format()
- Keep functions under 50 lines
- Use `from __future__ import annotations`

## Project Layout
- `src/myapp/` - Main application code
- `src/myapp/api/` - API endpoints
- `src/myapp/services/` - Business logic
- `tests/` - Test files (mirror src structure)

## Before Committing
1. Run `uv run pytest`
2. Run `uv run ruff check .`
3. Run `uv run mypy src/`

## Testing Rules
- Every new function needs a test
- Use pytest fixtures for setup
- Mock external services, never call them
- Test file mirrors source: `src/utils/helper.py` → `tests/utils/test_helper.py`
```

Run `/init` in your project after creating this file to let Claude analyze your codebase structure automatically.

### Configure auto-formatting hooks

Hooks execute shell commands at specific lifecycle points, ensuring code quality without manual intervention. Add this to `.claude/settings.json` (committed to repo) or `~/.claude/settings.json` (personal):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "for f in $CLAUDE_FILE_PATHS; do if [[ \"$f\" == *.py ]]; then ruff format \"$f\" && ruff check --fix \"$f\"; fi; done"
          }
        ]
      }
    ]
  }
}
```

This automatically formats and lints every Python file Claude touches. The **matcher** field uses regex patterns—`Edit|MultiEdit|Write` catches all file modifications.

### Install the VSCode extension

The official extension (`anthropic.claude-code` in the marketplace) provides real-time diffs with accept/reject buttons, multiple parallel sessions, and automatic file context. After installation, click the Spark icon in the sidebar to access Claude Code directly within your editor.

Key shortcuts to learn immediately:

- **Cmd+Esc** (Mac) / **Ctrl+Esc** (Windows): Open Claude Code panel
- **Cmd+Option+K** / **Alt+Ctrl+K**: Insert file references with native picker
- **Shift+Tab**: Cycle through permission modes

### Create your first team slash commands

Slash commands encode common workflows into simple invocations. Create `.claude/commands/` in your project root:

**`.claude/commands/pr.md`** - Create pull requests:

```markdown
Create a well-documented pull request for the current changes.
1. Summarize all changes made
2. List any breaking changes
3. Include testing performed
4. Link related GitHub issues using #number format
```

**`.claude/commands/fix-issue.md`** - Fix GitHub issues end-to-end:

```markdown
---
argument-hint: [issue-number]
description: Analyze and fix a GitHub issue
---
Please analyze and fix GitHub issue #$ARGUMENTS.

1. Use `gh issue view $ARGUMENTS` to get issue details
2. Search the codebase for relevant files
3. Implement the fix following our code standards
4. Write tests for the fix
5. Run `uv run pytest` and `uv run ruff check .`
6. Create a commit with conventional commit format
7. Push and create a PR with `gh pr create`
```

Use these with `/pr` and `/fix-issue 1234` respectively. Commands in `.claude/commands/` appear with "(project)" in `/help` and are shared with your team via Git.

---

## First month improvements build automation depth

### Add test automation hooks

Extend your hooks to run tests automatically after code changes:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "for f in $CLAUDE_FILE_PATHS; do if [[ \"$f\" == *.py ]]; then ruff format \"$f\" && ruff check --fix \"$f\"; fi; done"
          },
          {
            "type": "command",
            "command": "if echo \"$CLAUDE_FILE_PATHS\" | grep -qE '\\.(py)$'; then uv run pytest tests/ -x --tb=short -q; fi"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$CLAUDE_TOOL_INPUT\" | grep -qE 'rm -rf|DROP TABLE|truncate'; then echo 'Dangerous command blocked!' && exit 2; fi"
          }
        ]
      }
    ]
  }
}
```

The **PreToolUse** hook adds a safety layer, blocking potentially destructive commands before execution. Exit code 2 blocks the tool; exit code 0 allows it to proceed.

### Configure essential MCP servers

MCP (Model Context Protocol) connects Claude Code to external tools and services. Start with these three high-value servers:

**1. GitHub MCP Server** - Essential for PR management:
```bash
claude mcp add github -- npx -y @modelcontextprotocol/server-github
```
Set your token: `export GITHUB_TOKEN=ghp_your_token_here`

**2. Context7** - Real-time Python library documentation:
```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp
```
This fetches current, version-specific docs for FastAPI, SQLAlchemy, pytest, and other libraries—eliminating outdated API references.

**3. Sequential Thinking** - Complex problem decomposition:
```bash
claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking
```

Verify your MCP configuration with `/mcp` inside Claude Code. For team-wide sharing, add configuration to `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

**Critical warning on context pollution**: MCP tools consume context tokens. One developer reported **82,000+ tokens** consumed just from MCP tools before any conversation began. Monitor usage with `/context` and limit active servers to 3-5 at once.

### Set up GitHub Actions integration

Install the official Claude Code GitHub App for automated PR reviews:

```bash
# Inside Claude Code
/install-github-app
```

For manual setup, create `.github/workflows/claude.yml`:

```yaml
name: Claude Code Review
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      issues: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

This enables `@claude` mentions in PR comments to trigger automated reviews, implementations, and discussions.

### Create your first project skill

Skills are task-specific instruction sets that Claude activates automatically when relevant. Unlike CLAUDE.md (always loaded), skills load only when needed, keeping context efficient.

Create `.claude/skills/python-tdd/SKILL.md`:

```markdown
---
name: python-tdd
description: Guide test-driven development for Python projects. Use when writing new features, adding tests, or implementing bug fixes.
---

# Python TDD Workflow

## Process
1. **Red**: Write a failing test that defines expected behavior
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Clean up while keeping tests green

## Test Structure Pattern
```python
import pytest
from src.module import function_under_test

class TestFunctionName:
    """Tests for function_under_test."""
    
    def test_returns_expected_for_valid_input(self):
        result = function_under_test("valid")
        assert result == "expected"
    
    def test_raises_value_error_for_none(self):
        with pytest.raises(ValueError):
            function_under_test(None)
    
    @pytest.mark.parametrize("input,expected", [
        ("a", 1),
        ("bb", 2),
        ("", 0),
    ])
    def test_handles_various_inputs(self, input, expected):
        assert function_under_test(input) == expected
```

## Fixture Pattern
```python
@pytest.fixture
def sample_user():
    return {"id": 1, "name": "Test User", "email": "test@example.com"}

@pytest.fixture
def db_session(tmp_path):
    db = create_test_db(tmp_path / "test.db")
    yield db
    db.close()
```

## Guidelines
- One assertion per test when possible
- Test names describe expected behavior: `test_returns_none_when_input_empty`
- Mock external dependencies, never call real APIs
```

The **description** field is critical—Claude uses it to decide when to activate the skill. Write descriptions that clearly indicate the trigger scenarios.

---

## Advanced patterns for mature teams

### Implement comprehensive code review automation

Create a code review skill at `.claude/skills/python-review/SKILL.md`:

```markdown
---
name: python-review
description: Review Python code for quality, security, and maintainability. Use when reviewing PRs, auditing code, or before merging.
---

# Python Code Review Checklist

## Security (Critical)
- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all user data
- [ ] SQL queries use parameterized statements
- [ ] No `eval()` or `exec()` with user input
- [ ] Proper exception handling (no bare `except:`)

## Code Quality
- [ ] Type hints on all public functions
- [ ] Docstrings on classes and public methods
- [ ] Functions < 50 lines, single responsibility
- [ ] No code duplication
- [ ] Clear variable names (no single-letter except loops)

## Performance
- [ ] Appropriate data structures
- [ ] No N+1 query patterns
- [ ] Generators for large datasets
- [ ] Caching where beneficial

## Output Format
```
## Summary
[1-2 sentence overview]

## Critical Issues
- [Issue]: [File:Line] - [Fix suggestion]

## Improvements
- [What]: [Where] - [Why it matters]

## Positive Notes
- [What's done well]
```
```

### Configure parallel development with Git worktrees

For teams working on multiple features simultaneously, use Git worktrees to run parallel Claude sessions:

```bash
# Create worktree for feature branch
git worktree add ../myproject-feature-auth feature/auth

# Start Claude in each worktree
cd ../myproject-feature-auth && claude
```

Each worktree gets its own Claude session with isolated context. This pattern multiplies your effective development capacity.

### Build custom MCP servers for team-specific tools

For workflows unique to your team, create custom MCP servers using FastMCP:

```python
# custom_mcp_server.py
from fastmcp import FastMCP

mcp = FastMCP(name="Team Dev Tools")

@mcp.tool
def run_migration_check() -> dict:
    """Check for pending database migrations."""
    import subprocess
    result = subprocess.run(
        ["alembic", "current"],
        capture_output=True,
        text=True
    )
    return {"current": result.stdout, "status": "ok" if result.returncode == 0 else "error"}

@mcp.tool  
def analyze_test_coverage(path: str = "src/") -> dict:
    """Analyze pytest coverage for a path."""
    import subprocess
    result = subprocess.run(
        ["pytest", "--cov=" + path, "--cov-report=json", "-q"],
        capture_output=True,
        text=True
    )
    return {"output": result.stdout, "coverage_report": "coverage.json"}

if __name__ == "__main__":
    mcp.run()
```

Install with:
```bash
claude mcp add team-tools -- python /path/to/custom_mcp_server.py
```

### Implement security-focused PR reviews via GitHub Actions

```yaml
name: Security Review
on:
  pull_request:
    paths:
      - 'src/auth/**'
      - 'src/api/**'
      - '**/security*.py'

jobs:
  security-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Perform a security-focused review of this PR. Check for:
            1. Authentication/authorization issues
            2. Input validation gaps
            3. SQL injection vulnerabilities
            4. Sensitive data exposure
            5. OWASP Top 10 concerns
            
            Flag any critical issues that should block merge.
```

---

## Implementation checklist by timeline

### Week 1 foundation
| Task | Command/Action | Impact |
|------|----------------|--------|
| Create CLAUDE.md | Add file to project root | Claude understands your project |
| Run `/init` | Inside Claude Code | Analyzes codebase structure |
| Install VSCode extension | Marketplace: anthropic.claude-code | Visual workflow |
| Add format hook | `.claude/settings.json` | Auto-formatting |
| Create `/pr` command | `.claude/commands/pr.md` | Consistent PRs |

### Weeks 2-3 automation
| Task | Command/Action | Impact |
|------|----------------|--------|
| Add test hook | Extend settings.json | Tests run automatically |
| Configure GitHub MCP | `claude mcp add github` | PR/issue integration |
| Add Context7 MCP | `claude mcp add context7` | Current library docs |
| Set up GitHub Actions | `/install-github-app` | Automated reviews |
| Create `/fix-issue` command | `.claude/commands/fix-issue.md` | End-to-end issue fixes |

### Month 2+ maturity
| Task | Command/Action | Impact |
|------|----------------|--------|
| Create TDD skill | `.claude/skills/python-tdd/` | Consistent test patterns |
| Create review skill | `.claude/skills/python-review/` | Thorough code reviews |
| Custom MCP server | FastMCP Python script | Team-specific tools |
| Security PR workflow | GitHub Actions YAML | Automated security checks |
| Git worktrees pattern | `git worktree add` | Parallel development |

---

## Essential configuration reference

### All available slash commands

| Command | Purpose |
|---------|---------|
| `/init` | Initialize project with CLAUDE.md |
| `/clear` | Clear conversation history |
| `/compact` | Compress conversation context |
| `/config` | View/modify configuration |
| `/cost` | Show token usage statistics |
| `/doctor` | Diagnose installation issues |
| `/help` | Show all commands |
| `/hooks` | Configure automation hooks |
| `/mcp` | Manage MCP server connections |
| `/memory` | Manage cross-session memory |
| `/model` | Switch Claude models |
| `/permissions` | Configure tool permissions |
| `/review` | Request code review |

### Hook event types

| Event | Trigger | Use Case |
|-------|---------|----------|
| **PreToolUse** | Before tool execution | Validation, blocking dangerous commands |
| **PostToolUse** | After tool completes | Formatting, testing, logging |
| **UserPromptSubmit** | User sends message | Add context, validate prompts |
| **Notification** | Claude sends notification | Custom alerts |
| **Stop** | Claude finishes responding | Commit changes, session summary |
| **SessionStart** | Session begins | Load environment, setup |

### Environment variables in hooks

- `$CLAUDE_PROJECT_DIR` - Project root path
- `$CLAUDE_FILE_PATHS` - Space-separated affected files
- `$CLAUDE_TOOL_NAME` - Current tool name
- `$CLAUDE_TOOL_INPUT` - Tool input (PreToolUse)
- `$CLAUDE_TOOL_OUTPUT` - Tool output (PostToolUse)

---

## Conclusion

The fastest path to Claude Code productivity combines **immediate setup** (CLAUDE.md + auto-format hooks + VSCode extension) with **progressive automation** (MCP servers + GitHub Actions + skills). Start with the foundation—a well-crafted CLAUDE.md file communicates your entire project context to Claude instantly. Add hooks to eliminate manual formatting and testing. Then expand to MCP integrations and skills as your team identifies repetitive workflows.

The key insight for small teams: **avoid over-engineering**. Three MCP servers, two skills, and a handful of slash commands will handle 90% of your needs. Monitor context usage with `/context` to prevent token bloat, and iterate based on what your team actually uses. The goal is augmented productivity, not configuration complexity.