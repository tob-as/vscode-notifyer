# Shell Policy

## No Command Chaining

Execute **one command per Bash tool call**. Do not chain commands.

### Forbidden

```bash
# Never do this
mkdir foo && cd foo
git add . && git commit -m "msg"
npm install && npm run build
ls | grep foo
```

### Required

```bash
# Separate calls
mkdir foo

# Then in another call
cd foo
```

### Why?

- Allow rules match single commands (`Bash(mkdir:*)`)
- Chained commands bypass permission checks
- Parallel tool calls are faster than chains

### Exception

Sequential dependencies within a single conceptual operation are allowed only when:
1. The second command would fail silently without the first
2. Both commands are in the allow list
3. Example: `cd /path && ls` when you need to list a specific directory

When in doubt, use separate Bash calls.
