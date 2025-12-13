# TODO: Compliance GitHub Action

## Konzept

Eine GitHub Action die bei jedem Push prüft, ob das Projekt den tob-claude-internal Standards entspricht.

**Trennung der Verantwortlichkeiten:**
- `setup-claude.sh` (lokal) → Setup (Symlinks, Templates kopieren)
- `claude-compliance.yml` (CI) → Validation (Enforcement, Team-weit)

---

## Was geprüft wird

### 1. CLAUDE.md Struktur
- [ ] Datei existiert
- [ ] Mindestens 3 @imports vorhanden
- [ ] `workflow.md` importiert
- [ ] `code-quality.md` importiert

### 2. Security Configuration
- [ ] `.github/app-config.yml` existiert
- [ ] `visibility` ist "internal" oder "public"

### 3. CI/CD Workflows
- [ ] Mindestens ein `deploy-*.yml` Workflow existiert
- [ ] Security-Check Step vorhanden

### 4. Setup-Version (Warning only)
- [ ] `.claude/setup-version.yml` existiert
- [ ] Version ist aktuell (Warning wenn veraltet)

---

## Implementierung

### 1. Workflow-Datei erstellen

**Pfad:** `.claude/templates/shared/ci/claude-compliance.yml`

```yaml
name: Claude Setup Compliance

on:
  push:
    branches: [main, develop, staging]
  pull_request:

jobs:
  compliance:
    name: Check Compliance
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      # 1. CLAUDE.md CHECKS
      - name: Check CLAUDE.md exists
        run: |
          if [ ! -f "CLAUDE.md" ]; then
            echo "::error::CLAUDE.md not found"
            exit 1
          fi
          echo "✓ CLAUDE.md exists"

      - name: Verify required @imports
        run: |
          MISSING=""

          if ! grep -q "workflow.md" CLAUDE.md; then
            MISSING="$MISSING workflow.md"
          fi

          if ! grep -q "code-quality.md" CLAUDE.md; then
            MISSING="$MISSING code-quality.md"
          fi

          if [ -n "$MISSING" ]; then
            echo "::error::Missing imports in CLAUDE.md:$MISSING"
            exit 1
          fi
          echo "✓ Required @imports present"

      # 2. SECURITY CHECKS
      - name: Check app-config.yml
        run: |
          if [ ! -f ".github/app-config.yml" ]; then
            echo "::error::Missing .github/app-config.yml"
            exit 1
          fi

          VISIBILITY=$(grep "visibility:" .github/app-config.yml | cut -d: -f2 | tr -d ' ')

          if [ "$VISIBILITY" != "internal" ] && [ "$VISIBILITY" != "public" ]; then
            echo "::error::Invalid visibility '$VISIBILITY' - must be 'internal' or 'public'"
            exit 1
          fi

          echo "✓ Security config valid (visibility: $VISIBILITY)"

      # 3. CI/CD CHECKS
      - name: Check deploy workflow exists
        run: |
          if ls .github/workflows/deploy-*.yml 1> /dev/null 2>&1; then
            echo "✓ Deploy workflow found"
          else
            echo "::error::No deploy workflow found"
            exit 1
          fi

      # 4. VERSION CHECK (Warning only)
      - name: Check setup version
        continue-on-error: true
        run: |
          if [ ! -f ".claude/setup-version.yml" ]; then
            echo "::warning::No setup-version.yml found - consider running setup-claude.sh"
            exit 0
          fi

          LOCAL_VERSION=$(grep "version:" .claude/setup-version.yml | cut -d: -f2 | tr -d ' "')
          echo "✓ Setup version: $LOCAL_VERSION"
```

### 2. Setup Script erweitern

**In `setup-claude.sh` hinzufügen:**

```bash
# Erstelle Version-Marker
mkdir -p .claude
cat > .claude/setup-version.yml << EOF
version: "1.0.0"
profile: "$PROFILE"
setup_date: "$(date +%Y-%m-%d)"
tob_claude_setup_commit: "$(cd $SCRIPT_DIR && git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
EOF
echo "  ✓ Created: .claude/setup-version.yml"
```

### 3. Template zu allen Profilen hinzufügen

Die Compliance Action automatisch in alle neuen Projekte kopieren:

```bash
# In setup-claude.sh für serverless/redwood/microtool:
copy_if_missing "$SCRIPT_DIR/.claude/templates/shared/ci/claude-compliance.yml" ".github/workflows/claude-compliance.yml"
```

---

## Compliance Levels

| Level | Verhalten | Konfiguration |
|-------|-----------|---------------|
| **Warn** | CI zeigt Warning, blockiert nicht | `continue-on-error: true` |
| **Enforce** | CI schlägt fehl wenn nicht compliant | Default |

---

## Erwartete Ausgabe

**Alles OK:**
```
✓ CLAUDE.md exists
✓ Required @imports present
✓ Security config valid (visibility: internal)
✓ Deploy workflow found
✓ Setup version: 1.0.0
```

**Fehler:**
```
✓ CLAUDE.md exists
✓ Required @imports present
✗ ERROR: Missing .github/app-config.yml
```

**Warning:**
```
✓ CLAUDE.md exists
✓ Required @imports present
✓ Security config valid
✓ Deploy workflow found
⚠️ WARNING: No setup-version.yml found
```

---

## Priorität

**Medium** - Kann nach den Basis-Features implementiert werden. Nützlich für Team-Compliance sobald mehrere Projekte existieren.
