import { exec } from "child_process";
import * as path from "path";
import * as fs from "fs";
/**
 * Cross-platform sound player with cooldown support
 */
export class SoundPlayer {
    cooldownMs;
    lastPlayedAt = 0;
    soundFile;
    enabled = true;
    constructor(cooldownMs = 1500) {
        this.cooldownMs = cooldownMs;
        // Determine sound file path
        // In production, the file will be in the assets folder
        this.soundFile = path.join(__dirname, "..", "assets", "alert.wav");
    }
    /**
     * Enable or disable sound
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    /**
     * Set cooldown period
     */
    setCooldown(ms) {
        this.cooldownMs = ms;
    }
    /**
     * Play alert sound if not in cooldown
     * Returns true if sound was played, false if skipped
     */
    async play() {
        if (!this.enabled) {
            return false;
        }
        const now = Date.now();
        if (now - this.lastPlayedAt < this.cooldownMs) {
            return false;
        }
        this.lastPlayedAt = now;
        try {
            await this.playSound();
            return true;
        }
        catch (error) {
            console.error("Failed to play sound:", error);
            return false;
        }
    }
    /**
     * Play sound using OS-specific method
     */
    async playSound() {
        // Check if sound file exists
        if (!fs.existsSync(this.soundFile)) {
            // Fall back to system beep
            await this.playSystemBeep();
            return;
        }
        const platform = process.platform;
        if (platform === "darwin") {
            // macOS: use afplay
            await this.execCommand(`afplay "${this.soundFile}"`);
        }
        else if (platform === "win32") {
            // Windows: use PowerShell SoundPlayer
            const escapedPath = this.soundFile.replace(/\\/g, "\\\\");
            await this.execCommand(`powershell -c "(New-Object Media.SoundPlayer '${escapedPath}').PlaySync()"`);
        }
        else {
            // Linux: try various players
            try {
                await this.execCommand(`aplay "${this.soundFile}"`);
            }
            catch {
                try {
                    await this.execCommand(`paplay "${this.soundFile}"`);
                }
                catch {
                    await this.playSystemBeep();
                }
            }
        }
    }
    /**
     * Play system beep as fallback
     */
    async playSystemBeep() {
        const platform = process.platform;
        if (platform === "darwin") {
            // macOS: use osascript beep
            await this.execCommand('osascript -e "beep"');
        }
        else if (platform === "win32") {
            // Windows: use PowerShell beep
            await this.execCommand("powershell -c \"[console]::beep(1000,500)\"");
        }
        else {
            // Linux: use bell character
            process.stdout.write("\x07");
        }
    }
    /**
     * Execute a command and return promise
     */
    execCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
/**
 * Global sound player instance
 */
let globalSoundPlayer = null;
/**
 * Get or create the global sound player
 */
export function getSoundPlayer(cooldownMs) {
    if (!globalSoundPlayer) {
        globalSoundPlayer = new SoundPlayer(cooldownMs);
    }
    else if (cooldownMs !== undefined) {
        globalSoundPlayer.setCooldown(cooldownMs);
    }
    return globalSoundPlayer;
}
//# sourceMappingURL=soundPlayer.js.map