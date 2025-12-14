# CI Failure Handling

How the agent should respond when CI checks fail.

## Protocol

When a CI job fails, follow this sequence:

### 1. Fetch Failure Details

- Read the failing job's logs from GitHub Actions
- Use `gh run view --log-failed` to get specific error output
- Identify the exact step and error message

### 2. Diagnose by Failure Type

| Failure Type | Diagnosis Steps |
|--------------|-----------------|
| **Lint Error** | Identify rule violated, check ESLint output for file:line |
| **Type Error** | Read TypeScript error, check if type mismatch or missing type |
| **Test Failure** | Find assertion that failed, understand expected vs actual |
| **Build Error** | Check for missing imports, circular deps, bundle issues |
| **Audit Failure** | Check which package has vulnerability, severity level |
| **E2E Failure** | Check screenshot/video artifacts, identify UI issue |

### 3. Fix or Report

**If straightforward fix:**
1. Make the fix locally
2. Commit with message: `fix: [ci failure type] - [brief description]`
3. Push and monitor CI again

**If complex or unclear:**
1. Report to user with:
   - Which job failed
   - Error message
   - Analysis of likely cause
   - Proposed solutions (if any)
2. Wait for guidance before proceeding

**If flaky test:**
1. Retry once by re-running the job
2. If fails again, investigate properly
3. Never mark flaky tests as "expected failures"

### 4. Never Ignore

**Rules:**
- Do NOT merge PRs with failing checks
- Do NOT skip or disable tests to make CI pass
- Do NOT suppress lint errors without justification
- Do NOT proceed with deployment if quality gate fails

### 5. False Positives

For CodeQL or lint false positives:

1. Verify it's actually a false positive
2. If confirmed, dismiss with explanation in GitHub Security tab
3. Or add inline suppression with comment explaining why:
   ```typescript
   // eslint-disable-next-line security/detect-object-injection -- key is validated
   ```

## Example Workflow

```
CI Failed: ESLint error in src/utils/format.ts

1. Read log:
   > error  '@typescript-eslint/no-explicit-any'  src/utils/format.ts:15:20

2. Diagnose:
   Line 15 uses 'any' type, needs proper typing

3. Fix:
   Replace 'any' with proper type or 'unknown'

4. Commit:
   git commit -m "fix: replace any with unknown in format util"

5. Push and verify:
   Watch CI, confirm it passes
```

## CI Job Dependencies

```
lint ────┐
format ──┼──→ quality-gate ──→ deploy ──→ e2e
typecheck┤
test ────┤
build ───┘
```

If quality-gate fails, deployment is blocked. Fix the failing job first.

## Commands

```bash
# View failed run logs
gh run view <run-id> --log-failed

# Re-run failed jobs only
gh run rerun <run-id> --failed

# View PR checks status
gh pr checks
```
