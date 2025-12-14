import * as vscode from "vscode";
import * as path from "path";
import { ExtensionConfig } from "./types";
import { StateManager } from "./stateManager";
import { CommandHandler } from "./commandHandler";
import { installInterceptors, uninstallInterceptors } from "./messageInterceptor";

let stateManager: StateManager | null = null;
let commandHandler: CommandHandler | null = null;
let outputChannel: vscode.OutputChannel | null = null;
let textEditThrottleTimeout: NodeJS.Timeout | null = null;

/**
 * Get extension configuration from VS Code settings
 */
function getConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration("approvalDeck");
  const workspaceFolders = vscode.workspace.workspaceFolders;

  // Default projectId from workspace folder name
  let defaultProjectId = "default";
  if (workspaceFolders && workspaceFolders.length > 0) {
    defaultProjectId = path.basename(workspaceFolders[0].uri.fsPath);
    // Sanitize for use as filename
    defaultProjectId = defaultProjectId.replace(/[^a-zA-Z0-9_-]/g, "_");
  }

  const projectId = config.get<string>("projectId") || defaultProjectId;

  return {
    sharedDir: config.get<string>("sharedDir") || "/shared/approval-deck",
    projectId,
    projectLabel: config.get<string>("projectLabel") || projectId,
    idleThresholdSec: config.get<number>("idleThresholdSec") || 120,
    enableDebugLog: config.get<boolean>("enableDebugLog") || false,
    commandPollIntervalMs: config.get<number>("commandPollIntervalMs") || 250,
  };
}

/**
 * Register extension commands
 */
function registerCommands(context: vscode.ExtensionContext): void {
  // Show status command
  const showStatus = vscode.commands.registerCommand(
    "approvalDeck.showStatus",
    () => {
      if (stateManager) {
        const pendingCount = stateManager.getPendingCount();
        vscode.window.showInformationMessage(
          `Approval Deck: ${pendingCount} pending approval(s)`
        );
      } else {
        vscode.window.showWarningMessage("Approval Deck is not active");
      }
    }
  );

  // Focus approvals command
  const focusApprovals = vscode.commands.registerCommand(
    "approvalDeck.focusApprovals",
    async () => {
      try {
        await vscode.commands.executeCommand("notifications.focusToasts");
      } catch {
        await vscode.commands.executeCommand(
          "workbench.action.openNotifications"
        );
      }
    }
  );

  // Debug: Simulate approval command
  const simulateApproval = vscode.commands.registerCommand(
    "approvalDeck.simulateApproval",
    async () => {
      // This uses the intercepted function, so it will be tracked
      const result = await vscode.window.showInformationMessage(
        "Allow Claude to execute this command?",
        "Yes",
        "No",
        "Yes, and don't ask again"
      );
      vscode.window.showInformationMessage(`You selected: ${result || "nothing"}`);
    }
  );

  context.subscriptions.push(showStatus, focusApprovals, simulateApproval);
}

/**
 * Initialize the extension
 */
async function initialize(context: vscode.ExtensionContext): Promise<void> {
  const config = getConfig();

  outputChannel!.appendLine("=".repeat(50));
  outputChannel!.appendLine(`Approval Deck initializing...`);
  outputChannel!.appendLine(`Project ID: ${config.projectId}`);
  outputChannel!.appendLine(`Project Label: ${config.projectLabel}`);
  outputChannel!.appendLine(`Shared Dir: ${config.sharedDir}`);
  outputChannel!.appendLine(`Idle Threshold: ${config.idleThresholdSec}s`);
  outputChannel!.appendLine(`Debug Logging: ${config.enableDebugLog}`);
  outputChannel!.appendLine("=".repeat(50));

  // Create state manager
  stateManager = new StateManager(config, outputChannel!);

  // Install message interceptors
  installInterceptors(stateManager);

  // Create and start command handler
  commandHandler = new CommandHandler(config, stateManager);
  commandHandler.start();

  // Write initial state
  await stateManager.writeState();

  outputChannel!.appendLine("Approval Deck activated successfully");
}

/**
 * Handle configuration changes
 */
function handleConfigChange(context: vscode.ExtensionContext): void {
  // Dispose current handlers
  if (commandHandler) {
    commandHandler.stop();
    commandHandler = null;
  }
  if (stateManager) {
    stateManager.dispose();
    stateManager = null;
  }
  uninstallInterceptors();

  // Reinitialize with new config
  initialize(context);
}

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext): void {
  // Create output channel
  outputChannel = vscode.window.createOutputChannel("Approval Deck");
  context.subscriptions.push(outputChannel);

  // Register commands
  registerCommands(context);

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("approvalDeck")) {
        outputChannel!.appendLine("Configuration changed, reinitializing...");
        handleConfigChange(context);
      }
    })
  );

  // v1.1.0: Track text document edits (throttled to avoid too many state writes)
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      // Ignore output channels, terminal, etc.
      if (e.document.uri.scheme !== "file") {
        return;
      }
      // Ignore empty changes
      if (e.contentChanges.length === 0) {
        return;
      }

      // Throttle: Only update once per 2 seconds
      if (textEditThrottleTimeout) {
        clearTimeout(textEditThrottleTimeout);
      }
      textEditThrottleTimeout = setTimeout(() => {
        if (stateManager) {
          stateManager.updateTextEdit();
        }
        textEditThrottleTimeout = null;
      }, 2000);
    })
  );

  // Initialize
  initialize(context);
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
  outputChannel?.appendLine("Approval Deck deactivating...");

  // Uninstall interceptors
  uninstallInterceptors();

  // Stop command handler
  if (commandHandler) {
    commandHandler.stop();
    commandHandler = null;
  }

  // Dispose state manager
  if (stateManager) {
    stateManager.dispose();
    stateManager = null;
  }

  outputChannel?.appendLine("Approval Deck deactivated");
}
