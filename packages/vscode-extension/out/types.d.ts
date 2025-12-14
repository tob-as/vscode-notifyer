/**
 * Shared types for Approval Deck VS Code Extension and Stream Deck Plugin
 */
/** Schema version for state file format */
export declare const STATE_SCHEMA_VERSION = 1;
/** Project operational mode */
export type ProjectMode = "running" | "waiting_approval" | "idle" | "error";
/** Severity level for approval prompts */
export type ApprovalSeverity = "info" | "warning" | "error";
/** A pending approval request */
export interface PendingApproval {
    /** Unique identifier for this approval request */
    requestId: string;
    /** Unix timestamp (ms) when the approval was requested */
    since: number;
    /** The message shown to the user */
    message: string;
    /** Available response options */
    options: string[];
    /** Severity level of the approval */
    severity: ApprovalSeverity;
}
/** Project state written to state/<projectId>.json */
export interface ProjectState {
    /** Schema version for forward compatibility */
    schemaVersion: typeof STATE_SCHEMA_VERSION;
    /** Unique project identifier */
    projectId: string;
    /** Display label for the project */
    projectLabel: string;
    /** Unix timestamp (ms) when state was last updated */
    updatedAt: number;
    /** Current operational mode */
    mode: ProjectMode;
    /** List of pending approval requests */
    pendingApprovals: PendingApproval[];
    /** Count of pending approvals (convenience field) */
    pendingCount: number;
    /** Unix timestamp (ms) of oldest pending approval, or null */
    oldestPendingSince: number | null;
    /** Unix timestamp (ms) of last approval prompt, or null */
    lastPromptAt: number | null;
    /** Unix timestamp (ms) of last resolved approval, or null */
    lastResolvedAt: number | null;
    /** Unix timestamp (ms) of last activity (prompt or resolution) */
    lastActivityAt: number;
}
/** Command types that can be sent from Stream Deck to VS Code */
export type CommandType = "focus_approvals" | "open_notifications_center";
/** Command sent from Stream Deck to VS Code via commands/<projectId>.ndjson */
export interface Command {
    /** Unix timestamp (ms) when command was issued */
    ts: number;
    /** Command type */
    type: CommandType;
    /** Project this command is for */
    projectId: string;
}
/** Debug log entry written to logs/<projectId>.ndjson */
export interface LogEntry {
    /** Unix timestamp (ms) */
    ts: number;
    /** Log level */
    level: "debug" | "info" | "warn" | "error";
    /** Log message */
    message: string;
    /** Optional additional data */
    data?: Record<string, unknown>;
}
/** Extension configuration from VS Code settings */
export interface ExtensionConfig {
    /** Path to shared directory */
    sharedDir: string;
    /** Unique project identifier */
    projectId: string;
    /** Display label for the project */
    projectLabel: string;
    /** Seconds of inactivity before idle mode */
    idleThresholdSec: number;
    /** Enable debug logging */
    enableDebugLog: boolean;
    /** Command poll interval in ms */
    commandPollIntervalMs: number;
}
/** Result of approval detection */
export interface ApprovalDetectionResult {
    /** Whether this is an approval prompt */
    isApproval: boolean;
    /** Detected severity level */
    severity: ApprovalSeverity;
    /** Reason for detection (for logging) */
    reason: string;
}
//# sourceMappingURL=types.d.ts.map