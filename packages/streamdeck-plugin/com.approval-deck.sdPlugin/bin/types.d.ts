/**
 * Shared types for Stream Deck plugin
 * (Mirrors VS Code extension types for state/command protocol)
 */
/** Schema version for state file format */
export declare const STATE_SCHEMA_VERSION = 1;
/** Project operational mode */
export type ProjectMode = "running" | "waiting_approval" | "idle" | "error";
/** Severity level for approval prompts */
export type ApprovalSeverity = "info" | "warning" | "error";
/** A pending approval request */
export interface PendingApproval {
    requestId: string;
    since: number;
    message: string;
    options: string[];
    severity: ApprovalSeverity;
}
/** Project state read from state/<projectId>.json */
export interface ProjectState {
    schemaVersion: typeof STATE_SCHEMA_VERSION;
    projectId: string;
    projectLabel: string;
    updatedAt: number;
    mode: ProjectMode;
    pendingApprovals: PendingApproval[];
    pendingCount: number;
    oldestPendingSince: number | null;
    lastPromptAt: number | null;
    lastResolvedAt: number | null;
    lastActivityAt: number;
}
/** Command types sent to VS Code */
export type CommandType = "focus_approvals" | "open_notifications_center";
/** Command sent to VS Code via commands/<projectId>.ndjson */
export interface Command {
    ts: number;
    type: CommandType;
    projectId: string;
}
/** Settings for Approval Monitor action */
export interface MonitorSettings {
    /** Host path to shared mount directory */
    sharedDirHost: string;
    /** Project ID to monitor */
    projectId: string;
    /** Override display label (optional) */
    projectLabelOverride?: string;
    /** Blink interval in ms */
    blinkIntervalMs: number;
    /** Enable sound alerts */
    enableSound: boolean;
    /** Sound cooldown in ms */
    soundCooldownMs: number;
}
/** Settings for Approval Summary action */
export interface SummarySettings {
    /** Host path to shared mount directory */
    sharedDirHost: string;
    /** Blink interval in ms */
    blinkIntervalMs: number;
    /** Enable sound alerts */
    enableSound: boolean;
    /** Sound cooldown in ms */
    soundCooldownMs: number;
}
/** Default settings for Monitor action */
export declare const DEFAULT_MONITOR_SETTINGS: MonitorSettings;
/** Default settings for Summary action */
export declare const DEFAULT_SUMMARY_SETTINGS: SummarySettings;
/** Summary state across all projects */
export interface SummaryState {
    totalPending: number;
    runningCount: number;
    idleCount: number;
    errorCount: number;
    oldestPendingProjectId: string | null;
    oldestPendingSince: number | null;
    projects: Map<string, ProjectState>;
}
//# sourceMappingURL=types.d.ts.map