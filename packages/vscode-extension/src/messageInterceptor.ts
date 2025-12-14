import * as vscode from "vscode";
import { v4 as uuidv4 } from "uuid";
import { StateManager } from "./stateManager";
import { detectApproval } from "./approvalDetector";
import { ApprovalSeverity, PendingApproval } from "./types";

// Store original functions
let originalShowInformationMessage: typeof vscode.window.showInformationMessage;
let originalShowWarningMessage: typeof vscode.window.showWarningMessage;
let originalShowErrorMessage: typeof vscode.window.showErrorMessage;

// Reference to state manager
let stateManager: StateManager | null = null;

/**
 * Type for message items (can be string or MessageItem)
 */
type MessageItem = string | vscode.MessageItem;

/**
 * Store for pending approval resolvers (v1.2.0)
 * Allows external resolution via respond_approval command
 */
interface PendingResolver {
  resolve: (response: string | undefined) => void;
  items: MessageItem[];
}
const pendingResolvers = new Map<string, PendingResolver>();

/**
 * Extract string options from message items
 */
function extractOptions(items: MessageItem[]): string[] {
  return items.map((item) =>
    typeof item === "string" ? item : item.title
  );
}

/**
 * Extract response string from result
 */
function extractResponse(result: MessageItem | undefined): string | undefined {
  if (result === undefined) return undefined;
  return typeof result === "string" ? result : result.title;
}

/**
 * Handle an approval prompt (v1.2.0: supports external resolution via Promise race)
 */
async function handleApprovalPrompt<T extends MessageItem>(
  severity: ApprovalSeverity,
  message: string,
  items: T[],
  originalFn: (message: string, ...items: T[]) => Thenable<T | undefined>
): Promise<T | undefined> {
  const requestId = uuidv4();

  const approval: PendingApproval = {
    requestId,
    since: Date.now(),
    message,
    options: extractOptions(items),
    severity,
  };

  // Add to pending approvals
  await stateManager?.addPendingApproval(approval);

  // Promise race: User click in VS Code OR external command from Dashboard
  return new Promise<T | undefined>((resolveOuter) => {
    let resolved = false;

    // Store resolver for external resolution (Dashboard/API)
    pendingResolvers.set(requestId, {
      resolve: (response) => {
        if (resolved) return;
        resolved = true;
        pendingResolvers.delete(requestId);

        // Find matching item by response string
        const item = response
          ? (items.find((i) => extractResponse(i) === response) as T | undefined)
          : undefined;

        stateManager?.removePendingApproval(requestId, response);
        resolveOuter(item);
      },
      items: items as MessageItem[],
    });

    // Start original VS Code dialog in parallel
    originalFn(message, ...items)
      .then((result) => {
        if (resolved) return;
        resolved = true;
        pendingResolvers.delete(requestId);
        stateManager?.removePendingApproval(requestId, extractResponse(result));
        resolveOuter(result);
      })
      .catch((error) => {
        if (resolved) return;
        resolved = true;
        pendingResolvers.delete(requestId);
        stateManager?.removePendingApproval(requestId, "error");
        // Resolve with undefined on error (don't reject, to match VS Code behavior)
        resolveOuter(undefined);
        stateManager?.log("error", "Approval dialog error", { error: String(error) });
      });
  });
}

/**
 * Resolve an approval externally (v1.2.0)
 * Called by CommandHandler when respond_approval command is received
 * @returns true if the approval was found and resolved, false otherwise
 */
export function resolveApproval(requestId: string, response: string): boolean {
  const pending = pendingResolvers.get(requestId);
  if (pending) {
    pending.resolve(response);
    return true;
  }
  return false;
}

/**
 * Create intercepted version of showInformationMessage
 */
