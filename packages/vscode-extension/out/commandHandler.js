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
exports.CommandHandler = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
/**
 * Handles commands from Stream Deck plugin
 */
class CommandHandler {
    config;
    stateManager;
    commandFilePath;
    offset = 0;
    pollInterval = null;
    watcher = null;
    isProcessing = false;
    constructor(config, stateManager) {
        this.config = config;
        this.stateManager = stateManager;
        this.commandFilePath = path.join(config.sharedDir, "commands", `${config.projectId}.ndjson`);
    }
    /**
     * Start listening for commands
     */
    start() {
        // Initialize offset to end of file (don't process old commands)
        this.initializeOffset();
        // Try fs.watch first, fall back to polling
        try {
            this.watcher = fs.watch(this.commandFilePath, { persistent: false }, () => {
                this.processNewCommands();
            });
            this.stateManager.log("info", "Command watcher started (fs.watch)");
        }
        catch {
            // File might not exist yet or fs.watch not available
            this.stateManager.log("info", "fs.watch not available, using polling for commands");
        }
        // Always use polling as backup/primary
        this.pollInterval = setInterval(() => {
            this.processNewCommands();
        }, this.config.commandPollIntervalMs);
        this.stateManager.log("info", "Command handler started", {
            pollIntervalMs: this.config.commandPollIntervalMs,
        });
    }
    /**
     * Initialize file offset to current end of file
     */
    initializeOffset() {
        try {
            if (fs.existsSync(this.commandFilePath)) {
                const stats = fs.statSync(this.commandFilePath);
                this.offset = stats.size;
                this.stateManager.log("debug", "Command file offset initialized", {
                    offset: this.offset,
                });
            }
        }
        catch {
            this.offset = 0;
        }
    }
    /**
     * Process new commands from file
     */
    async processNewCommands() {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        try {
            if (!fs.existsSync(this.commandFilePath)) {
                return;
            }
            const stats = fs.statSync(this.commandFilePath);
            // Handle file truncation (file was reset)
            if (stats.size < this.offset) {
                this.stateManager.log("warn", "Command file truncated, resetting offset");
                this.offset = 0;
            }
            // No new content
            if (stats.size <= this.offset) {
                return;
            }
            // Read new content
            const fd = fs.openSync(this.commandFilePath, "r");
            const buffer = Buffer.alloc(stats.size - this.offset);
            fs.readSync(fd, buffer, 0, buffer.length, this.offset);
            fs.closeSync(fd);
            const newContent = buffer.toString("utf8");
            const lines = newContent.split("\n").filter((line) => line.trim());
            for (const line of lines) {
                try {
                    const command = JSON.parse(line);
                    await this.executeCommand(command);
                }
                catch (parseError) {
                    this.stateManager.log("warn", "Failed to parse command line", {
                        line: line.substring(0, 100),
                        error: String(parseError),
                    });
                }
            }
            // Update offset
            this.offset = stats.size;
        }
        catch (error) {
            this.stateManager.log("error", "Error processing commands", {
                error: String(error),
            });
        }
        finally {
            this.isProcessing = false;
        }
    }
    /**
     * Execute a command from Stream Deck
     */
    async executeCommand(command) {
        this.stateManager.log("info", "Executing command", {
            type: command.type,
            ts: command.ts,
        });
        switch (command.type) {
            case "focus_approvals":
                await this.focusApprovals();
                break;
            case "open_notifications_center":
                await this.openNotificationsCenter();
                break;
            default:
                this.stateManager.log("warn", "Unknown command type", {
                    type: command.type,
                });
        }
    }
    /**
     * Focus on approval notifications/toasts
     */
    async focusApprovals() {
        // Try different approaches to focus notifications
        // First, try to focus toasts (notification popups)
        try {
            await vscode.commands.executeCommand("notifications.focusToasts");
            this.stateManager.log("debug", "Executed notifications.focusToasts");
            return;
        }
        catch {
            // Command might not exist in all VS Code versions
        }
        // Fall back to opening notifications center
        await this.openNotificationsCenter();
    }
    /**
     * Open the notifications center panel
     */
    async openNotificationsCenter() {
        try {
            await vscode.commands.executeCommand("workbench.action.openNotifications");
            this.stateManager.log("debug", "Executed workbench.action.openNotifications");
        }
        catch (error) {
            this.stateManager.log("error", "Failed to open notifications", {
                error: String(error),
            });
        }
        // Also try to focus toasts after opening center
        try {
            await vscode.commands.executeCommand("notifications.focusToasts");
        }
        catch {
            // Ignore errors
        }
    }
    /**
     * Stop listening for commands
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
        this.stateManager.log("info", "Command handler stopped");
    }
}
exports.CommandHandler = CommandHandler;
//# sourceMappingURL=commandHandler.js.map