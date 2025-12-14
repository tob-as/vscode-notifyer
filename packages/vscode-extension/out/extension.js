"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode3 = __toESM(require("vscode"));
var path3 = __toESM(require("path"));

// src/stateManager.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));

// src/types.ts
var STATE_SCHEMA_VERSION = 1;

// src/stateManager.ts
var StateManager = class {
  config;
  pendingApprovals = /* @__PURE__ */ new Map();
  lastActivityAt = Date.now();
  lastPromptAt = null;
  lastResolvedAt = null;
  lastTextEditAt = null;
  sessionStartedAt = Date.now();
  outputChannel;
  idleCheckInterval = null;
  constructor(config, outputChannel2) {
    this.config = config;
    this.outputChannel = outputChannel2;
    this.ensureDirectories();
    this.startIdleCheck();
  }
  /**
   * Ensure shared directories exist
   */
  ensureDirectories() {
    const dirs = [
      path.join(this.config.sharedDir, "state"),
      path.join(this.config.sharedDir, "commands"),
      path.join(this.config.sharedDir, "logs")
    ];
    for (const dir of dirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          this.log("info", `Created directory: ${dir}`);
        }
      } catch (error) {
        this.log("error", `Failed to create directory: ${dir}`, { error });
      }
    }
  }
  /**
   * Start periodic idle check
   */
  startIdleCheck() {
    this.idleCheckInterval = setInterval(() => {
      this.checkAndUpdateIdleState();
    }, 1e4);
  }
  /**
   * Check if we should switch to idle mode
   */
  async checkAndUpdateIdleState() {
    if (this.pendingApprovals.size > 0) {
      return;
    }
    const now = Date.now();
    const idleThresholdMs = this.config.idleThresholdSec * 1e3;
    if (now - this.lastActivityAt > idleThresholdMs) {
      await this.writeState();
    }
  }
  /**
   * Get state file path
   */
  getStatePath() {
    return path.join(
      this.config.sharedDir,
      "state",
      `${this.config.projectId}.json`
    );
  }
  /**
   * Get temp state file path for atomic writes
   */
  getTempStatePath() {
    return path.join(
      this.config.sharedDir,
      "state",
      `${this.config.projectId}.json.tmp`
    );
  }
  /**
   * Get log file path
   */
  getLogPath() {
    return path.join(
      this.config.sharedDir,
      "logs",
      `${this.config.projectId}.ndjson`
    );
  }
  /**
   * Calculate current project mode
   */
  calculateMode() {
    if (this.pendingApprovals.size > 0) {
      return "waiting_approval";
    }
    const now = Date.now();
    const idleThresholdMs = this.config.idleThresholdSec * 1e3;
    if (now - this.lastActivityAt > idleThresholdMs) {
      return "idle";
    }
    return "running";
  }
  /**
   * Build current state object
   */
  buildState() {
    const approvals = Array.from(this.pendingApprovals.values());
    const oldestPendingSince = approvals.length > 0 ? Math.min(...approvals.map((a) => a.since)) : null;
    return {
      schemaVersion: STATE_SCHEMA_VERSION,
      projectId: this.config.projectId,
      projectLabel: this.config.projectLabel || this.config.projectId,
      updatedAt: Date.now(),
      mode: this.calculateMode(),
      pendingApprovals: approvals,
      pendingCount: approvals.length,
      oldestPendingSince,
      lastPromptAt: this.lastPromptAt,
      lastResolvedAt: this.lastResolvedAt,
      lastActivityAt: this.lastActivityAt,
      lastTextEditAt: this.lastTextEditAt,
      sessionStartedAt: this.sessionStartedAt
    };
  }
  /**
   * Write state atomically (write to temp, then rename)
   */
  async writeState() {
    const state = this.buildState();
    const statePath = this.getStatePath();
    const tempPath = this.getTempStatePath();
    try {
      const content = JSON.stringify(state, null, 2);
      await fs.promises.writeFile(tempPath, content, "utf8");
      await fs.promises.rename(tempPath, statePath);
      this.log("debug", "State written", {
        mode: state.mode,
        pendingCount: state.pendingCount
      });
    } catch (error) {
      this.log("error", "Failed to write state", { error });
      try {
        await fs.promises.unlink(tempPath);
      } catch {
      }
    }
  }
  /**
   * Add a pending approval
   */
  async addPendingApproval(approval) {
    this.pendingApprovals.set(approval.requestId, approval);
    this.lastActivityAt = Date.now();
    this.lastPromptAt = Date.now();
    this.log("info", "Approval added", {
      requestId: approval.requestId,
      message: approval.message.substring(0, 100)
    });
    await this.writeState();
  }
  /**
   * Remove a pending approval (resolved)
   */
  async removePendingApproval(requestId, response) {
    const approval = this.pendingApprovals.get(requestId);
    if (approval) {
      this.pendingApprovals.delete(requestId);
      this.lastActivityAt = Date.now();
      this.lastResolvedAt = Date.now();
      this.log("info", "Approval resolved", {
        requestId,
        response,
        durationMs: Date.now() - approval.since
      });
      await this.writeState();
    }
  }
  /**
   * Get current pending count
   */
  getPendingCount() {
    return this.pendingApprovals.size;
  }
  /**
   * Update activity timestamp
   */
  async updateActivity() {
    this.lastActivityAt = Date.now();
    await this.writeState();
  }
  /**
   * Update last text edit timestamp (v1.1.0)
   */
  async updateTextEdit() {
    this.lastTextEditAt = Date.now();
    this.lastActivityAt = Date.now();
    await this.writeState();
  }
  /**
   * Log message to output channel and optionally to file
   */
  log(level, message, data) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    if (level !== "debug" || this.config.enableDebugLog) {
      this.outputChannel.appendLine(
        data ? `${logMessage} ${JSON.stringify(data)}` : logMessage
      );
    }
    if (this.config.enableDebugLog) {
      const entry = {
        ts: Date.now(),
        level,
        message,
        data
      };
      try {
        fs.appendFileSync(
          this.getLogPath(),
          JSON.stringify(entry) + "\n",
          "utf8"
        );
      } catch {
      }
    }
  }
  /**
   * Clean up on disposal
   */
  dispose() {
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
      this.idleCheckInterval = null;
    }
    this.writeState().catch(() => {
    });
  }
};

