# Approval Deck - Stream Deck Plugin

Stream Deck plugin that monitors Claude Code approval prompts and provides visual notifications with blinking keys and sound alerts.

## Features

- **Approval Monitor Key**: Per-project button showing pending approval count and timer
- **Approval Summary Key**: Global overview of all projects
- **Visual Feedback**: Color-coded keys with blinking for pending approvals
- **Sound Alerts**: Configurable sound notifications when new approvals arrive
- **One-Click Focus**: Press key to focus VS Code notifications for quick approval

## Requirements

- Stream Deck Software 6.4+
- Node.js 20+ (for building)
- Elgato CLI (`npm install -g @elgato/cli`)

## Installation

### Development Mode (Linking)

1. Build the plugin:
   ```bash
   cd packages/streamdeck-plugin
   npm install
   npm run build
   ```

2. Link to Stream Deck:
   ```bash
   npm run link
   # Or manually: streamdeck link com.approval-deck.sdPlugin
   ```

3. Restart Stream Deck software

### Production (Distribution)

1. Build and pack:
   ```bash
   npm run build
   npm run pack
   # Or manually: streamdeck pack com.approval-deck.sdPlugin
   ```

2. Double-click the generated `.streamDeckPlugin` file to install

## Configuration

### Approval Monitor Key

Each monitor key tracks a single project:

| Setting | Description |
|---------|-------------|
| **Shared Directory** | Host path to shared mount (e.g., `C:\Users\me\approval-deck`) |
| **Project ID** | Must match `approvalDeck.projectId` in VS Code |
| **Label Override** | Optional custom label for the key |
| **Blink Interval** | Speed of blinking in ms (default: 500) |
| **Enable Sound** | Play sound on new approvals |
| **Sound Cooldown** | Minimum time between sounds in ms |

### Approval Summary Key

Summary key monitors all projects in the shared directory:

| Setting | Description |
|---------|-------------|
| **Shared Directory** | Host path to shared mount |
| **Blink Interval** | Speed of blinking in ms |
| **Enable Sound** | Play sound on new approvals |
| **Sound Cooldown** | Minimum time between sounds |

## Key Colors

| Color | State |
|-------|-------|
| **Red (blinking)** | Waiting for approval |
| **Green** | Running (active Claude session) |
| **Yellow (slow blink)** | Idle (no activity) |
| **Purple** | Error state |
| **Gray** | Not connected |

## Key Display

```
┌──────────────┐
│   My App     │  <- Project label
│              │
│     2        │  <- Pending count
│              │
│   1:23       │  <- Timer (mm:ss)
└──────────────┘
```

Timer shows:
- If pending > 0: Time since oldest pending approval
- If pending = 0: Time since last activity

## Setup with Docker

### Directory Structure

```
/host/approval-deck/          # On host (Windows/macOS)
├── state/
│   └── my-project.json       # Written by VS Code
├── commands/
│   └── my-project.ndjson     # Written by Stream Deck
└── logs/
    └── my-project.ndjson     # Optional debug logs
```

### docker-compose.yml

```yaml
services:
  vscode:
    image: your-vscode-image
    volumes:
      # Map host directory to container path
      - /host/approval-deck:/shared/approval-deck
```

### Stream Deck Configuration

In the Approval Monitor settings:
- **Shared Directory**: `/host/approval-deck` (the HOST path!)
- **Project ID**: `my-project`

In VS Code settings (inside container):
```json
{
  "approvalDeck.sharedDir": "/shared/approval-deck",
  "approvalDeck.projectId": "my-project"
}
```

## Custom Sound

To use a custom alert sound:

1. Place a WAV file at `com.approval-deck.sdPlugin/assets/alert.wav`
2. Rebuild the plugin

If no sound file is found, the system beep is used.

## Troubleshooting

### Key shows "Not Connected"

1. Verify the shared directory path is correct (use HOST path, not container path)
2. Check that the state file exists: `<sharedDir>/state/<projectId>.json`
3. Ensure VS Code extension is active and has written initial state

### No sound playing

1. Check "Enable Sound" is checked in settings
2. Verify sound cooldown hasn't been triggered by recent alerts
3. On macOS: ensure `afplay` is available
4. On Windows: ensure PowerShell can run

### Key not updating

1. Check Stream Deck software is running
2. Verify file permissions on shared directory
3. Restart Stream Deck software
4. Check plugin logs in Stream Deck app

### Commands not reaching VS Code

1. Verify VS Code extension is active (check Output panel)
2. Check command file is being written: `<sharedDir>/commands/<projectId>.ndjson`
3. Ensure VS Code has read permission on the command file

## Development

### Build

```bash
npm install
npm run build    # Compile TypeScript
npm run watch    # Watch mode
```

### Debug

1. Link plugin: `npm run link`
2. Enable developer mode in Stream Deck
3. View logs in Stream Deck app
4. Use `console.log()` for debugging

### Plugin Structure

```
com.approval-deck.sdPlugin/
├── manifest.json          # Plugin manifest
├── bin/                   # Compiled JavaScript
├── src/                   # TypeScript source
│   ├── plugin.ts          # Entry point
│   ├── actions/           # Stream Deck actions
│   ├── stateWatcher.ts    # File watching
│   ├── svgRenderer.ts     # Key image rendering
│   ├── soundPlayer.ts     # Cross-platform sound
│   └── commandWriter.ts   # Command file writing
├── pi/                    # Property Inspector HTML
├── images/                # Icons and images
└── assets/                # Sound files
```
