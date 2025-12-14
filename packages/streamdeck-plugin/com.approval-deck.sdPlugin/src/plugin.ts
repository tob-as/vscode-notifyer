import streamDeck from "@elgato/streamdeck";
import * as fs from "node:fs";
import * as path from "node:path";
import { exec } from "node:child_process";

// Use any types to avoid SDK type compatibility issues
type JsonObject = Record<string, unknown>;

// ============================================================================
// Types
// ============================================================================

interface ProjectState {
  schemaVersion: number;
  projectId: string;
  projectLabel: string;
  updatedAt: number;
  mode: "running" | "waiting_approval" | "idle" | "error";
  pendingApprovals: Array<{
    requestId: string;
    since: number;
    message: string;
    options: string[];
    severity: "info" | "warning" | "error";
  }>;
  pendingCount: number;
  oldestPendingSince: number | null;
  lastPromptAt: number | null;
  lastResolvedAt: number | null;
  lastActivityAt: number;
  // v1.1.0: New fields for context info
  lastTextEditAt?: number | null;
  sessionStartedAt?: number;
}

interface MonitorSettings extends JsonObject {
  sharedDirHost: string;
  projectId: string;
  projectLabelOverride: string;
  blinkIntervalMs: number;
  enableSound: boolean;
  soundCooldownMs: number;
}

interface SummarySettings extends JsonObject {
  sharedDirHost: string;
  blinkIntervalMs: number;
  enableSound: boolean;
  soundCooldownMs: number;
}

interface AutoMonitorSettings extends JsonObject {
  sharedDirHost: string;
  slotNumber: number;
  blinkIntervalMs: number;
  enableSound: boolean;
  soundCooldownMs: number;
}

interface SummaryState {
  totalPending: number;
  runningCount: number;
  idleCount: number;
  projects: Map<string, ProjectState>;
  oldestPendingProjectId: string | null;
  oldestPendingSince: number | null;
}