// src/commandHandler.ts
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var vscode2 = __toESM(require("vscode"));

// src/messageInterceptor.ts
var vscode = __toESM(require("vscode"));

// ../../node_modules/uuid/dist/esm-node/rng.js
var import_crypto = __toESM(require("crypto"));
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    import_crypto.default.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// ../../node_modules/uuid/dist/esm-node/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

// ../../node_modules/uuid/dist/esm-node/native.js
var import_crypto2 = __toESM(require("crypto"));
var native_default = {
  randomUUID: import_crypto2.default.randomUUID
};

// ../../node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// src/approvalDetector.ts
var APPROVAL_BUTTON_PATTERNS = [
  // Yes/No patterns (most common for Claude)
  { buttons: ["yes", "no"], severity: "info" },
  { buttons: ["yes", "no", "yes, and don't ask again"], severity: "info" },
  { buttons: ["yes", "no", "always allow"], severity: "info" },
  // Allow/Deny patterns
  { buttons: ["allow", "deny"], severity: "warning" },
  { buttons: ["allow", "deny", "always allow"], severity: "warning" },
  { buttons: ["allow once", "allow always", "deny"], severity: "warning" },
  // Approve/Reject patterns
  { buttons: ["approve", "reject"], severity: "warning" },
  // Continue/Cancel patterns (for dangerous operations)
  { buttons: ["continue", "cancel"], severity: "warning" }
];
var APPROVAL_KEYWORDS = [
  // Permission-related
  "permission",
  "allow",
  "approve",
  "authorize",
  "grant",
  // Action-related
  "execute",
  "run",
  "command",
  "terminal",
  "shell",
  // Claude-specific
  "web search",
  "web fetch",
  "file access",
  "tool",
  "wants to",
  "would like to",
  // Git-related
  "git push",
  "git commit",
  "git checkout",
  // Safety-related
  "dangerous",
  "destructive",
  "irreversible"
];
var EXCLUSION_KEYWORDS = [
  "reload",
  "restart",
  "update available",
  "extension",
  "install",
  "upgrade"
];
function normalize(str) {
  return str.toLowerCase().trim();
}
function matchesButtonPattern(options) {
  const normalizedOptions = new Set(options.map(normalize));
  for (const pattern of APPROVAL_BUTTON_PATTERNS) {
    const patternSet = new Set(pattern.buttons);
    let allPresent = true;
    for (const button of patternSet) {
      if (!normalizedOptions.has(button)) {
        const hasPartialMatch = [...normalizedOptions].some(
          (opt) => opt.includes(button) || button.includes(opt)
        );
        if (!hasPartialMatch) {
          allPresent = false;
          break;
        }
      }
    }
    if (allPresent) {
      return { matches: true, severity: pattern.severity };
    }
  }
  const hasDontAskAgain = [...normalizedOptions].some(
    (opt) => opt.includes("don't ask again") || opt.includes("always allow") || opt.includes("allow always")
  );
  if (hasDontAskAgain && normalizedOptions.size >= 2) {
    return { matches: true, severity: "info" };
  }
  return { matches: false, severity: "info" };
}
function containsApprovalKeywords(message) {
  const lowerMessage = normalize(message);
  return APPROVAL_KEYWORDS.some((keyword) => lowerMessage.includes(keyword));
}
function containsExclusionKeywords(message) {
  const lowerMessage = normalize(message);
  return EXCLUSION_KEYWORDS.some((keyword) => lowerMessage.includes(keyword));
}
function detectSeverityFromMessage(message) {
  const lowerMessage = normalize(message);
  if (lowerMessage.includes("dangerous") || lowerMessage.includes("destructive") || lowerMessage.includes("irreversible") || lowerMessage.includes("delete") || lowerMessage.includes("remove all")) {
    return "error";
  }
  if (lowerMessage.includes("warning") || lowerMessage.includes("caution") || lowerMessage.includes("git push") || lowerMessage.includes("external")) {
    return "warning";
  }
  return "info";
}
function detectApproval(message, options) {
  if (options.length < 2) {
    return {
      isApproval: false,
      severity: "info",
      reason: "Too few options"
    };
  }
  if (containsExclusionKeywords(message)) {
    return {
      isApproval: false,
      severity: "info",
      reason: "Contains exclusion keywords"
    };
  }
  const buttonMatch = matchesButtonPattern(options);
  const hasApprovalKeywords = containsApprovalKeywords(message);
  if (buttonMatch.matches && hasApprovalKeywords) {
    const messageSeverity = detectSeverityFromMessage(message);
    const severity = messageSeverity === "error" ? "error" : messageSeverity === "warning" ? "warning" : buttonMatch.severity;
    return {
      isApproval: true,
      severity,
      reason: `Button pattern match + keywords: ${options.join(", ")}`
    };
  }
  if (buttonMatch.matches) {
    return {
      isApproval: true,
      severity: buttonMatch.severity,
      reason: `Button pattern match: ${options.join(", ")}`
    };
  }
  if (hasApprovalKeywords) {
    const normalizedOptions = options.map(normalize);
    const looksLikePermission = normalizedOptions.some(
      (opt) => opt.includes("yes") || opt.includes("no") || opt.includes("allow") || opt.includes("deny") || opt.includes("ok") || opt.includes("cancel")
    );
    if (looksLikePermission) {
      return {
        isApproval: true,
        severity: detectSeverityFromMessage(message),
        reason: `Approval keywords with permission-like buttons: ${options.join(", ")}`
      };
    }
  }
  return {
    isApproval: false,
    severity: "info",
    reason: "No approval pattern detected"
  };
}

