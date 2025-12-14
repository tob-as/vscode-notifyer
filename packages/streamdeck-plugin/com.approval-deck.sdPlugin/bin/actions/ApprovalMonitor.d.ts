import { KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent, DidReceiveSettingsEvent } from "@elgato/streamdeck";
import { MonitorSettings } from "../types";
/**
 * Approval Monitor Action - monitors a single project
 */
export declare class ApprovalMonitor extends SingletonAction<MonitorSettings> {
    private watchers;
    private blinkIntervals;
    private blinkStates;
    private lastPendingCounts;
    private timerIntervals;
    /**
     * Called when action appears on Stream Deck
     */
    onWillAppear(ev: WillAppearEvent<MonitorSettings>): Promise<void>;
    /**
     * Called when action disappears from Stream Deck
     */
    onWillDisappear(ev: WillDisappearEvent<MonitorSettings>): Promise<void>;
    /**
     * Called when settings are updated via Property Inspector
     */
    onDidReceiveSettings(ev: DidReceiveSettingsEvent<MonitorSettings>): Promise<void>;
    /**
     * Called when key is pressed
     */
    onKeyDown(ev: KeyDownEvent<MonitorSettings>): Promise<void>;
    /**
     * Start watching a project's state
     */
    private startWatching;
    /**
     * Stop watching a project's state
     */
    private stopWatching;
    /**
     * Handle state update from watcher
     */
    private handleStateUpdate;
    /**
     * Toggle blink state and update key
     */
    private toggleBlink;
    /**
     * Update key image
     */
    private updateKeyImage;
}
//# sourceMappingURL=ApprovalMonitor.d.ts.map