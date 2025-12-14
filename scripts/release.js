#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const VSCODE_PKG = path.join(ROOT, "packages/vscode-extension/package.json");
const STREAMDECK_PKG = path.join(ROOT, "packages/streamdeck-plugin/package.json");
const STREAMDECK_MANIFEST = path.join(ROOT, "packages/streamdeck-plugin/com.approval-deck.sdPlugin/manifest.json");

function getVersion() {
  const pkg = JSON.parse(fs.readFileSync(VSCODE_PKG, "utf-8"));
  return pkg.version;
}

function run(cmd, cwd = ROOT) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

function main() {
  const version = getVersion();
  const releaseDir = path.join(ROOT, "releases", `v${version}`);

  console.log(`\n=== Building Release v${version} ===\n`);

  // Create release directory
  fs.mkdirSync(releaseDir, { recursive: true });

  // Build and package VS Code extension
  console.log("\n--- Building VS Code Extension ---\n");
  run("npm run package -w packages/vscode-extension");

  // Build and package Stream Deck plugin
  console.log("\n--- Building Stream Deck Plugin ---\n");
  run("npm run pack -w packages/streamdeck-plugin");

  // Copy artifacts
  console.log("\n--- Copying Artifacts ---\n");

  const vsixFile = `approval-deck-${version}.vsix`;
  const vsixSrc = path.join(ROOT, "packages/vscode-extension", vsixFile);
  const vsixDest = path.join(releaseDir, vsixFile);
  fs.copyFileSync(vsixSrc, vsixDest);
  console.log(`Copied: ${vsixFile}`);

  const sdFile = "com.approval-deck.streamDeckPlugin";
  const sdSrc = path.join(ROOT, "packages/streamdeck-plugin", sdFile);
  const sdDest = path.join(releaseDir, sdFile);
  fs.copyFileSync(sdSrc, sdDest);
  console.log(`Copied: ${sdFile}`);

  // Generate INSTALL-MAC.md
  console.log("\n--- Generating INSTALL-MAC.md ---\n");
  const installMd = generateInstallMd(version);
  fs.writeFileSync(path.join(releaseDir, "INSTALL-MAC.md"), installMd);
  console.log("Created: INSTALL-MAC.md");

  // Summary
  console.log(`\n=== Release v${version} Complete ===\n`);
  console.log(`Output: ${releaseDir}`);
  console.log("Files:");
  fs.readdirSync(releaseDir).forEach((f) => {
    const stat = fs.statSync(path.join(releaseDir, f));
    console.log(`  - ${f} (${(stat.size / 1024).toFixed(1)} KB)`);
  });
}

function generateInstallMd(version) {
  return `# Approval Deck v${version} - Mac Installation Guide

Diese Anleitung beschreibt die Installation auf macOS, wenn VS Code in einem Docker-Container läuft.

## Voraussetzungen

- macOS 10.15 (Catalina) oder neuer
- Docker Desktop für Mac installiert und läuft
- Elgato Stream Deck Software Version 6.4 oder neuer
- VS Code läuft in einem Docker-Container

## Enthaltene Dateien

\`\`\`
releases/v${version}/
├── approval-deck-${version}.vsix          # VS Code Extension
├── com.approval-deck.streamDeckPlugin     # Stream Deck Plugin
└── INSTALL-MAC.md                         # Diese Anleitung
\`\`\`

---

## Schritt 1: Shared-Verzeichnis erstellen

\`\`\`bash
mkdir -p ~/approval-deck-shared
\`\`\`

---

## Schritt 2: Docker Volume-Mount hinzufügen

Füge in deiner \`docker-compose.yml\` hinzu:

\`\`\`yaml
volumes:
  - ~/approval-deck-shared:/shared/approval-deck
\`\`\`

Dann Container neu starten: \`docker compose down && docker compose up -d\`

---

## Schritt 3: VS Code Extension installieren

\`\`\`bash
# Kopiere VSIX in Container
docker cp approval-deck-${version}.vsix <container-name>:/tmp/

# Installiere Extension
docker exec <container-name> code-server --install-extension /tmp/approval-deck-${version}.vsix
\`\`\`

Oder über VS Code UI: \`Cmd+Shift+P\` → \`Extensions: Install from VSIX...\`

---

## Schritt 4: Stream Deck Plugin installieren

**Doppelklicke** auf \`com.approval-deck.streamDeckPlugin\`

Die Stream Deck App öffnet sich und installiert das Plugin automatisch.

---

## Schritt 5: Konfigurieren

### Stream Deck
1. Ziehe "Approval Monitor" auf eine Taste
2. Setze **Shared Directory (Host)**: \`/Users/DEIN-USERNAME/approval-deck-shared\`

### VS Code (im Container)
1. \`Cmd+,\` → Suche "Approval Deck"
2. **Shared Dir** ist bereits \`/shared/approval-deck\` (Default)

**Wichtig:** Die **Project ID** muss auf beiden Seiten gleich sein (oder leer lassen für Auto-Erkennung).

---

## Schritt 6: Testen

Im VS Code Container:
- \`Cmd+Shift+P\` → \`Approval Deck: Show Status\`
- \`Cmd+Shift+P\` → \`Approval Deck: Simulate Approval (Debug)\`

Die Stream Deck Taste sollte blinken!

---

## Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| Extension startet nicht | \`Developer: Reload Window\` in VS Code |
| Taste zeigt nichts | Project ID und Shared Directory prüfen |
| Kein Blinken | Stream Deck App neu starten |

Logs prüfen:
- VS Code: \`Help > Toggle Developer Tools\`
- Stream Deck: \`~/approval-deck-shared/logs/\`

---

**Version:** ${version}
**Datum:** ${new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
`;
}

main();