// src/messageInterceptor.ts
var originalShowInformationMessage;
var originalShowWarningMessage;
var originalShowErrorMessage;
var stateManager = null;
var pendingResolvers = /* @__PURE__ */ new Map();
function extractOptions(items) {
  return items.map(
    (item) => typeof item === "string" ? item : item.title
  );
}
function extractResponse(result) {
  if (result === void 0)
    return void 0;
  return typeof result === "string" ? result : result.title;
}
async function handleApprovalPrompt(severity, message, items, originalFn) {
  const requestId = v4_default();
  const approval = {
    requestId,
    since: Date.now(),
    message,
    options: extractOptions(items),
    severity
  };
  await stateManager?.addPendingApproval(approval);
  return new Promise((resolveOuter) => {
    let resolved = false;
    pendingResolvers.set(requestId, {
      resolve: (response) => {
        if (resolved)
          return;
        resolved = true;
        pendingResolvers.delete(requestId);
        const item = response ? items.find((i) => extractResponse(i) === response) : void 0;
        stateManager?.removePendingApproval(requestId, response);
        resolveOuter(item);
      },
      items
    });
    originalFn(message, ...items).then((result) => {
      if (resolved)
        return;
      resolved = true;
      pendingResolvers.delete(requestId);
      stateManager?.removePendingApproval(requestId, extractResponse(result));
      resolveOuter(result);
    }).catch((error) => {
      if (resolved)
        return;
      resolved = true;
      pendingResolvers.delete(requestId);
      stateManager?.removePendingApproval(requestId, "error");
      resolveOuter(void 0);
      stateManager?.log("error", "Approval dialog error", { error: String(error) });
    });
  });
}
function resolveApproval(requestId, response) {
  const pending = pendingResolvers.get(requestId);
  if (pending) {
    pending.resolve(response);
    return true;
  }
  return false;
}
function createInterceptedShowInformationMessage() {
  function interceptedShowInformationMessage(message, ...args) {
    let options;
    let items;
    if (args.length > 0 && typeof args[0] === "object" && "modal" in args[0]) {
      options = args[0];
      items = args.slice(1);
    } else {
      items = args;
    }
    const stringOptions = extractOptions(items);
    const detection = detectApproval(message, stringOptions);
    stateManager?.log("debug", "showInformationMessage called", {
      message: message.substring(0, 100),
      options: stringOptions,
      isApproval: detection.isApproval,
      reason: detection.reason
    });
    if (detection.isApproval && stateManager) {
      return handleApprovalPrompt(
        detection.severity,
        message,
        items,
        (msg, ...itms) => options ? originalShowInformationMessage(msg, options, ...itms) : originalShowInformationMessage(msg, ...itms)
      );
    }
    return options ? originalShowInformationMessage(message, options, ...items) : originalShowInformationMessage(message, ...items);
  }
  return interceptedShowInformationMessage;
}
function createInterceptedShowWarningMessage() {
  function interceptedShowWarningMessage(message, ...args) {
    let options;
    let items;
    if (args.length > 0 && typeof args[0] === "object" && "modal" in args[0]) {
      options = args[0];
      items = args.slice(1);
    } else {
      items = args;
    }
    const stringOptions = extractOptions(items);
    const detection = detectApproval(message, stringOptions);
    stateManager?.log("debug", "showWarningMessage called", {
      message: message.substring(0, 100),
      options: stringOptions,
      isApproval: detection.isApproval,
      reason: detection.reason
    });
    if (detection.isApproval && stateManager) {
      const severity = detection.severity === "info" ? "warning" : detection.severity;
      return handleApprovalPrompt(
        severity,
        message,
        items,
        (msg, ...itms) => options ? originalShowWarningMessage(msg, options, ...itms) : originalShowWarningMessage(msg, ...itms)
      );
    }
    return options ? originalShowWarningMessage(message, options, ...items) : originalShowWarningMessage(message, ...items);
  }
  return interceptedShowWarningMessage;
}
function createInterceptedShowErrorMessage() {
  function interceptedShowErrorMessage(message, ...args) {
    let options;
    let items;
    if (args.length > 0 && typeof args[0] === "object" && "modal" in args[0]) {
      options = args[0];
      items = args.slice(1);
    } else {
      items = args;
    }
    const stringOptions = extractOptions(items);
    const detection = detectApproval(message, stringOptions);
    stateManager?.log("debug", "showErrorMessage called", {
      message: message.substring(0, 100),
      options: stringOptions,
      isApproval: detection.isApproval,
      reason: detection.reason
    });
    if (detection.isApproval && stateManager) {
      return handleApprovalPrompt(
        "error",
        message,
        items,
        (msg, ...itms) => options ? originalShowErrorMessage(msg, options, ...itms) : originalShowErrorMessage(msg, ...itms)
      );
    }
    return options ? originalShowErrorMessage(message, options, ...items) : originalShowErrorMessage(message, ...items);
  }
  return interceptedShowErrorMessage;
}
function installInterceptors(manager) {
  stateManager = manager;
  originalShowInformationMessage = vscode.window.showInformationMessage;
  originalShowWarningMessage = vscode.window.showWarningMessage;
  originalShowErrorMessage = vscode.window.showErrorMessage;
  vscode.window.showInformationMessage = createInterceptedShowInformationMessage();
  vscode.window.showWarningMessage = createInterceptedShowWarningMessage();
  vscode.window.showErrorMessage = createInterceptedShowErrorMessage();
  manager.log("info", "Message interceptors installed");
}
function uninstallInterceptors() {
  if (originalShowInformationMessage) {
    vscode.window.showInformationMessage = originalShowInformationMessage;
  }
  if (originalShowWarningMessage) {
    vscode.window.showWarningMessage = originalShowWarningMessage;
  }
  if (originalShowErrorMessage) {
    vscode.window.showErrorMessage = originalShowErrorMessage;
  }
  stateManager?.log("info", "Message interceptors uninstalled");
  stateManager = null;
}