// ============================================================================
// Utilities
// ============================================================================

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 1) + "…";
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatShortDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${totalSeconds}s`;
}

function getBackgroundColor(state: ProjectState | null, blinkOn: boolean): string {
  if (!state) return "#333333";
  switch (state.mode) {
    case "waiting_approval":
      return blinkOn ? "#CC0000" : "#330000";
    case "running":
      return "#006600";
    case "idle":
      return blinkOn ? "#666600" : "#333300";
    case "error":
      return "#660066";
    default:
      return "#333333";
  }
}

function renderMonitorKey(state: ProjectState | null, blinkOn: boolean, labelOverride?: string): string {
  const bgColor = getBackgroundColor(state, blinkOn);
  const label = truncate(labelOverride || state?.projectLabel || "?", 10);
  const pendingCount = state?.pendingCount ?? 0;
  const now = Date.now();
  let timer = "--:--";
  if (state) {
    if (state.pendingCount > 0 && state.oldestPendingSince) {
      timer = formatDuration(now - state.oldestPendingSince);
    } else {
      timer = formatDuration(now - state.lastActivityAt);
    }
  }
  const countColor = pendingCount > 0 ? "#FFFFFF" : "#CCCCCC";

  return `<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
    <rect width="144" height="144" fill="${bgColor}"/>
    <text x="72" y="40" text-anchor="middle" fill="#FFFFFF" font-size="16" font-family="Arial" font-weight="bold">${escapeXml(label)}</text>
    <text x="72" y="85" text-anchor="middle" fill="${countColor}" font-size="36" font-family="Arial" font-weight="bold">${pendingCount}</text>
    <text x="72" y="125" text-anchor="middle" fill="#CCCCCC" font-size="16" font-family="Arial">${timer}</text>
  </svg>`;
}

function renderSummaryKey(summary: SummaryState | null, blinkOn: boolean): string {
  if (!summary || summary.projects.size === 0) {
    return `<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
      <rect width="144" height="144" fill="#333333"/>
      <text x="72" y="50" text-anchor="middle" fill="#FFFFFF" font-size="14" font-family="Arial" font-weight="bold">Summary</text>
      <text x="72" y="85" text-anchor="middle" fill="#CCCCCC" font-size="12" font-family="Arial">No Projects</text>
    </svg>`;
  }

  let bgColor = "#006600";
  if (summary.totalPending > 0) {
    bgColor = blinkOn ? "#CC0000" : "#330000";
  } else if (summary.runningCount === 0 && summary.idleCount > 0) {
    bgColor = blinkOn ? "#666600" : "#333300";
  }

  const projectCount = summary.projects.size;
  let statusText: string;
  if (summary.totalPending > 0 && summary.oldestPendingSince) {
    statusText = formatDuration(Date.now() - summary.oldestPendingSince);
  } else if (summary.runningCount > 0) {
    statusText = `${summary.runningCount} active`;
  } else {
    statusText = "all idle";
  }

  const pendingColor = summary.totalPending > 0 ? "#FFFFFF" : "#CCCCCC";

  return `<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
    <rect width="144" height="144" fill="${bgColor}"/>
    <text x="72" y="35" text-anchor="middle" fill="#FFFFFF" font-size="14" font-family="Arial" font-weight="bold">Summary</text>
    <text x="72" y="55" text-anchor="middle" fill="#CCCCCC" font-size="12" font-family="Arial">${projectCount} project${projectCount !== 1 ? "s" : ""}</text>
    <text x="72" y="95" text-anchor="middle" fill="${pendingColor}" font-size="32" font-family="Arial" font-weight="bold">${summary.totalPending}</text>
    <text x="72" y="125" text-anchor="middle" fill="#CCCCCC" font-size="14" font-family="Arial">${statusText}</text>
  </svg>`;
}

function renderAutoMonitorKey(state: ProjectState | null, slotNumber: number, blinkOn: boolean): string {
  // Empty slot
  if (!state) {
    return `<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
      <rect width="144" height="144" fill="#222222"/>
      <text x="72" y="65" text-anchor="middle" fill="#555555" font-size="14" font-family="Arial">Slot ${slotNumber}</text>
      <text x="72" y="90" text-anchor="middle" fill="#444444" font-size="24" font-family="Arial">---</text>
    </svg>`;
  }

  const bgColor = getBackgroundColor(state, blinkOn);
  const label = truncate(state.projectLabel, 10);
  const pendingCount = state.pendingCount;
  const now = Date.now();

  // Build context info line based on mode
  let contextInfo = "";
  if (state.mode === "waiting_approval" && state.oldestPendingSince) {
    // Show how long approval has been waiting
    contextInfo = formatDuration(now - state.oldestPendingSince);
  } else if (state.mode === "running") {
    // Show time since last text edit (if available) or activity
    if (state.lastTextEditAt) {
      const editAgo = formatShortDuration(now - state.lastTextEditAt);
      contextInfo = `${editAgo} edit`;
    } else {
      const activityAgo = formatShortDuration(now - state.lastActivityAt);
      contextInfo = `${activityAgo} act`;
    }
  } else if (state.mode === "idle") {
    // Show how long idle
    const idleTime = formatShortDuration(now - state.lastActivityAt);
    contextInfo = `${idleTime} idle`;
  }

  const countColor = pendingCount > 0 ? "#FFFFFF" : "#CCCCCC";

  return `<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
    <rect width="144" height="144" fill="${bgColor}"/>
    <text x="72" y="40" text-anchor="middle" fill="#FFFFFF" font-size="16" font-family="Arial" font-weight="bold">${escapeXml(label)}</text>
    <text x="72" y="85" text-anchor="middle" fill="${countColor}" font-size="36" font-family="Arial" font-weight="bold">${pendingCount}</text>
    <text x="72" y="125" text-anchor="middle" fill="#CCCCCC" font-size="14" font-family="Arial">${contextInfo}</text>
  </svg>`;
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function readProjectState(sharedDir: string, projectId: string): ProjectState | null {
  try {
    const statePath = path.join(sharedDir, "state", `${projectId}.json`);
    if (!fs.existsSync(statePath)) return null;
    const content = fs.readFileSync(statePath, "utf8");
    return JSON.parse(content) as ProjectState;
  } catch {
    return null;
  }
}

function writeCommand(sharedDir: string, projectId: string, type: string): void {
  try {
    const commandsDir = path.join(sharedDir, "commands");
    if (!fs.existsSync(commandsDir)) {
      fs.mkdirSync(commandsDir, { recursive: true });
    }
    const commandPath = path.join(commandsDir, `${projectId}.ndjson`);
    const command = { ts: Date.now(), type, projectId };
    fs.appendFileSync(commandPath, JSON.stringify(command) + "\n", "utf8");
  } catch (e) {
    streamDeck.logger.error(`Failed to write command: ${e}`);
  }
}

let lastSoundAt = 0;

function playSound(soundCooldownMs: number): void {
  const now = Date.now();
  if (now - lastSoundAt < soundCooldownMs) return;
  lastSoundAt = now;

  if (process.platform === "darwin") {
    exec('osascript -e "beep"');
  } else if (process.platform === "win32") {
    exec('powershell -c "[console]::beep(1000,300)"');
  }
}

// ============================================================================
// Monitor Action State
// ============================================================================

interface MonitorInstance {
  settings: MonitorSettings;
  pollInterval: ReturnType<typeof setInterval> | null;
  blinkInterval: ReturnType<typeof setInterval> | null;
  blinkOn: boolean;
  lastPendingCount: number;
  lastState: ProjectState | null;
}

const monitorInstances = new Map<string, MonitorInstance>();

function startMonitor(contextId: string, settings: MonitorSettings, setImage: (img: string) => Promise<void>): void {
  stopMonitor(contextId);

  const instance: MonitorInstance = {
    settings,
    pollInterval: null,
    blinkInterval: null,
    blinkOn: true,
    lastPendingCount: 0,
    lastState: null,
  };

  monitorInstances.set(contextId, instance);

  const updateKey = async () => {
    if (!settings.sharedDirHost || !settings.projectId) {
      const svg = renderMonitorKey(null, true, "Configure");
      await setImage(svgToDataUrl(svg));
      return;
    }

    const state = readProjectState(settings.sharedDirHost, settings.projectId);
    instance.lastState = state;

    // Check for new approvals
    const newCount = state?.pendingCount ?? 0;
    if (instance.lastPendingCount === 0 && newCount > 0 && settings.enableSound) {
      playSound(settings.soundCooldownMs);
    }
    instance.lastPendingCount = newCount;

    const svg = renderMonitorKey(state, instance.blinkOn, settings.projectLabelOverride);
    await setImage(svgToDataUrl(svg));
  };

  // Poll state every 500ms
  instance.pollInterval = setInterval(updateKey, 500);

  // Blink interval
  instance.blinkInterval = setInterval(() => {
    const state = instance.lastState;
    if (state?.mode === "waiting_approval" || state?.mode === "idle") {
      instance.blinkOn = !instance.blinkOn;
    }
  }, settings.blinkIntervalMs || 500);

  // Initial update
  updateKey();
}

function stopMonitor(contextId: string): void {
  const instance = monitorInstances.get(contextId);
  if (instance) {
    if (instance.pollInterval) clearInterval(instance.pollInterval);
    if (instance.blinkInterval) clearInterval(instance.blinkInterval);
    monitorInstances.delete(contextId);
  }
}

// ============================================================================
// Summary Action State
// ============================================================================

interface SummaryInstance {
  settings: SummarySettings;
  pollInterval: ReturnType<typeof setInterval> | null;
  blinkInterval: ReturnType<typeof setInterval> | null;
  blinkOn: boolean;
  lastTotalPending: number;
  lastSummary: SummaryState | null;
}

const summaryInstances = new Map<string, SummaryInstance>();

function readAllStates(sharedDir: string): SummaryState {
  const summary: SummaryState = {
    totalPending: 0,
    runningCount: 0,
    idleCount: 0,
    projects: new Map(),
    oldestPendingProjectId: null,
    oldestPendingSince: null,
  };

  try {
    const stateDir = path.join(sharedDir, "state");
    if (!fs.existsSync(stateDir)) return summary;

    const files = fs.readdirSync(stateDir).filter((f) => f.endsWith(".json") && !f.endsWith(".tmp"));

    for (const file of files) {
      const projectId = file.replace(".json", "");
      const state = readProjectState(sharedDir, projectId);
      if (state) {
        summary.projects.set(projectId, state);
        summary.totalPending += state.pendingCount;

        if (state.mode === "running" || state.mode === "waiting_approval") {
          summary.runningCount++;
        } else if (state.mode === "idle") {
          summary.idleCount++;
        }

        if (state.oldestPendingSince !== null) {
          if (summary.oldestPendingSince === null || state.oldestPendingSince < summary.oldestPendingSince) {
            summary.oldestPendingSince = state.oldestPendingSince;
            summary.oldestPendingProjectId = projectId;
          }
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return summary;
}

/**
 * Get project for a specific slot number.
 * Projects are sorted: Pending first (by count desc), then by activity.
 */
function getProjectForSlot(sharedDir: string, slotNumber: number): ProjectState | null {
  const summary = readAllStates(sharedDir);
  const projects = Array.from(summary.projects.values());

  // Sort: Pending first, then by activity
  projects.sort((a, b) => {
    // Projects with pending come first
    if (a.pendingCount > 0 && b.pendingCount === 0) return -1;
    if (b.pendingCount > 0 && a.pendingCount === 0) return 1;
    // If both have pending: higher count first
    if (a.pendingCount !== b.pendingCount) return b.pendingCount - a.pendingCount;
    // Then by last activity (most recent first)
    return b.lastActivityAt - a.lastActivityAt;
  });

  // Slot is 1-based, array is 0-based
  return projects[slotNumber - 1] || null;
}

function startSummary(contextId: string, settings: SummarySettings, setImage: (img: string) => Promise<void>): void {
  stopSummary(contextId);

  const instance: SummaryInstance = {
    settings,
    pollInterval: null,
    blinkInterval: null,
    blinkOn: true,
    lastTotalPending: 0,
    lastSummary: null,
  };

  summaryInstances.set(contextId, instance);

  const updateKey = async () => {
    if (!settings.sharedDirHost) {
      const svg = renderSummaryKey(null, true);
      await setImage(svgToDataUrl(svg));
      return;
    }

    const summary = readAllStates(settings.sharedDirHost);
    instance.lastSummary = summary;

    // Check for new approvals
    if (instance.lastTotalPending === 0 && summary.totalPending > 0 && settings.enableSound) {
      playSound(settings.soundCooldownMs);
    }
    instance.lastTotalPending = summary.totalPending;

    const svg = renderSummaryKey(summary, instance.blinkOn);
    await setImage(svgToDataUrl(svg));
  };

  // Poll state every 1000ms
  instance.pollInterval = setInterval(updateKey, 1000);

  // Blink interval
  instance.blinkInterval = setInterval(() => {
    const summary = instance.lastSummary;
    if (summary && (summary.totalPending > 0 || (summary.runningCount === 0 && summary.idleCount > 0))) {
      instance.blinkOn = !instance.blinkOn;
    }
  }, settings.blinkIntervalMs || 500);

  // Initial update
  updateKey();
}

function stopSummary(contextId: string): void {
  const instance = summaryInstances.get(contextId);
  if (instance) {
    if (instance.pollInterval) clearInterval(instance.pollInterval);
    if (instance.blinkInterval) clearInterval(instance.blinkInterval);
    summaryInstances.delete(contextId);
  }
}

// ============================================================================
// Auto Monitor Action State (v1.1.0)
// ============================================================================

interface AutoMonitorInstance {
  settings: AutoMonitorSettings;
  pollInterval: ReturnType<typeof setInterval> | null;
  blinkInterval: ReturnType<typeof setInterval> | null;
  blinkOn: boolean;
  lastPendingCount: number;
  lastProjectId: string | null;
}

const autoMonitorInstances = new Map<string, AutoMonitorInstance>();

function startAutoMonitor(contextId: string, settings: AutoMonitorSettings, setImage: (img: string) => Promise<void>): void {
  stopAutoMonitor(contextId);

  const instance: AutoMonitorInstance = {
    settings,
    pollInterval: null,
    blinkInterval: null,
    blinkOn: true,
    lastPendingCount: 0,
    lastProjectId: null,
  };

  autoMonitorInstances.set(contextId, instance);

  const updateKey = async () => {
    if (!settings.sharedDirHost) {
      const svg = `<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
        <rect width="144" height="144" fill="#333333"/>
        <text x="72" y="65" text-anchor="middle" fill="#FFFFFF" font-size="12" font-family="Arial">Configure</text>
        <text x="72" y="85" text-anchor="middle" fill="#888888" font-size="10" font-family="Arial">Shared Dir</text>
      </svg>`;
      await setImage(svgToDataUrl(svg));
      return;
    }

    const slotNum = Number(settings.slotNumber) || 1;
    const state = getProjectForSlot(settings.sharedDirHost, slotNum);
    instance.lastProjectId = state?.projectId || null;

    // Check for new approvals (on current slot's project)
    const newCount = state?.pendingCount ?? 0;
    if (instance.lastPendingCount === 0 && newCount > 0 && settings.enableSound) {
      playSound(settings.soundCooldownMs);
    }
    instance.lastPendingCount = newCount;

    const svg = renderAutoMonitorKey(state, slotNum, instance.blinkOn);
    await setImage(svgToDataUrl(svg));
  };

  // Poll state every 500ms
  instance.pollInterval = setInterval(updateKey, 500);

  // Blink interval
  instance.blinkInterval = setInterval(() => {
    const slotNum = Number(settings.slotNumber) || 1;
    const state = getProjectForSlot(settings.sharedDirHost, slotNum);
    if (state?.mode === "waiting_approval" || state?.mode === "idle") {
      instance.blinkOn = !instance.blinkOn;
    }
  }, settings.blinkIntervalMs || 500);

  // Initial update
  updateKey();
}

function stopAutoMonitor(contextId: string): void {
  const instance = autoMonitorInstances.get(contextId);
  if (instance) {
    if (instance.pollInterval) clearInterval(instance.pollInterval);
    if (instance.blinkInterval) clearInterval(instance.blinkInterval);
    autoMonitorInstances.delete(contextId);
  }
}

// ============================================================================
// Register Actions
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LogLevel = (streamDeck as any).LogLevel || { DEBUG: 0 };
streamDeck.logger.setLevel(LogLevel.DEBUG);

// Monitor Action
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(streamDeck.actions.registerAction as any)({
  manifestId: "com.approval-deck.monitor",

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onWillAppear(ev: any) {
    const settings: MonitorSettings = {
      sharedDirHost: "",
      projectId: "",
      projectLabelOverride: "",
      blinkIntervalMs: 500,
      enableSound: true,
      soundCooldownMs: 1500,
      ...ev.payload.settings,
    };
    startMonitor(ev.action.id, settings, (img: string) => ev.action.setImage(img));
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onWillDisappear(ev: any) {
    stopMonitor(ev.action.id);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDidReceiveSettings(ev: any) {
    const settings: MonitorSettings = {
      sharedDirHost: "",
      projectId: "",
      projectLabelOverride: "",
      blinkIntervalMs: 500,
      enableSound: true,
      soundCooldownMs: 1500,
      ...ev.payload.settings,
    };
    startMonitor(ev.action.id, settings, (img: string) => ev.action.setImage(img));
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onKeyDown(ev: any) {
    const settings = ev.payload.settings as MonitorSettings;
    if (settings.sharedDirHost && settings.projectId) {
      writeCommand(settings.sharedDirHost, settings.projectId, "focus_approvals");
      streamDeck.logger.info(`Sent focus_approvals for ${settings.projectId}`);
    }
  },
});

// Summary Action
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(streamDeck.actions.registerAction as any)({
  manifestId: "com.approval-deck.summary",

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onWillAppear(ev: any) {
    const settings: SummarySettings = {
      sharedDirHost: "",
      blinkIntervalMs: 500,
      enableSound: true,
      soundCooldownMs: 1500,
      ...ev.payload.settings,
    };
    startSummary(ev.action.id, settings, (img: string) => ev.action.setImage(img));
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onWillDisappear(ev: any) {
    stopSummary(ev.action.id);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDidReceiveSettings(ev: any) {
    const settings: SummarySettings = {
      sharedDirHost: "",
      blinkIntervalMs: 500,
      enableSound: true,
      soundCooldownMs: 1500,
      ...ev.payload.settings,
    };
    startSummary(ev.action.id, settings, (img: string) => ev.action.setImage(img));
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onKeyDown(ev: any) {
    const settings = ev.payload.settings as SummarySettings;
    if (settings.sharedDirHost) {
      const summary = readAllStates(settings.sharedDirHost);
      if (summary.oldestPendingProjectId) {
        writeCommand(settings.sharedDirHost, summary.oldestPendingProjectId, "focus_approvals");
        streamDeck.logger.info(`Sent focus_approvals for oldest: ${summary.oldestPendingProjectId}`);
      }
    }
  },
});

// Auto Monitor Action (v1.1.0)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(streamDeck.actions.registerAction as any)({
  manifestId: "com.approval-deck.auto-monitor",

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onWillAppear(ev: any) {
    const settings: AutoMonitorSettings = {
      sharedDirHost: "",
      slotNumber: 1,
      blinkIntervalMs: 500,
      enableSound: true,
      soundCooldownMs: 1500,
      ...ev.payload.settings,
    };
    startAutoMonitor(ev.action.id, settings, (img: string) => ev.action.setImage(img));
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onWillDisappear(ev: any) {
    stopAutoMonitor(ev.action.id);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDidReceiveSettings(ev: any) {
    const settings: AutoMonitorSettings = {
      sharedDirHost: "",
      slotNumber: 1,
      blinkIntervalMs: 500,
      enableSound: true,
      soundCooldownMs: 1500,
      ...ev.payload.settings,
    };
    startAutoMonitor(ev.action.id, settings, (img: string) => ev.action.setImage(img));
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onKeyDown(ev: any) {
    const settings = ev.payload.settings as AutoMonitorSettings;
    const instance = autoMonitorInstances.get(ev.action.id);
    if (settings.sharedDirHost && instance?.lastProjectId) {
      writeCommand(settings.sharedDirHost, instance.lastProjectId, "focus_approvals");
      streamDeck.logger.info(`Sent focus_approvals for slot ${settings.slotNumber}: ${instance.lastProjectId}`);
    }
  },
});

// Connect to Stream Deck
streamDeck.connect();
streamDeck.logger.info("Approval Deck plugin v1.1.0 started");
