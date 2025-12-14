import * as fs from "fs";
import * as path from "path";
/**
 * Watches a single project state file
 */
export class ProjectStateWatcher {
    statePath;
    callback;
    watcher = null;
    pollInterval = null;
    lastState = null;
    lastMtime = 0;
    constructor(sharedDir, projectId, callback) {
        this.statePath = path.join(sharedDir, "state", `${projectId}.json`);
        this.callback = callback;
    }
    /**
     * Start watching the state file
     */
    start() {
        // Initial read
        this.readAndNotify();
        // Try fs.watch first
        try {
            const dir = path.dirname(this.statePath);
            const filename = path.basename(this.statePath);
            if (fs.existsSync(dir)) {
                this.watcher = fs.watch(dir, (eventType, changedFile) => {
                    if (changedFile === filename) {
                        this.readAndNotify();
                    }
                });
            }
        }
        catch {
            // fs.watch not available or failed
        }
        // Always use polling as backup (500ms)
        this.pollInterval = setInterval(() => {
            this.readAndNotify();
        }, 500);
    }
    /**
     * Read state file and notify callback if changed
     */
    readAndNotify() {
        try {
            if (!fs.existsSync(this.statePath)) {
                if (this.lastState !== null) {
                    this.lastState = null;
                    this.callback(null);
                }
                return;
            }
            // Check mtime to avoid unnecessary reads
            const stats = fs.statSync(this.statePath);
            if (stats.mtimeMs === this.lastMtime) {
                return;
            }
            this.lastMtime = stats.mtimeMs;
            const content = fs.readFileSync(this.statePath, "utf8");
            const state = JSON.parse(content);
            // Only notify if state actually changed
            if (JSON.stringify(state) !== JSON.stringify(this.lastState)) {
                this.lastState = state;
                this.callback(state);
            }
        }
        catch {
            // Parse error or file not ready - ignore and retry
        }
    }
    /**
     * Get current state
     */
    getState() {
        return this.lastState;
    }
    /**
     * Stop watching
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
    }
}
/**
 * Watches all project state files in a directory
 */
export class SummaryStateWatcher {
    stateDir;
    callback;
    watchers = new Map();
    projects = new Map();
    pollInterval = null;
    constructor(sharedDir, callback) {
        this.stateDir = path.join(sharedDir, "state");
        this.callback = callback;
    }
    /**
     * Start watching all state files
     */
    start() {
        // Initial scan
        this.scanAndUpdate();
        // Poll for new/removed files
        this.pollInterval = setInterval(() => {
            this.scanAndUpdate();
        }, 1000);
    }
    /**
     * Scan state directory and update watchers
     */
    scanAndUpdate() {
        try {
            if (!fs.existsSync(this.stateDir)) {
                return;
            }
            const files = fs.readdirSync(this.stateDir);
            const jsonFiles = files.filter((f) => f.endsWith(".json") && !f.endsWith(".tmp"));
            const currentProjectIds = new Set(jsonFiles.map((f) => f.replace(".json", "")));
            // Add watchers for new projects
            for (const projectId of currentProjectIds) {
                if (!this.watchers.has(projectId)) {
                    const sharedDir = path.dirname(this.stateDir);
                    const watcher = new ProjectStateWatcher(sharedDir, projectId, (state) => {
                        if (state) {
                            this.projects.set(projectId, state);
                        }
                        else {
                            this.projects.delete(projectId);
                        }
                        this.notifySummary();
                    });
                    watcher.start();
                    this.watchers.set(projectId, watcher);
                }
            }
            // Remove watchers for removed projects
            for (const [projectId, watcher] of this.watchers) {
                if (!currentProjectIds.has(projectId)) {
                    watcher.stop();
                    this.watchers.delete(projectId);
                    this.projects.delete(projectId);
                    this.notifySummary();
                }
            }
        }
        catch {
            // Ignore scan errors
        }
    }
    /**
     * Calculate and notify summary state
     */
    notifySummary() {
        let totalPending = 0;
        let runningCount = 0;
        let idleCount = 0;
        let errorCount = 0;
        let oldestPendingProjectId = null;
        let oldestPendingSince = null;
        for (const [projectId, state] of this.projects) {
            totalPending += state.pendingCount;
            switch (state.mode) {
                case "running":
                    runningCount++;
                    break;
                case "idle":
                    idleCount++;
                    break;
                case "error":
                    errorCount++;
                    break;
                case "waiting_approval":
                    // Also counts as running
                    runningCount++;
                    break;
            }
            if (state.oldestPendingSince !== null &&
                (oldestPendingSince === null || state.oldestPendingSince < oldestPendingSince)) {
                oldestPendingSince = state.oldestPendingSince;
                oldestPendingProjectId = projectId;
            }
        }
        this.callback({
            totalPending,
            runningCount,
            idleCount,
            errorCount,
            oldestPendingProjectId,
            oldestPendingSince,
            projects: new Map(this.projects),
        });
    }
    /**
     * Get oldest pending project ID
     */
    getOldestPendingProjectId() {
        let oldest = null;
        let oldestTime = null;
        for (const [projectId, state] of this.projects) {
            if (state.oldestPendingSince !== null &&
                (oldestTime === null || state.oldestPendingSince < oldestTime)) {
                oldestTime = state.oldestPendingSince;
                oldest = projectId;
            }
        }
        return oldest;
    }
    /**
     * Stop watching
     */
    stop() {
        for (const watcher of this.watchers.values()) {
            watcher.stop();
        }
        this.watchers.clear();
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }
}
//# sourceMappingURL=stateWatcher.js.map