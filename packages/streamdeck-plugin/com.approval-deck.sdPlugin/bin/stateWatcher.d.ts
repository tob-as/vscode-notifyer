import { ProjectState, SummaryState } from "./types";
type StateCallback = (state: ProjectState | null) => void;
type SummaryCallback = (summary: SummaryState) => void;
/**
 * Watches a single project state file
 */
export declare class ProjectStateWatcher {
    private statePath;
    private callback;
    private watcher;
    private pollInterval;
    private lastState;
    private lastMtime;
    constructor(sharedDir: string, projectId: string, callback: StateCallback);
    /**
     * Start watching the state file
     */
    start(): void;
    /**
     * Read state file and notify callback if changed
     */
    private readAndNotify;
    /**
     * Get current state
     */
    getState(): ProjectState | null;
    /**
     * Stop watching
     */
    stop(): void;
}
/**
 * Watches all project state files in a directory
 */
export declare class SummaryStateWatcher {
    private stateDir;
    private callback;
    private watchers;
    private projects;
    private pollInterval;
    constructor(sharedDir: string, callback: SummaryCallback);
    /**
     * Start watching all state files
     */
    start(): void;
    /**
     * Scan state directory and update watchers
     */
    private scanAndUpdate;
    /**
     * Calculate and notify summary state
     */
    private notifySummary;
    /**
     * Get oldest pending project ID
     */
    getOldestPendingProjectId(): string | null;
    /**
     * Stop watching
     */
    stop(): void;
}
export {};
//# sourceMappingURL=stateWatcher.d.ts.map