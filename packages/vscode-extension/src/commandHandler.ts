import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Command, ExtensionConfig, RespondApprovalCommand } from "./types";
import { StateManager } from "./stateManager";
import { resolveApproval } from "./messageInterceptor";

/**
 * Handles commands from Stream Deck plugin
 */
export class CommandHandler {
  private config: ExtensionConfig;
  private stateManager: StateManager;
  private commandFilePath: string;
  private offset: number = 0;
  private pollInterval: NodeJS.Timeout | null = null;
  private watcher: fs.FSWatcher | null = null;
  private isProcessing: boolean = false;

  constructor(config: ExtensionConfig, stateManager: StateManager) {
    this.config = config;
    this.stateManager = stateManager;
    this.commandFilePath = path.join(
      config.sharedDir,
      "commands",
      `${config.projectId}.ndjson`
    );
  }

  /**
   * Start listening for commands
   */
  start(): void {
    // Initialize offset to end of file (don't process old commands)
    this.initializeOffset();

    // Try fs.watch first, fall back to polling
    try {
      this.watcher = fs.watch(this.commandFilePath, { persistent: false }, () => {
        this.processNewCommands();
      });
      this.stateManager.log("info", "Command watcher started (fs.watch)");
    } catch {
      // File might not exist yet or fs.watch not available
      this.stateManager.log(
        "info",
        "fs.watch not available, using polling for commands"
      );
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
  private initializeOffset(): void {
    try {
      if (fs.existsSync(this.commandFilePath)) {
        const stats = fs.statSync(this.commandFilePath);
        this.offset = stats.size;
        this.stateManager.log("debug", "Command file offset initialized", {
          offset: this.offset,
        });
      }
    } catch {
      this.offset = 0;
    }
  }

  /**
   * Process new commands from file
   */
  private async processNewCommands(): Promise<void> {
    if (this.isProcessing) return;
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
          const command = JSON.parse(line) as Command;
          await this.executeCommand(command);
        } catch (parseError) {
          this.stateManager.log("warn", "Failed to parse command line", {
            line: line.substring(0, 100),
            error: String(parseError),
          });
        }
      }

      // Update offset
      this.offset = stats.size;
    } catch (error) {
      this.stateManager.log("error", "Error processing commands", {
        error: String(error),
      });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Execute a command from Stream Deck
   */
  private async executeCommand(command: Command): Promise<void> {
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

      case "respond_approval":
        await this.respondToApproval(command as RespondApprovalCommand);
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
  private async focusApprovals(): Promise<void> {
    // Try different approaches to focus notifications

    // First, try to focus toasts (notification popups)
    try {
      await vscode.commands.executeCommand("notifications.focusToasts");
      this.stateManager.log("debug", "Executed notifications.focusToasts");
      return;
    } catch {
      // Command might not exist in all VS Code versions
    }

    // Fall back to opening notifications center
    await this.openNotificationsCenter();
  }

  /**
   * Open the notifications center panel
   */
  private async openNotificationsCenter(): Promise<void> {
    try {
      await vscode.commands.executeCommand(
        "workbench.action.openNotifications"
      );
      this.stateManager.log("debug", "Executed workbench.action.openNotifications");
    } catch (error) {
      this.stateManager.log("error", "Failed to open notifications", {
        error: String(error),
      });
    }

    // Also try to focus toasts after opening center
    try {
      await vscode.commands.executeCommand("notifications.focusToasts");
    } catch {
      // Ignore errors
    }
  }

  /**
   * Respond to a pending approval (v1.2.0)
   * Called when respond_approval command is received from Dashboard
   */
  private async respondToApproval(command: RespondApprovalCommand): Promise<void> {
    const { requestId, response } = command;

    this.stateManager.log("info", "Processing respond_approval", {
      requestId,
      response,
    });

    const success = resolveApproval(requestId, response);

    if (success) {
      this.stateManager.log("info", "Approval resolved via Dashboard", {
        requestId,
        response,
      });
    } else {
      this.stateManager.log("warn", "Approval not found (may have been resolved locally)", {
        requestId,
        response,
      });
    }
  }

  /**
   * Stop listening for commands
   */
  stop(): void {
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
