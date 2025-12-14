import { CommandType } from "./types";
/**
 * Writes commands to the NDJSON command file for VS Code extension to read
 */
export declare class CommandWriter {
    private sharedDir;
    constructor(sharedDir: string);
    /**
     * Ensure commands directory exists
     */
    private ensureCommandsDir;
    /**
     * Get command file path for a project
     */
    private getCommandPath;
    /**
     * Write a command for a project
     */
    writeCommand(projectId: string, type: CommandType): void;
    /**
     * Send focus_approvals command
     */
    focusApprovals(projectId: string): void;
    /**
     * Send open_notifications_center command
     */
    openNotificationsCenter(projectId: string): void;
}
/**
 * Get or create a command writer for a shared directory
 */
export declare function getCommandWriter(sharedDir: string): CommandWriter;
//# sourceMappingURL=commandWriter.d.ts.map