// src/commandHandler.ts
var CommandHandler = class {
  config;
  stateManager;
  commandFilePath;
  offset = 0;
  pollInterval = null;
  watcher = null;
  isProcessing = false;
  constructor(config, stateManager3) {
    this.config = config;
    this.stateManager = stateManager3;
    this.commandFilePath = path2.join(
      config.sharedDir,
      "commands",
      `${config.projectId}.ndjson`
    );
  }
  /**
   * Start listening for commands
   */
  start() {
    this.initializeOffset();
    try {
      this.watcher = fs2.watch(this.commandFilePath, { persistent: false }, () => {
        this.processNewCommands();
      });
      this.stateManager.log("info", "Command watcher started (fs.watch)");
    } catch {
      this.stateManager.log(
        "info",
        "fs.watch not available, using polling for commands"
      );
    }
    this.pollInterval = setInterval(() => {
      this.processNewCommands();
    }, this.config.commandPollIntervalMs);
    this.stateManager.log("info", "Command handler started", {
      pollIntervalMs: this.config.commandPollIntervalMs
    });
  }
  /**
   * Initialize file offset to current end of file
   */
  initializeOffset() {
    try {
      if (fs2.existsSync(this.commandFilePath)) {
        const stats = fs2.statSync(this.commandFilePath);
        this.offset = stats.size;
        this.stateManager.log("debug", "Command file offset initialized", {
          offset: this.offset
        });
      }
    } catch {
      this.offset = 0;
    }
  }
  /**
   * Process new commands from file
   */
  async processNewCommands() {
    if (this.isProcessing)
      return;
    this.isProcessing = true;
    try {
      if (!fs2.existsSync(this.commandFilePath)) {
        return;
      }
      const stats = fs2.statSync(this.commandFilePath);
      if (stats.size < this.offset) {
        this.stateManager.log("warn", "Command file truncated, resetting offset");
        this.offset = 0;
      }
      if (stats.size <= this.offset) {
        return;
      }
      const fd = fs2.openSync(this.commandFilePath, "r");
      const buffer = Buffer.alloc(stats.size - this.offset);
      fs2.readSync(fd, buffer, 0, buffer.length, this.offset);
      fs2.closeSync(fd);
      const newContent = buffer.toString("utf8");
      const lines = newContent.split("\n").filter((line) => line.trim());
      for (const line of lines) {
        try {
          const command = JSON.parse(line);
          await this.executeCommand(command);
        } catch (parseError) {
          this.stateManager.log("warn", "Failed to parse command line", {
            line: line.substring(0, 100),
            error: String(parseError)
          });
        }
      }
      this.offset = stats.size;
    } catch (error) {
      this.stateManager.log("error", "Error processing commands", {
        error: String(error)
      });
    } finally {
      this.isProcessing = false;
    }
  }
  /**
   * Execute a command from Stream Deck
   */
  async executeCommand(command) {
    this.stateManager.log("info", "Executing command", {
      type: command.type,
      ts: command.ts
    });
    switch (command.type) {
      case "focus_approvals":
        await this.focusApprovals();
        break;
      case "open_notifications_center":
        await this.openNotificationsCenter();
        break;
      case "respond_approval":
        await this.respondToApproval(command);
        break;
      default:
        this.stateManager.log("warn", "Unknown command type", {
          type: command.type
        });
    }
  }
  /**
   * Focus on approval notifications/toasts
   */
  async focusApprovals() {
    try {
      await vscode2.commands.executeCommand("notifications.focusToasts");
      this.stateManager.log("debug", "Executed notifications.focusToasts");
      return;
    } catch {
    }
    await this.openNotificationsCenter();
  }
  /**
   * Open the notifications center panel
   */
  async openNotificationsCenter() {
    try {
      await vscode2.commands.executeCommand(
        "workbench.action.openNotifications"
      );
      this.stateManager.log("debug", "Executed workbench.action.openNotifications");
    } catch (error) {
      this.stateManager.log("error", "Failed to open notifications", {
        error: String(error)
      });
    }
    try {
      await vscode2.commands.executeCommand("notifications.focusToasts");
    } catch {
    }
  }
  /**
   * Respond to a pending approval (v1.2.0)
   * Called when respond_approval command is received from Dashboard
   */
  async respondToApproval(command) {
    const { requestId, response } = command;
    this.stateManager.log("info", "Processing respond_approval", {
      requestId,
      response
    });
    const success = resolveApproval(requestId, response);
    if (success) {
      this.stateManager.log("info", "Approval resolved via Dashboard", {
        requestId,
        response
      });
    } else {
      this.stateManager.log("warn", "Approval not found (may have been resolved locally)", {
        requestId,
        response
      });
    }
  }
  /**
   * Stop listening for commands
   */
  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.stateManager.log("info", "Command handler stopped");
  }
};

