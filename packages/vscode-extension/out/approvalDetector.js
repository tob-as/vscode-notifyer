"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectApproval = detectApproval;
exports.extractCallerExtension = extractCallerExtension;
exports.isClaudeExtension = isClaudeExtension;
/**
 * Button patterns that indicate an approval prompt
 */
const APPROVAL_BUTTON_PATTERNS = [
    // Yes/No patterns (most common for Claude)
    { buttons: ["yes", "no"], severity: "info" },
    { buttons: ["yes", "no", "yes, and don't ask again"], severity: "info" },
    { buttons: ["yes", "no", "always allow"], severity: "info" },
    // Allow/Deny patterns
    { buttons: ["allow", "deny"], severity: "warning" },
    { buttons: ["allow", "deny", "always allow"], severity: "warning" },
    { buttons: ["allow once", "allow always", "deny"], severity: "warning" },
    // Approve/Reject patterns
    { buttons: ["approve", "reject"], severity: "warning" },
    // Continue/Cancel patterns (for dangerous operations)
    { buttons: ["continue", "cancel"], severity: "warning" },
];
/**
 * Keywords in message that suggest an approval prompt
 */
const APPROVAL_KEYWORDS = [
    // Permission-related
    "permission",
    "allow",
    "approve",
    "authorize",
    "grant",
    // Action-related
    "execute",
    "run",
    "command",
    "terminal",
    "shell",
    // Claude-specific
    "web search",
    "web fetch",
    "file access",
    "tool",
    "wants to",
    "would like to",
    // Git-related
    "git push",
    "git commit",
    "git checkout",
    // Safety-related
    "dangerous",
    "destructive",
    "irreversible",
];
/**
 * Keywords that indicate this is NOT an approval prompt
 * (to reduce false positives)
 */
const EXCLUSION_KEYWORDS = [
    "reload",
    "restart",
    "update available",
    "extension",
    "install",
    "upgrade",
];
/**
 * Normalize a string for comparison
 */
function normalize(str) {
    return str.toLowerCase().trim();
}
/**
 * Check if button set matches a known approval pattern
 */
function matchesButtonPattern(options) {
    const normalizedOptions = new Set(options.map(normalize));
    for (const pattern of APPROVAL_BUTTON_PATTERNS) {
        const patternSet = new Set(pattern.buttons);
        // Check if all pattern buttons are present in options
        let allPresent = true;
        for (const button of patternSet) {
            if (!normalizedOptions.has(button)) {
                // Also check for partial matches (e.g., "Yes" matches "yes, and don't ask again")
                const hasPartialMatch = [...normalizedOptions].some(opt => opt.includes(button) || button.includes(opt));
                if (!hasPartialMatch) {
                    allPresent = false;
                    break;
                }
            }
        }
        if (allPresent) {
            return { matches: true, severity: pattern.severity };
        }
    }
    // Check for "don't ask again" pattern which is a strong indicator
    const hasDontAskAgain = [...normalizedOptions].some(opt => opt.includes("don't ask again") ||
        opt.includes("always allow") ||
        opt.includes("allow always"));
    if (hasDontAskAgain && normalizedOptions.size >= 2) {
        return { matches: true, severity: "info" };
    }
    return { matches: false, severity: "info" };
}
/**
 * Check if message contains approval keywords
 */
function containsApprovalKeywords(message) {
    const lowerMessage = normalize(message);
    return APPROVAL_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}
/**
 * Check if message contains exclusion keywords
 */
function containsExclusionKeywords(message) {
    const lowerMessage = normalize(message);
    return EXCLUSION_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}
/**
 * Detect severity from message content
 */
function detectSeverityFromMessage(message) {
    const lowerMessage = normalize(message);
    if (lowerMessage.includes("dangerous") ||
        lowerMessage.includes("destructive") ||
        lowerMessage.includes("irreversible") ||
        lowerMessage.includes("delete") ||
        lowerMessage.includes("remove all")) {
        return "error";
    }
    if (lowerMessage.includes("warning") ||
        lowerMessage.includes("caution") ||
        lowerMessage.includes("git push") ||
        lowerMessage.includes("external")) {
        return "warning";
    }
    return "info";
}
/**
 * Detect if a message with options is an approval prompt
 *
 * @param message - The message being displayed
 * @param options - The button options available
 * @returns Detection result with isApproval flag and severity
 */
function detectApproval(message, options) {
    // Must have at least 2 options to be an approval prompt
    if (options.length < 2) {
        return {
            isApproval: false,
            severity: "info",
            reason: "Too few options",
        };
    }
    // Check for exclusion keywords first
    if (containsExclusionKeywords(message)) {
        return {
            isApproval: false,
            severity: "info",
            reason: "Contains exclusion keywords",
        };
    }
    // Check button patterns
    const buttonMatch = matchesButtonPattern(options);
    const hasApprovalKeywords = containsApprovalKeywords(message);
    // Strong match: known button pattern + approval keywords
    if (buttonMatch.matches && hasApprovalKeywords) {
        const messageSeverity = detectSeverityFromMessage(message);
        const severity = messageSeverity === "error" ? "error" :
            messageSeverity === "warning" ? "warning" :
                buttonMatch.severity;
        return {
            isApproval: true,
            severity,
            reason: `Button pattern match + keywords: ${options.join(", ")}`,
        };
    }
    // Medium match: just button pattern (could be false positive)
    if (buttonMatch.matches) {
        return {
            isApproval: true,
            severity: buttonMatch.severity,
            reason: `Button pattern match: ${options.join(", ")}`,
        };
    }
    // Weak match: approval keywords but unknown button pattern
    // Only flag if buttons look permission-like
    if (hasApprovalKeywords) {
        const normalizedOptions = options.map(normalize);
        const looksLikePermission = normalizedOptions.some(opt => opt.includes("yes") ||
            opt.includes("no") ||
            opt.includes("allow") ||
            opt.includes("deny") ||
            opt.includes("ok") ||
            opt.includes("cancel"));
        if (looksLikePermission) {
            return {
                isApproval: true,
                severity: detectSeverityFromMessage(message),
                reason: `Approval keywords with permission-like buttons: ${options.join(", ")}`,
            };
        }
    }
    return {
        isApproval: false,
        severity: "info",
        reason: "No approval pattern detected",
    };
}
/**
 * Try to extract caller extension info from stack trace
 * This is a best-effort attempt and may not always work
 */
function extractCallerExtension() {
    try {
        const stack = new Error().stack;
        if (!stack)
            return null;
        // Look for extension path pattern in stack
        // Format: .vscode-server/extensions/<publisher>.<name>-<version>/...
        const extensionMatch = stack.match(/\.vscode-server\/extensions\/([^/]+)-[\d.]+\//);
        if (extensionMatch) {
            return extensionMatch[1]; // Returns "publisher.name"
        }
        // Alternative pattern for local extensions
        const localMatch = stack.match(/extensions\/([^/]+)\//);
        if (localMatch) {
            return localMatch[1];
        }
        return null;
    }
    catch {
        return null;
    }
}
/**
 * Check if the caller is likely Claude Code extension
 */
function isClaudeExtension(extensionId) {
    if (!extensionId)
        return false;
    const claudePatterns = [
        "anthropic",
        "claude",
        "claude-code",
        "claude-dev",
    ];
    const lowerId = extensionId.toLowerCase();
    return claudePatterns.some(pattern => lowerId.includes(pattern));
}
//# sourceMappingURL=approvalDetector.js.map