# Approval Deck

**VS Code Extension + Stream Deck Plugin for Claude Code Approval Notifications**

When Claude Code in VS Code needs permission/approval (tool access, command execution, web search, git actions), your Stream Deck button blinks red and plays a sound. Press the button to instantly focus VS Code notifications for quick approval.

## Features

- **Visual Notifications**: Stream Deck keys show pending approval count with timer
- **Color-Coded Status**: Red = waiting, Green = running, Yellow = idle
- **Sound Alerts**: Configurable audio notifications with cooldown
- **One-Click Focus**: Press key to focus VS Code notification for approval
- **Multi-Project Support**: Monitor multiple Claude Code sessions simultaneously
- **Global Summary**: Optional key showing total pending across all projects
- **No Auto-Approve**: Only notifies - never bypasses Claude's permission system

## Architecture

```
┌─────────────────────────────────────────┐     ┌─────────────────┐
│           Docker Container               │     │      Host       │
│  ┌─────────────────────────────────┐    │     │                 │
│  │       VS Code Server            │    │     │  ┌───────────┐  │
│  │  ┌─────────────────────────┐    │    │     │  │  Stream   │  │
│  │  │  Approval Deck Extension │    │    │     │  │   Deck    │  │
│  │  │  - Detects prompts      │    │    │     │  │  Plugin   │  │
│  │  │  - Writes state JSON    │────┼────┼─────┼──│           │  │
│  │  │  - Reads commands       │←───┼────┼─────┼──│           │  │
│  │  └─────────────────────────┘    │    │     │  └───────────┘  │
│  └─────────────────────────────────┘    │     │                 │
│                                         │     │                 │
│  /shared/approval-deck/ ←──────────────────────→ C:\approval-deck
│    ├── state/<project>.json             │     │                 │
│    ├── commands/<project>.ndjson        │     │                 │
│    └── logs/<project>.ndjson            │     │                 │
└─────────────────────────────────────────┘     └─────────────────┘
```

**No network required** - communication is entirely file-based via shared volume mount.

## Quick Start

### 1. Set Up Shared Volume

Add to your `docker-compose.yml`:

```yaml
services:
  vscode:
    image: your-vscode-image
    volumes:
      # Map host directory to container path
      - ./approval-deck:/shared/approval-deck
    # ... rest of config
```

Create the directory on your host:
```bash
# Windows (PowerShell)
mkdir C:\approval-deck

# macOS/Linux
mkdir -p ~/approval-deck
```

### 2. Install VS Code Extension

```bash
cd packages/vscode-extension
npm install
npm run package
```

Install the generated `.vsix` file in VS Code.

Configure in VS Code settings:
```json
{
  "approvalDeck.sharedDir": "/shared/approval-deck",
  "approvalDeck.projectId": "my-project",
  "approvalDeck.projectLabel": "My Project"
}
```

### 3. Install Stream Deck Plugin

```bash
cd packages/streamdeck-plugin
npm install
npm run build
npm run link  # For development
# OR
npm run pack  # For distribution .streamDeckPlugin file
```

Configure each key in Stream Deck:
- **Shared Directory**: `C:\approval-deck` (HOST path!)
- **Project ID**: `my-project` (must match VS Code)

### 4. Start Using

1. Start VS Code in Docker
2. Use Claude Code normally
3. When Claude needs approval → Stream Deck key blinks red
4. Press key → VS Code notifications focused
5. Approve/Deny as usual

## Project Structure

```
vscode-notifyer/
├── packages/
│   ├── vscode-extension/     # VS Code extension
│   │   ├── src/
│   │   │   ├── extension.ts          # Main entry
│   │   │   ├── messageInterceptor.ts # Approval detection
│   │   │   ├── stateManager.ts       # State file management
│   │   │   ├── commandHandler.ts     # Stream Deck commands
│   │   │   └── approvalDetector.ts   # Detection heuristics
│   │   └── package.json
│   │
│   └── streamdeck-plugin/    # Stream Deck plugin
│       └── com.approval-deck.sdPlugin/
│           ├── src/
│           │   ├── plugin.ts         # Plugin entry
│           │   ├── actions/          # Monitor & Summary actions
│           │   ├── stateWatcher.ts   # File watching
│           │   ├── svgRenderer.ts    # Dynamic key images
│           │   └── soundPlayer.ts    # Cross-platform sound
│           ├── pi/                   # Property Inspector HTML
│           └── manifest.json
│
├── package.json              # Monorepo root
└── README.md
```

## Configuration Reference

### VS Code Extension

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `approvalDeck.sharedDir` | string | `/shared/approval-deck` | Container path to shared directory |
| `approvalDeck.projectId` | string | workspace name | Unique project identifier |
| `approvalDeck.projectLabel` | string | projectId | Display label on Stream Deck |
| `approvalDeck.idleThresholdSec` | number | 120 | Seconds before idle mode |
| `approvalDeck.enableDebugLog` | boolean | false | Write debug logs |
| `approvalDeck.commandPollIntervalMs` | number | 250 | Command poll interval |

### Stream Deck Plugin

| Setting | Description |
|---------|-------------|
| Shared Directory | **HOST** path to shared mount |
| Project ID | Must match VS Code `projectId` |
| Blink Interval | Animation speed (ms) |
| Enable Sound | Play sound on new approvals |
| Sound Cooldown | Min time between sounds (ms) |

## Security

This project follows Claude Code's security model:

- **No Auto-Approval**: Never automatically clicks "Yes" or bypasses prompts
- **No Binary Modification**: Does not modify Claude Code in any way
- **Notification Only**: Just detects prompts and provides visual alerts
- **File-Based Communication**: No network exposure, local files only
- **User Must Approve**: You still manually approve/deny each request

## Troubleshooting

### Key shows "Not Connected"
- Verify shared directory path (HOST path for Stream Deck!)
- Check VS Code extension is active (View → Output → "Approval Deck")
- Ensure state file exists in `<sharedDir>/state/`

### No sound playing
- Check "Enable Sound" in Stream Deck settings
- Verify sound cooldown period
- On macOS: `afplay` must be available
- On Windows: PowerShell must be accessible

### Commands not reaching VS Code
- Check command file in `<sharedDir>/commands/`
- Verify VS Code extension is polling (check Output panel)
- Ensure file permissions allow read/write

### Approvals not being detected
- Enable debug logging in VS Code
- Use "Simulate Approval" command to test detection
- Check for detection reason in Output panel

## Development

```bash
# Install all dependencies
npm install

# Build everything
npm run build

# Build VS Code extension only
npm run build:vscode

# Build Stream Deck plugin only
npm run build:streamdeck

# Watch VS Code extension
npm run watch:vscode
```

## License

MIT
