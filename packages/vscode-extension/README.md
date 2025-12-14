# Approval Deck - VS Code Extension

VS Code extension that detects Claude Code permission prompts and communicates with Stream Deck for visual notifications.

## Features

- **Approval Detection**: Automatically detects Claude Code approval prompts using heuristics
- **State Publishing**: Writes project state to shared JSON files for Stream Deck plugin
- **Command Handling**: Receives commands from Stream Deck to focus notifications
- **Idle Detection**: Automatically switches to idle mode after configurable inactivity

## Installation

### From VSIX (Recommended)

1. Build the extension:
   ```bash
   cd packages/vscode-extension
   npm install
   npm run package
   ```

2. Install in VS Code:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Click "..." → "Install from VSIX..."
   - Select the generated `.vsix` file

### Development Mode

1. Open the `packages/vscode-extension` folder in VS Code
2. Press F5 to launch Extension Development Host

## Configuration

Add these settings to your VS Code `settings.json`:

```json
{
  "approvalDeck.sharedDir": "/shared/approval-deck",
  "approvalDeck.projectId": "my-project",
  "approvalDeck.projectLabel": "My Project",
  "approvalDeck.idleThresholdSec": 120,
  "approvalDeck.enableDebugLog": false,
  "approvalDeck.commandPollIntervalMs": 250
}
```

### Settings Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `sharedDir` | string | `/shared/approval-deck` | Path to shared directory (container path) |
| `projectId` | string | workspace name | Unique identifier for this project |
| `projectLabel` | string | projectId | Display label shown on Stream Deck |
| `idleThresholdSec` | number | 120 | Seconds before switching to idle mode |
| `enableDebugLog` | boolean | false | Write debug logs to shared/logs |
| `commandPollIntervalMs` | number | 250 | Poll interval for Stream Deck commands |

## Docker Setup

The extension runs inside a Docker container and communicates with Stream Deck via a shared volume mount.

### docker-compose.yml Example

```yaml
services:
  vscode:
    image: your-vscode-image
    volumes:
      - ./approval-deck:/shared/approval-deck
    # ... other config
```

Make sure the shared directory is writable by the VS Code server process.

## Commands

- `Approval Deck: Show Status` - Show current pending approval count
- `Approval Deck: Focus Approvals` - Focus the notifications panel
- `Approval Deck: Simulate Approval (Debug)` - Test approval detection

## State File Format

The extension writes state to `<sharedDir>/state/<projectId>.json`:

```json
{
  "schemaVersion": 1,
  "projectId": "my-project",
  "projectLabel": "My Project",
  "updatedAt": 1734030000000,
  "mode": "waiting_approval",
  "pendingApprovals": [
    {
      "requestId": "uuid",
      "since": 1734030000000,
      "message": "Allow command execution?",
      "options": ["Yes", "No"],
      "severity": "info"
    }
  ],
  "pendingCount": 1,
  "oldestPendingSince": 1734030000000,
  "lastPromptAt": 1734030000000,
  "lastResolvedAt": null,
  "lastActivityAt": 1734030000000
}
```

## Troubleshooting

### Extension not detecting approvals

1. Check the Output panel (View → Output → "Approval Deck")
2. Enable debug logging: `"approvalDeck.enableDebugLog": true`
3. Use the "Simulate Approval" command to test

### State not being written

1. Verify the shared directory exists and is writable
2. Check that `projectId` is set (defaults to workspace folder name)
3. Look for errors in the Output panel

### Commands from Stream Deck not working

1. Verify the command file path matches: `<sharedDir>/commands/<projectId>.ndjson`
2. Check `commandPollIntervalMs` is reasonable (250-500ms)
3. Ensure file permissions allow reading

## Security

- This extension does NOT automatically approve anything
- It only detects prompts and provides visual notifications
- No modification to Claude Code or its behavior
- All communication is file-based, no network required
