import { ApprovalDetectionResult } from "./types";
/**
 * Detect if a message with options is an approval prompt
 *
 * @param message - The message being displayed
 * @param options - The button options available
 * @returns Detection result with isApproval flag and severity
 */
export declare function detectApproval(message: string, options: string[]): ApprovalDetectionResult;
/**
 * Try to extract caller extension info from stack trace
 * This is a best-effort attempt and may not always work
 */
export declare function extractCallerExtension(): string | null;
/**
 * Check if the caller is likely Claude Code extension
 */
export declare function isClaudeExtension(extensionId: string | null): boolean;
//# sourceMappingURL=approvalDetector.d.ts.map