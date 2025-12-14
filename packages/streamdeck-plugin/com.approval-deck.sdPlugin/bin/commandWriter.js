import * as fs from "fs";
import * as path from "path";
/**
 * Writes commands to the NDJSON command file for VS Code extension to read
 */
export class CommandWriter {
    sharedDir;
    constructor(sharedDir) {
        this.sharedDir = sharedDir;
        this.ensureCommandsDir();
    }
    /**
     * Ensure commands directory exists
     */
    ensureCommandsDir() {
        const commandsDir = path.join(this.sharedDir, "commands");
        if (!fs.existsSync(commandsDir)) {
            try {
                fs.mkdirSync(commandsDir, { recursive: true });
            }
            catch {
                // Directory might already exist or creation failed
            }
        }
    }
    /**
     * Get command file path for a project
     */
    getCommandPath(projectId) {
        return path.join(this.sharedDir, "commands", `${projectId}.ndjson`);
    }
    /**
     * Write a command for a project
     */
    writeCommand(projectId, type) {
        const command = {
            ts: Date.now(),
            type,
            projectId,
        };
        const commandPath = this.getCommandPath(projectId);
        const line = JSON.stringify(command) + "\n";
        try {
            // Append to file (creates if doesn't exist)
            fs.appendFileSync(commandPath, line, "utf8");
        }
        catch (error) {
            console.error(`Failed to write command for ${projectId}:`, error);
        }
    }
    /**
     * Send focus_approvals command
     */
    focusApprovals(projectId) {
        this.writeCommand(projectId, "focus_approvals");
    }
    /**
     * Send open_notifications_center command
     */
    openNotificationsCenter(projectId) {
        this.writeCommand(projectId, "open_notifications_center");
    }
}
/**
 * Cache of command writers by shared dir
 */
const writers = new Map();
/**
 * Get or create a command writer for a shared directory
 */
export function getCommandWriter(sharedDir) {
    let writer = writers.get(sharedDir);
    if (!writer) {
        writer = new CommandWriter(sharedDir);
        writers.set(sharedDir, writer);
    }
    return writer;
}
//# sourceMappingURL=commandWriter.js.map