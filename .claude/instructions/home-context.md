# Claude Home Context

## TOB Claude Home

Das zentrale Konfigurations-Repository befindet sich hier:
```
/home/coder/workspace/tob-claude-internal
```

Diese Location ist das "Zuhause" - hier liegen:
- Skills, Agents, Commands
- Templates und Standards
- Das `setup-claude.sh` Script

## Automatische Kontext-Erkennung

### Wenn in einem Git-Repository:
1. Prüfe ob `.claude/active-profile` existiert
2. Wenn ja: Dieses Repo wurde mit `setup-claude.sh` initialisiert
3. Arbeite im Kontext dieses Projekts

### Wenn in `/home/coder/workspace/repos/*`:
- Das ist ein Projekt-Verzeichnis
- Erwarte CLAUDE.md mit Projekt-spezifischen Anweisungen

### Wenn in `/home/coder/workspace/tob-claude-internal`:
- Das ist das Meta-Repository
- Hier werden Skills, Agents, Templates gepflegt

## Projekt-Scope bestimmen

Nutze diesen Befehl um den Git-Root zu finden:
```bash
git rev-parse --show-toplevel 2>/dev/null || pwd
```

Das Ergebnis definiert den Arbeitsbereich für die aktuelle Session.

## Standard-Arbeitsverzeichnisse

| Pfad | Bedeutung |
|------|-----------|
| `/home/coder/workspace/tob-claude-internal` | Meta-Repo (Skills, Agents, Standards) |
| `/home/coder/workspace/repos/*` | Projekt-Repositories |
| `/home/coder/workspace` | Workspace-Root |
