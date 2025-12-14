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
exports.installInterceptors = installInterceptors;
exports.uninstallInterceptors = uninstallInterceptors;
const vscode = __importStar(require("vscode"));
const uuid_1 = require("uuid");
const approvalDetector_1 = require("./approvalDetector");
// Store original functions
let originalShowInformationMessage;
let originalShowWarningMessage;
let originalShowErrorMessage;
// Reference to state manager
let stateManager = null;
/**
 * Extract string options from message items
 */
function extractOptions(items) {
    return items.map((item) => typeof item === "string" ? item : item.title);
}
/**
 * Extract response string from result
 */
function extractResponse(result) {
    if (result === undefined)
        return undefined;
    return typeof result === "string" ? result : result.title;
}
/**
 * Handle an approval prompt
 */
async function handleApprovalPrompt(severity, message, items, originalFn) {
    const requestId = (0, uuid_1.v4)();
    const approval = {
        requestId,
        since: Date.now(),
        message,
        options: extractOptions(items),
        severity,
    };
    // Add to pending approvals
    await stateManager?.addPendingApproval(approval);
    try {
        // Call original function and wait for response
        const result = await originalFn(message, ...items);
        // Remove from pending approvals
        await stateManager?.removePendingApproval(requestId, extractResponse(result));
        return result;
    }
    catch (error) {
        // Still remove if there's an error
        await stateManager?.removePendingApproval(requestId, "error");
        throw error;
    }
}
/**
 * Create intercepted version of showInformationMessage
 */
function createInterceptedShowInformationMessage() {
    function interceptedShowInformationMessage(message, ...args) {
        // Parse arguments
        let options;
        let items;
        if (args.length > 0 && typeof args[0] === "object" && "modal" in args[0]) {
            options = args[0];
            items = args.slice(1);
        }
        else {
            items = args;
        }
        const stringOptions = extractOptions(items);
        const detection = (0, approvalDetector_1.detectApproval)(message, stringOptions);
        stateManager?.log("debug", "showInformationMessage called", {
            message: message.substring(0, 100),
            options: stringOptions,
            isApproval: detection.isApproval,
            reason: detection.reason,
        });
        if (detection.isApproval && stateManager) {
            return handleApprovalPrompt(detection.severity, message, items, (msg, ...itms) => options
                ? originalShowInformationMessage(msg, options, ...itms)
                : originalShowInformationMessage(msg, ...itms));
        }
        // Pass through to original
        return options
            ? originalShowInformationMessage(message, options, ...items)
            : originalShowInformationMessage(message, ...items);
    }
    return interceptedShowInformationMessage;
}
/**
 * Create intercepted version of showWarningMessage
 */
function createInterceptedShowWarningMessage() {
    function interceptedShowWarningMessage(message, ...args) {
        let options;
        let items;
        if (args.length > 0 && typeof args[0] === "object" && "modal" in args[0]) {
            options = args[0];
            items = args.slice(1);
        }
        else {
            items = args;
        }
        const stringOptions = extractOptions(items);
        const detection = (0, approvalDetector_1.detectApproval)(message, stringOptions);
        stateManager?.log("debug", "showWarningMessage called", {
            message: message.substring(0, 100),
            options: stringOptions,
            isApproval: detection.isApproval,
            reason: detection.reason,
        });
        if (detection.isApproval && stateManager) {
            // Warning messages are at least "warning" severity
            const severity = detection.severity === "info" ? "warning" : detection.severity;
            return handleApprovalPrompt(severity, message, items, (msg, ...itms) => options
                ? originalShowWarningMessage(msg, options, ...itms)
                : originalShowWarningMessage(msg, ...itms));
        }
        return options
            ? originalShowWarningMessage(message, options, ...items)
            : originalShowWarningMessage(message, ...items);
    }
    return interceptedShowWarningMessage;
}
/**
 * Create intercepted version of showErrorMessage
 */
function createInterceptedShowErrorMessage() {
    function interceptedShowErrorMessage(message, ...args) {
        let options;
        let items;
        if (args.length > 0 && typeof args[0] === "object" && "modal" in args[0]) {
            options = args[0];
            items = args.slice(1);
        }
        else {
            items = args;
        }
        const stringOptions = extractOptions(items);
        const detection = (0, approvalDetector_1.detectApproval)(message, stringOptions);
        stateManager?.log("debug", "showErrorMessage called", {
            message: message.substring(0, 100),
            options: stringOptions,
            isApproval: detection.isApproval,
            reason: detection.reason,
        });
        if (detection.isApproval && stateManager) {
            // Error messages are always "error" severity
            return handleApprovalPrompt("error", message, items, (msg, ...itms) => options
                ? originalShowErrorMessage(msg, options, ...itms)
                : originalShowErrorMessage(msg, ...itms));
        }
        return options
            ? originalShowErrorMessage(message, options, ...items)
            : originalShowErrorMessage(message, ...items);
    }
    return interceptedShowErrorMessage;
}
/**
 * Install message interceptors
 */
function installInterceptors(manager) {
    stateManager = manager;
    // Store originals
    originalShowInformationMessage = vscode.window.showInformationMessage;
    originalShowWarningMessage = vscode.window.showWarningMessage;
    originalShowErrorMessage = vscode.window.showErrorMessage;
    // Install interceptors
    vscode.window.showInformationMessage = createInterceptedShowInformationMessage();
    vscode.window.showWarningMessage = createInterceptedShowWarningMessage();
    vscode.window.showErrorMessage = createInterceptedShowErrorMessage();
    manager.log("info", "Message interceptors installed");
}
/**
 * Uninstall message interceptors
 */
function uninstallInterceptors() {
    if (originalShowInformationMessage) {
        vscode.window.showInformationMessage = originalShowInformationMessage;
    }
    if (originalShowWarningMessage) {
        vscode.window.showWarningMessage = originalShowWarningMessage;
    }
    if (originalShowErrorMessage) {
        vscode.window.showErrorMessage = originalShowErrorMessage;
    }
    stateManager?.log("info", "Message interceptors uninstalled");
    stateManager = null;
}
//# sourceMappingURL=messageInterceptor.js.map