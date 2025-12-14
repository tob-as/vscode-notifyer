import * as vscode from "vscode";
import { PendingApproval, ExtensionConfig } from "./types";
/**
 * Manages project state persistence with atomic writes
 */
export declare class StateManager {
    private config;
    private pendingApprovals;
    private lastActivityAt;
    private lastPromptAt;
    private lastResolvedAt;
    private outputChannel;
    private idleCheckInterval;
    constructor(config: ExtensionConfig, outputChannel: vscode.OutputChannel);
    /**
     * Ensure shared directories exist
     */
    private ensureDirectories;
    /**
     * Start periodic idle check
     */
    private startIdleCheck;
    /**
     * Check if we should switch to idle mode
     */
    private checkAndUpdateIdleState;
    /**
     * Get state file path
     */
    private getStatePath;
    /**
     * Get temp state file path for atomic writes
     */
    private getTempStatePath;
    /**
     * Get log file path
     */
    private getLogPath;
    /**
     * Calculate current project mode
     */
    private calculateMode;
    /**
     * Build current state object
     */
    private buildState;
    /**
     * Write state atomically (write to temp, then rename)
     */
    writeState(): Promise<void>;
    /**
     * Add a pending approval
     */
    addPendingApproval(approval: PendingApproval): Promise<void>;
    /**
     * Remove a pending approval (resolved)
     */
    removePendingApproval(requestId: string, response: string | undefined): Promise<void>;
    /**
     * Get current pending count
     */
    getPendingCount(): number;
    /**
     * Update activity timestamp
     */
    updateActivity(): Promise<void>;
    /**
     * Log message to output channel and optionally to file
     */
    log(level: "debug" | "info" | "warn" | "error", message: string, data?: Record<string, unknown>): void;
    /**
     * Clean up on disposal
     */
    dispose(): void;
}
//# sourceMappingURL=stateManager.d.ts.map