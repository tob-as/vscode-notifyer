/**
 * Cross-platform sound player with cooldown support
 */
export declare class SoundPlayer {
    private cooldownMs;
    private lastPlayedAt;
    private soundFile;
    private enabled;
    constructor(cooldownMs?: number);
    /**
     * Enable or disable sound
     */
    setEnabled(enabled: boolean): void;
    /**
     * Set cooldown period
     */
    setCooldown(ms: number): void;
    /**
     * Play alert sound if not in cooldown
     * Returns true if sound was played, false if skipped
     */
    play(): Promise<boolean>;
    /**
     * Play sound using OS-specific method
     */
    private playSound;
    /**
     * Play system beep as fallback
     */
    private playSystemBeep;
    /**
     * Execute a command and return promise
     */
    private execCommand;
}
/**
 * Get or create the global sound player
 */
export declare function getSoundPlayer(cooldownMs?: number): SoundPlayer;
//# sourceMappingURL=soundPlayer.d.ts.map