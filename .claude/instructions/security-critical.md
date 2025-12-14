# Security-Critical Files

Diese Dateien NIEMALS ohne explizite User-Genehmigung ändern:

## Immer fragen:
- `.github/app-config.yml` (Visibility)
- `infra/cloudflare-access/**` (Zero Trust)
- `.github/workflows/**` (CI/CD)
- `CLAUDE.md` (Non-negotiables)
- `wrangler.toml` (Environment config)

## Niemals vorschlagen:
- Visibility von "internal" auf "public" ändern
- Access-Protection deaktivieren
- CI-Checks überspringen
- Secrets in Code committen

## Bei Änderungen:
1. User explizit fragen
2. Begründung verlangen
3. Warnung ausgeben
