# Approval Deck v1.0.3 - Mac Installation Guide

Diese Anleitung beschreibt die Installation auf macOS, wenn VS Code in einem Docker-Container läuft.

## Voraussetzungen

- macOS 10.15 (Catalina) oder neuer
- Docker Desktop für Mac installiert und läuft
- Elgato Stream Deck Software Version 6.4 oder neuer
- VS Code läuft in einem Docker-Container

## Enthaltene Dateien

```
releases/v1.0.3/
├── approval-deck-1.0.3.vsix          # VS Code Extension
├── com.approval-deck.streamDeckPlugin     # Stream Deck Plugin
└── INSTALL-MAC.md                         # Diese Anleitung
```

---

## Schritt 1: Shared-Verzeichnis erstellen

```bash
mkdir -p ~/approval-deck-shared
```

---

## Schritt 2: Docker Volume-Mount hinzufügen

Füge in deiner `docker-compose.yml` hinzu:

```yaml
volumes:
  - ~/approval-deck-shared:/shared/approval-deck
```

Dann Container neu starten: `docker compose down && docker compose up -d`

---

## Schritt 3: VS Code Extension installieren

```bash
# Kopiere VSIX in Container
docker cp approval-deck-1.0.3.vsix <container-name>:/tmp/

# Installiere Extension
docker exec <container-name> code-server --install-extension /tmp/approval-deck-1.0.3.vsix
```

Oder über VS Code UI: `Cmd+Shift+P` → `Extensions: Install from VSIX...`

---

## Schritt 4: Stream Deck Plugin installieren

**Doppelklicke** auf `com.approval-deck.streamDeckPlugin`

Die Stream Deck App öffnet sich und installiert das Plugin automatisch.

---

## Schritt 5: Konfigurieren

### Stream Deck
1. Ziehe "Approval Monitor" auf eine Taste
2. Setze **Shared Directory (Host)**: `/Users/DEIN-USERNAME/approval-deck-shared`

### VS Code (im Container)
1. `Cmd+,` → Suche "Approval Deck"
2. **Shared Dir** ist bereits `/shared/approval-deck` (Default)

**Wichtig:** Die **Project ID** muss auf beiden Seiten gleich sein (oder leer lassen für Auto-Erkennung).

---

## Schritt 6: Testen

Im VS Code Container:
- `Cmd+Shift+P` → `Approval Deck: Show Status`
- `Cmd+Shift+P` → `Approval Deck: Simulate Approval (Debug)`

Die Stream Deck Taste sollte blinken!

---

## Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| Extension startet nicht | `Developer: Reload Window` in VS Code |
| Taste zeigt nichts | Project ID und Shared Directory prüfen |
| Kein Blinken | Stream Deck App neu starten |

Logs prüfen:
- VS Code: `Help > Toggle Developer Tools`
- Stream Deck: `~/approval-deck-shared/logs/`

---

**Version:** 1.0.3
**Datum:** Dezember 2025
