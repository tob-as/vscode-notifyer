import * as fs from "fs";
import * as path from "path";
import { EventEmitter } from "events";
/** Schema version for state file format */
const STATE_SCHEMA_VERSION = 1;
/**
 * Watches state directory for changes and caches project states
 */
export class StateWatcher extends EventEmitter {
    stateDir;
    watcher = null;
    states = new Map();
    previousApprovals = new Map();
    debounceTimers = new Map();
    constructor(sharedDir) {
        super();
        this.stateDir = path.join(sharedDir, "state");
    }
    /**
     * Start watching the state directory
     */
    start() {
        // Ensure directory exists
        if (!fs.existsSync(this.stateDir)) {
            try {
                fs.mkdirSync(this.stateDir, { recursive: true });
            }
            catch (error) {
                this.emit("error", new Error(`Failed to create state directory: ${this.stateDir}`));
                return;
            }
        }
        // Initial load
        this.loadAllStates();
        // Start watching
        try {
            this.watcher = fs.watch(this.stateDir, (eventType, filename) => {
                if (filename && filename.endsWith(".json") && !filename.endsWith(".tmp")) {
                    this.handleFileChange(filename);
                }
            });
            this.watcher.on("error", (error) => {
                this.emit("error", error);
            });
        }
        catch (error) {
            this.emit("error", error);
        }
    }
    /**
     * Stop watching
     */
    stop() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }
        // Clear debounce timers
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
    }
    /**
     * Get all current project states
     */
    getAllStates() {
        return Array.from(this.states.values());
    }
    /**
     * Get summary of all projects
     */
    getSummary() {
        let totalPending = 0;
        let runningCount = 0;
        let idleCount = 0;
        let waitingCount = 0;
        for (const state of this.states.values()) {
            totalPending += state.pendingCount;
            switch (state.mode) {
                case "running":
                    runningCount++;
                    break;
                case "idle":
                    idleCount++;
                    break;
                case "waiting_approval":
                    waitingCount++;
                    break;
            }
        }
        return { totalPending, runningCount, idleCount, waitingCount };
    }
    /**
     * Load all state files from directory
     */
    loadAllStates() {
        try {
            const files = fs.readdirSync(this.stateDir);
            for (const file of files) {
                if (file.endsWith(".json") && !file.endsWith(".tmp")) {
                    this.loadStateFile(file);
                }
            }
        }
        catch (error) {
            this.emit("error", new Error(`Failed to read state directory: ${error}`));
        }
    }
    /**
     * Handle file change event (debounced)
     */
    handleFileChange(filename) {
        // Debounce to avoid rapid updates
        const existing = this.debounceTimers.get(filename);
        if (existing) {
            clearTimeout(existing);
        }
        this.debounceTimers.set(filename, setTimeout(() => {
            this.debounceTimers.delete(filename);
            this.loadStateFile(filename);
        }, 100));
    }
    /**
     * Load a single state file
     */
    loadStateFile(filename) {
        const filePath = path.join(this.stateDir, filename);
        const projectId = filename.replace(".json", "");
        try {
            // Check if file still exists (might have been deleted)
            if (!fs.existsSync(filePath)) {
                if (this.states.has(projectId)) {
                    this.states.delete(projectId);
                    this.previousApprovals.delete(projectId);
                    this.emit("project-removed", projectId);
                }
                return;
            }
            const content = fs.readFileSync(filePath, "utf8");
            const state = JSON.parse(content);
            // Track previous approvals for detecting new ones
            const prevApprovals = this.previousApprovals.get(projectId) || new Set();
            const currentApprovals = new Set(state.pendingApprovals.map((a) => a.requestId));
            // Check for new approvals
            for (const requestId of currentApprovals) {
                if (!prevApprovals.has(requestId)) {
                    this.emit("new-approval", projectId, requestId);
                }
            }
            // Update cache
            this.states.set(projectId, state);
            this.previousApprovals.set(projectId, currentApprovals);
            // Emit state change
            this.emit("state-change", projectId, state);
        }
        catch (error) {
            // Ignore parse errors (file might be in the middle of being written)
            if (!(error instanceof SyntaxError)) {
                this.emit("error", new Error(`Failed to load state file ${filename}: ${error}`));
            }
        }
    }
}
//# sourceMappingURL=stateWatcher.js.map