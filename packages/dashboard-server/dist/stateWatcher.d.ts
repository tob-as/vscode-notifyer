import { EventEmitter } from "events";
/** Schema version for state file format */
declare const STATE_SCHEMA_VERSION = 1;
/** Project operational mode */
type ProjectMode = "running" | "waiting_approval" | "idle" | "error";
/** Severity level for approval prompts */
type ApprovalSeverity = "info" | "warning" | "error";
/** A pending approval request */
interface PendingApproval {
    requestId: string;
    since: number;
    message: string;
    options: string[];
    severity: ApprovalSeverity;
}
/** Project state from state/<projectId>.json */
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
    lastTextEditAt: number | null;
    sessionStartedAt: number;
}
/** Summary of all projects */
export interface ProjectsSummary {
    totalPending: number;
    runningCount: number;
    idleCount: number;
    waitingCount: number;
}
/** Events emitted by StateWatcher */
export interface StateWatcherEvents {
    "state-change": (projectId: string, state: ProjectState) => void;
    "project-removed": (projectId: string) => void;
    "new-approval": (projectId: string, requestId: string) => void;
    error: (error: Error) => void;
}
/**
 * Watches state directory for changes and caches project states
 */
export declare class StateWatcher extends EventEmitter {
    private stateDir;
    private watcher;
    private states;
    private previousApprovals;
    private debounceTimers;
    constructor(sharedDir: string);
    /**
     * Start watching the state directory
     */
    start(): void;
    /**
     * Stop watching
     */
    stop(): void;
    /**
     * Get all current project states
     */
    getAllStates(): ProjectState[];
    /**
     * Get summary of all projects
     */
    getSummary(): ProjectsSummary;
    /**
     * Load all state files from directory
     */
    private loadAllStates;
    /**
     * Handle file change event (debounced)
     */
    private handleFileChange;
    /**
     * Load a single state file
     */
    private loadStateFile;
}
export {};
//# sourceMappingURL=stateWatcher.d.ts.map