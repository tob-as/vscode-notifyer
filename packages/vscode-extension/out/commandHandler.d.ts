import { ExtensionConfig } from "./types";
import { StateManager } from "./stateManager";
/**
 * Handles commands from Stream Deck plugin
 */
export declare class CommandHandler {
    private config;
    private stateManager;
    private commandFilePath;
    private offset;
    private pollInterval;
    private watcher;
    private isProcessing;
    constructor(config: ExtensionConfig, stateManager: StateManager);
    /**
     * Start listening for commands
     */
    start(): void;
    /**
     * Initialize file offset to current end of file
     */
    private initializeOffset;
    /**
     * Process new commands from file
     */
    private processNewCommands;
    /**
     * Execute a command from Stream Deck
     */
    private executeCommand;
    /**
     * Focus on approval notifications/toasts
     */
    private focusApprovals;
    /**
     * Open the notifications center panel
     */
    private openNotificationsCenter;
    /**
     * Stop listening for commands
     */
    stop(): void;
}
//# sourceMappingURL=commandHandler.d.ts.map