// src/extension.ts
var stateManager2 = null;
var commandHandler = null;
var outputChannel = null;
var textEditThrottleTimeout = null;
function getConfig() {
  const config = vscode3.workspace.getConfiguration("approvalDeck");
  const workspaceFolders = vscode3.workspace.workspaceFolders;
  let defaultProjectId = "default";
  if (workspaceFolders && workspaceFolders.length > 0) {
    defaultProjectId = path3.basename(workspaceFolders[0].uri.fsPath);
    defaultProjectId = defaultProjectId.replace(/[^a-zA-Z0-9_-]/g, "_");
  }
  const projectId = config.get("projectId") || defaultProjectId;
  return {
    sharedDir: config.get("sharedDir") || "/shared/approval-deck",
    projectId,
    projectLabel: config.get("projectLabel") || projectId,
    idleThresholdSec: config.get("idleThresholdSec") || 120,
    enableDebugLog: config.get("enableDebugLog") || false,
    commandPollIntervalMs: config.get("commandPollIntervalMs") || 250
  };
}
function registerCommands(context) {
  const showStatus = vscode3.commands.registerCommand(
    "approvalDeck.showStatus",
    () => {
      if (stateManager2) {
        const pendingCount = stateManager2.getPendingCount();
        vscode3.window.showInformationMessage(
          `Approval Deck: ${pendingCount} pending approval(s)`
        );
      } else {
        vscode3.window.showWarningMessage("Approval Deck is not active");
      }
    }
  );
  const focusApprovals = vscode3.commands.registerCommand(
    "approvalDeck.focusApprovals",
    async () => {
      try {
        await vscode3.commands.executeCommand("notifications.focusToasts");
      } catch {
        await vscode3.commands.executeCommand(
          "workbench.action.openNotifications"
        );
      }
    }
  );
  const simulateApproval = vscode3.commands.registerCommand(
    "approvalDeck.simulateApproval",
    async () => {
      const result = await vscode3.window.showInformationMessage(
        "Allow Claude to execute this command?",
        "Yes",
        "No",
        "Yes, and don't ask again"
      );
      vscode3.window.showInformationMessage(`You selected: ${result || "nothing"}`);
    }
  );
  context.subscriptions.push(showStatus, focusApprovals, simulateApproval);
}
async function initialize(context) {
  const config = getConfig();
  outputChannel.appendLine("=".repeat(50));
  outputChannel.appendLine(`Approval Deck initializing...`);
  outputChannel.appendLine(`Project ID: ${config.projectId}`);
  outputChannel.appendLine(`Project Label: ${config.projectLabel}`);
  outputChannel.appendLine(`Shared Dir: ${config.sharedDir}`);
  outputChannel.appendLine(`Idle Threshold: ${config.idleThresholdSec}s`);
  outputChannel.appendLine(`Debug Logging: ${config.enableDebugLog}`);
  outputChannel.appendLine("=".repeat(50));
  stateManager2 = new StateManager(config, outputChannel);
  installInterceptors(stateManager2);
  commandHandler = new CommandHandler(config, stateManager2);
  commandHandler.start();
  await stateManager2.writeState();
  outputChannel.appendLine("Approval Deck activated successfully");
}
function handleConfigChange(context) {
  if (commandHandler) {
    commandHandler.stop();
    commandHandler = null;
  }
  if (stateManager2) {
    stateManager2.dispose();
    stateManager2 = null;
  }
  uninstallInterceptors();
  initialize(context);
}
function activate(context) {
  outputChannel = vscode3.window.createOutputChannel("Approval Deck");
  context.subscriptions.push(outputChannel);
  registerCommands(context);
  context.subscriptions.push(
    vscode3.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("approvalDeck")) {
        outputChannel.appendLine("Configuration changed, reinitializing...");
        handleConfigChange(context);
      }
    })
  );
  context.subscriptions.push(
    vscode3.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.scheme !== "file") {
        return;
      }
      if (e.contentChanges.length === 0) {
        return;
      }
      if (textEditThrottleTimeout) {
        clearTimeout(textEditThrottleTimeout);
      }
      textEditThrottleTimeout = setTimeout(() => {
        if (stateManager2) {
          stateManager2.updateTextEdit();
        }
        textEditThrottleTimeout = null;
      }, 2e3);
    })
  );
  initialize(context);
}
function deactivate() {
  outputChannel?.appendLine("Approval Deck deactivating...");
  uninstallInterceptors();
  if (commandHandler) {
    commandHandler.stop();
    commandHandler = null;
  }
  if (stateManager2) {
    stateManager2.dispose();
    stateManager2 = null;
  }
  outputChannel?.appendLine("Approval Deck deactivated");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
