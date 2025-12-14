import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
  ProjectState,
  PendingApproval,
  ExtensionConfig,
  LogEntry,
  STATE_SCHEMA_VERSION,
  ProjectMode,
} from "./types";

/**
 * Manages project state persistence with atomic writes
 */
export class StateManager {
  private config: ExtensionConfig;
  private pendingApprovals: Map<string, PendingApproval> = new Map();
  private lastActivityAt: number = Date.now();
  private lastPromptAt: number | null = null;
  private lastResolvedAt: number | null = null;
  private lastTextEditAt: number | null = null;
  private sessionStartedAt: number = Date.now();
  private outputChannel: vscode.OutputChannel;
  private idleCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: ExtensionConfig, outputChannel: vscode.OutputChannel) {
    this.config = config;
    this.outputChannel = outputChannel;
    this.ensureDirectories();
    this.startIdleCheck();
  }

  /**
   * Ensure shared directories exist
   */
  private ensureDirectories(): void {
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
      } catch (error) {
        this.log("error", `Failed to create directory: ${dir}`, { error });
      }
    }
  }

  /**
   * Start periodic idle check
   */
  private startIdleCheck(): void {
    // Check every 10 seconds if we should switch to idle
    this.idleCheckInterval = setInterval(() => {
      this.checkAndUpdateIdleState();
    }, 10000);
  }

  /**
   * Check if we should switch to idle mode
   */
  private async checkAndUpdateIdleState(): Promise<void> {
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
  private getStatePath(): string {
    return path.join(
      this.config.sharedDir,
      "state",
      `${this.config.projectId}.json`
    );
  }

  /**
   * Get temp state file path for atomic writes
   */
  private getTempStatePath(): string {
    return path.join(
      this.config.sharedDir,
      "state",
      `${this.config.projectId}.json.tmp`
    );
  }

  /**
   * Get log file path
   */
  private getLogPath(): string {
    return path.join(
      this.config.sharedDir,
      "logs",
      `${this.config.projectId}.ndjson`
    );
  }

  /**
   * Calculate current project mode
   */
  private calculateMode(): ProjectMode {
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
  private buildState(): ProjectState {
    const approvals = Array.from(this.pendingApprovals.values());
    const oldestPendingSince =
      approvals.length > 0
        ? Math.min(...approvals.map((a) => a.since))
        : null;

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
      sessionStartedAt: this.sessionStartedAt,
    };
  }

  /**
   * Write state atomically (write to temp, then rename)
   */
  async writeState(): Promise<void> {
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
    } catch (error) {
      this.log("error", "Failed to write state", { error });

      // Clean up temp file if it exists
      try {
        await fs.promises.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Add a pending approval
   */
  async addPendingApproval(approval: PendingApproval): Promise<void> {
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
  async removePendingApproval(
    requestId: string,
    response: string | undefined
  ): Promise<void> {
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
  getPendingCount(): number {
    return this.pendingApprovals.size;
  }

  /**
   * Update activity timestamp
   */
  async updateActivity(): Promise<void> {
    this.lastActivityAt = Date.now();
    await this.writeState();
  }

  /**
   * Update last text edit timestamp (v1.1.0)
   */
  async updateTextEdit(): Promise<void> {
    this.lastTextEditAt = Date.now();
    this.lastActivityAt = Date.now();
    await this.writeState();
  }

  /**
   * Log message to output channel and optionally to file
   */
  log(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    data?: Record<string, unknown>
  ): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    // Always log to output channel (except debug unless enabled)
    if (level !== "debug" || this.config.enableDebugLog) {
      this.outputChannel.appendLine(
        data ? `${logMessage} ${JSON.stringify(data)}` : logMessage
      );
    }

    // Log to file if debug logging is enabled
    if (this.config.enableDebugLog) {
      const entry: LogEntry = {
        ts: Date.now(),
        level,
        message,
        data,
      };

      try {
        fs.appendFileSync(
          this.getLogPath(),
          JSON.stringify(entry) + "\n",
          "utf8"
        );
      } catch {
        // Silently ignore file logging errors
      }
    }
  }

  /**
   * Clean up on disposal
   */
  dispose(): void {
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
