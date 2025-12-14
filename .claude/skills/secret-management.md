# Secret Management Skill

## Purpose

When user shares a secret in chat, offer to persist it to their `~/.tob/env-setup.sh` for reuse across sessions.

## When to Use

Detect when user shares credentials in chat:

**Patterns:**
- "Here's the Resend key: re_xxxxx"
- "My Cloudflare token is: abc123"
- "Use this API key: sk_xxxxx"
- "The account ID is: abc123def456"
- "Token: ghp_xxxxx"

**Keywords:**
- token, key, secret, credential, API key, account ID

## Process

### 1. Detect Secret

Look for patterns like:
- `re_` (Resend)
- `sk_` (generic API key)
- `ghp_` (GitHub token)
- Long alphanumeric strings after "token:", "key:", etc.

### 2. Identify Type

Map to environment variable name:

| Pattern | Env Var Name |
|---------|--------------|
| `re_...` | `RESEND_API_KEY` |
| Cloudflare account ID (hex) | `CLOUDFLARE_ACCOUNT_ID` |
| "cloudflare token", "cf token" | `CLOUDFLARE_API_TOKEN` |
| `ghp_...` | `GITHUB_TOKEN` |
| Generic | Ask user for var name |

### 3. Confirm with User

```
Erkannt: RESEND_API_KEY
Soll ich das zu deinem ~/.tob/env-setup.sh hinzufügen?
```

Wait for confirmation.

### 4. Persist Secret

```bash
# Check if file exists
if [ ! -f ~/.tob/env-setup.sh ]; then
  mkdir -p ~/.tob
  cat > ~/.tob/env-setup.sh << 'EOF'
#!/bin/bash
# TOB Global Secrets (lokal, NICHT committen)
EOF
  chmod +x ~/.tob/env-setup.sh
fi

# Add or update the export
if grep -q "^export KEY_NAME=" ~/.tob/env-setup.sh; then
  # Update existing
  sed -i "s/^export KEY_NAME=.*/export KEY_NAME=\"value\"/" ~/.tob/env-setup.sh
else
  # Add new
  echo 'export KEY_NAME="value"' >> ~/.tob/env-setup.sh
fi
```

### 5. Verify

```bash
source ~/.tob/env-setup.sh
echo $KEY_NAME  # Should output (redacted)
echo "✓ Secret gespeichert und verfügbar"
```

### 6. Remind User

```
Secret gespeichert in ~/.tob/env-setup.sh

Wichtig:
- Diese Datei NIEMALS committen
- Beim nächsten Claude-Start automatisch verfügbar (via CLAUDE_ENV_FILE)
```

---

## Security Rules

### NEVER

- Commit secrets to any repo
- Echo/log the actual secret value in output
- Write secrets to project directories
- Share secrets in PR descriptions

### ALWAYS

- Confirm before writing
- Write only to `~/.tob/env-setup.sh` (user's home)
- Redact values in output (show only first/last 4 chars)
- Remind about CLAUDE_ENV_FILE setup

---

## Example Session

```
User: Here's the Resend key: re_VCfwfRNU_KooFuMbUwLVtHX8uig3YoDdn

Claude:
Erkannt: RESEND_API_KEY (re_VCfw...YoDdn)
Soll ich das zu deinem ~/.tob/env-setup.sh hinzufügen?

User: Ja

Claude:
✓ Secret gespeichert in ~/.tob/env-setup.sh

Das nächste Mal startest du Claude mit:
  export CLAUDE_ENV_FILE=~/.tob/env-setup.sh
  claude

Dann ist RESEND_API_KEY automatisch verfügbar.
```

---

## Integration mit CLAUDE_ENV_FILE

Nach dem Speichern, User muss:

1. CLAUDE_ENV_FILE setzen (einmalig):
   ```bash
   echo 'export CLAUDE_ENV_FILE=~/.tob/env-setup.sh' >> ~/.bashrc
   ```

2. Session neu starten oder:
   ```bash
   source ~/.tob/env-setup.sh
   ```

Dann sind alle Secrets in `process.env` verfügbar.

---

## Do Not

- Store secrets anywhere except `~/.tob/env-setup.sh`
- Overwrite existing secrets without asking
- Skip confirmation step
- Log actual secret values
