"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const types_1 = require("./types");
/**
 * Manages project state persistence with atomic writes
 */
class StateManager {
    config;
    pendingApprovals = new Map();
    lastActivityAt = Date.now();
    lastPromptAt = null;
    lastResolvedAt = null;
    outputChannel;
    idleCheckInterval = null;
    constructor(config, outputChannel) {
        this.config = config;
        this.outputChannel = outputChannel;
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
            path.join(this.config.sharedDir, "logs"),
        ];
        for (const dir of dirs) {
            try {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                    this.log("info", `Created directory: ${dir}`);
                }
            }
            catch (error) {
                this.log("error", `Failed to create directory: ${dir}`, { error });
            }
        }
    }
    /**
     * Start periodic idle check
     */
    startIdleCheck() {
        // Check every 10 seconds if we should switch to idle
        this.idleCheckInterval = setInterval(() => {
            this.checkAndUpdateIdleState();
        }, 10000);
    }
    /**
     * Check if we should switch to idle mode
     */
    async checkAndUpdateIdleState() {
        if (this.pendingApprovals.size > 0) {
            return; // Don't go idle if there are pending approvals
        }
        const now = Date.now();
        const idleThresholdMs = this.config.idleThresholdSec * 1000;
        if (now - this.lastActivityAt > idleThresholdMs) {
            await this.writeState();
        }
    }
    /**
     * Get state file path
     */
    getStatePath() {
        return path.join(this.config.sharedDir, "state", `${this.config.projectId}.json`);
    }
    /**
     * Get temp state file path for atomic writes
     */
    getTempStatePath() {
        return path.join(this.config.sharedDir, "state", `${this.config.projectId}.json.tmp`);
    }
    /**
     * Get log file path
     */
    getLogPath() {
        return path.join(this.config.sharedDir, "logs", `${this.config.projectId}.ndjson`);
    }
    /**
     * Calculate current project mode
     */
    calculateMode() {
        if (this.pendingApprovals.size > 0) {
            return "waiting_approval";
        }
        const now = Date.now();
        const idleThresholdMs = this.config.idleThresholdSec * 1000;
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
        const oldestPendingSince = approvals.length > 0
            ? Math.min(...approvals.map((a) => a.since))
            : null;
        return {
            schemaVersion: types_1.STATE_SCHEMA_VERSION,
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
            // Write to temp file
            await fs.promises.writeFile(tempPath, content, "utf8");
            // Atomic rename
            await fs.promises.rename(tempPath, statePath);
            this.log("debug", "State written", {
                mode: state.mode,
                pendingCount: state.pendingCount,
            });
        }
        catch (error) {
            this.log("error", "Failed to write state", { error });
            // Clean up temp file if it exists
            try {
                await fs.promises.unlink(tempPath);
            }
            catch {
                // Ignore cleanup errors
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
            message: approval.message.substring(0, 100),
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
                durationMs: Date.now() - approval.since,
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
     * Log message to output channel and optionally to file
     */
    log(level, message, data) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        // Always log to output channel (except debug unless enabled)
        if (level !== "debug" || this.config.enableDebugLog) {
            this.outputChannel.appendLine(data ? `${logMessage} ${JSON.stringify(data)}` : logMessage);
        }
        // Log to file if debug logging is enabled
        if (this.config.enableDebugLog) {
            const entry = {
                ts: Date.now(),
                level,
                message,
                data,
            };
            try {
                fs.appendFileSync(this.getLogPath(), JSON.stringify(entry) + "\n", "utf8");
            }
            catch {
                // Silently ignore file logging errors
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
        // Write final state
        this.writeState().catch(() => {
            // Ignore errors during disposal
        });
    }
}
exports.StateManager = StateManager;
//# sourceMappingURL=stateManager.js.map