function createInterceptedShowInformationMessage() {
  // Overloaded function that handles all signatures
  function interceptedShowInformationMessage(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined>;
  function interceptedShowInformationMessage(
    message: string,
    options: vscode.MessageOptions,
    ...items: string[]
  ): Thenable<string | undefined>;
  function interceptedShowInformationMessage<T extends vscode.MessageItem>(
    message: string,
    ...items: T[]
  ): Thenable<T | undefined>;
  function interceptedShowInformationMessage<T extends vscode.MessageItem>(
    message: string,
    options: vscode.MessageOptions,
    ...items: T[]
  ): Thenable<T | undefined>;
  function interceptedShowInformationMessage(
    message: string,
    ...args: unknown[]
  ): Thenable<unknown> {
    // Parse arguments
    let options: vscode.MessageOptions | undefined;
    let items: MessageItem[];

    if (args.length > 0 && typeof args[0] === "object" && "modal" in (args[0] as object)) {
      options = args[0] as vscode.MessageOptions;
      items = args.slice(1) as MessageItem[];
    } else {
      items = args as MessageItem[];
    }

    const stringOptions = extractOptions(items);
    const detection = detectApproval(message, stringOptions);

    stateManager?.log("debug", "showInformationMessage called", {
      message: message.substring(0, 100),
      options: stringOptions,
      isApproval: detection.isApproval,
      reason: detection.reason,
    });

    if (detection.isApproval && stateManager) {
      return handleApprovalPrompt(
        detection.severity,
        message,
        items,
        (msg, ...itms) =>
          options
            ? originalShowInformationMessage(msg, options, ...(itms as string[]))
            : originalShowInformationMessage(msg, ...(itms as string[]))
      );
    }

    // Pass through to original
    return options
      ? originalShowInformationMessage(message, options, ...(items as string[]))
      : originalShowInformationMessage(message, ...(items as string[]));
  }

  return interceptedShowInformationMessage;
}

/**
 * Create intercepted version of showWarningMessage
 */
function createInterceptedShowWarningMessage() {
  function interceptedShowWarningMessage(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined>;
  function interceptedShowWarningMessage(
    message: string,
    options: vscode.MessageOptions,
    ...items: string[]
  ): Thenable<string | undefined>;
  function interceptedShowWarningMessage<T extends vscode.MessageItem>(
    message: string,
    ...items: T[]
  ): Thenable<T | undefined>;
  function interceptedShowWarningMessage<T extends vscode.MessageItem>(
    message: string,
    options: vscode.MessageOptions,
    ...items: T[]
  ): Thenable<T | undefined>;
  function interceptedShowWarningMessage(
    message: string,
    ...args: unknown[]
  ): Thenable<unknown> {
    let options: vscode.MessageOptions | undefined;
    let items: MessageItem[];

    if (args.length > 0 && typeof args[0] === "object" && "modal" in (args[0] as object)) {
      options = args[0] as vscode.MessageOptions;
      items = args.slice(1) as MessageItem[];
    } else {
      items = args as MessageItem[];
    }

    const stringOptions = extractOptions(items);
    const detection = detectApproval(message, stringOptions);

    stateManager?.log("debug", "showWarningMessage called", {
      message: message.substring(0, 100),
      options: stringOptions,
      isApproval: detection.isApproval,
      reason: detection.reason,
    });

    if (detection.isApproval && stateManager) {
      // Warning messages are at least "warning" severity
      const severity = detection.severity === "info" ? "warning" : detection.severity;
      return handleApprovalPrompt(
        severity,
        message,
        items,
        (msg, ...itms) =>
          options
            ? originalShowWarningMessage(msg, options, ...(itms as string[]))
            : originalShowWarningMessage(msg, ...(itms as string[]))
      );
    }

    return options
      ? originalShowWarningMessage(message, options, ...(items as string[]))
      : originalShowWarningMessage(message, ...(items as string[]));
  }

  return interceptedShowWarningMessage;
}

/**
 * Create intercepted version of showErrorMessage
 */
function createInterceptedShowErrorMessage() {
  function interceptedShowErrorMessage(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined>;
  function interceptedShowErrorMessage(
    message: string,
    options: vscode.MessageOptions,
    ...items: string[]
  ): Thenable<string | undefined>;
  function interceptedShowErrorMessage<T extends vscode.MessageItem>(
    message: string,
    ...items: T[]
  ): Thenable<T | undefined>;
  function interceptedShowErrorMessage<T extends vscode.MessageItem>(
    message: string,
    options: vscode.MessageOptions,
    ...items: T[]
  ): Thenable<T | undefined>;
  function interceptedShowErrorMessage(
    message: string,
    ...args: unknown[]
  ): Thenable<unknown> {
    let options: vscode.MessageOptions | undefined;
    let items: MessageItem[];

    if (args.length > 0 && typeof args[0] === "object" && "modal" in (args[0] as object)) {
      options = args[0] as vscode.MessageOptions;
      items = args.slice(1) as MessageItem[];
    } else {
      items = args as MessageItem[];
    }

    const stringOptions = extractOptions(items);
    const detection = detectApproval(message, stringOptions);

    stateManager?.log("debug", "showErrorMessage called", {
      message: message.substring(0, 100),
      options: stringOptions,
      isApproval: detection.isApproval,
      reason: detection.reason,
    });

    if (detection.isApproval && stateManager) {
      // Error messages are always "error" severity
      return handleApprovalPrompt(
        "error",
        message,
        items,
        (msg, ...itms) =>
          options
            ? originalShowErrorMessage(msg, options, ...(itms as string[]))
            : originalShowErrorMessage(msg, ...(itms as string[]))
      );
    }

    return options
      ? originalShowErrorMessage(message, options, ...(items as string[]))
      : originalShowErrorMessage(message, ...(items as string[]));
  }

  return interceptedShowErrorMessage;
}

/**
 * Install message interceptors
 */
export function installInterceptors(manager: StateManager): void {
  stateManager = manager;

  // Store originals
  originalShowInformationMessage = vscode.window.showInformationMessage;
  originalShowWarningMessage = vscode.window.showWarningMessage;
  originalShowErrorMessage = vscode.window.showErrorMessage;

  // Install interceptors
  (vscode.window as {
    showInformationMessage: typeof vscode.window.showInformationMessage;
  }).showInformationMessage = createInterceptedShowInformationMessage() as typeof vscode.window.showInformationMessage;

  (vscode.window as {
    showWarningMessage: typeof vscode.window.showWarningMessage;
  }).showWarningMessage = createInterceptedShowWarningMessage() as typeof vscode.window.showWarningMessage;

  (vscode.window as {
    showErrorMessage: typeof vscode.window.showErrorMessage;
  }).showErrorMessage = createInterceptedShowErrorMessage() as typeof vscode.window.showErrorMessage;

  manager.log("info", "Message interceptors installed");
}

/**
 * Uninstall message interceptors
 */
export function uninstallInterceptors(): void {
  if (originalShowInformationMessage) {
    (vscode.window as {
      showInformationMessage: typeof vscode.window.showInformationMessage;
    }).showInformationMessage = originalShowInformationMessage;
  }

  if (originalShowWarningMessage) {
    (vscode.window as {
      showWarningMessage: typeof vscode.window.showWarningMessage;
    }).showWarningMessage = originalShowWarningMessage;
  }

  if (originalShowErrorMessage) {
    (vscode.window as {
      showErrorMessage: typeof vscode.window.showErrorMessage;
    }).showErrorMessage = originalShowErrorMessage;
  }

  stateManager?.log("info", "Message interceptors uninstalled");
  stateManager = null;
}
