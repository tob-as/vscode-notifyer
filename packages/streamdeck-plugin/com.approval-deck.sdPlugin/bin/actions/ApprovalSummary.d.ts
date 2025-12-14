import { KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent, DidReceiveSettingsEvent } from "@elgato/streamdeck";
import { SummarySettings } from "../types";
/**
 * Approval Summary Action - shows summary across all projects
 */
export declare class ApprovalSummary extends SingletonAction<SummarySettings> {
    private watchers;
    private blinkIntervals;
    private blinkStates;
    private lastTotalPending;
    private timerIntervals;
    private currentSummary;
    /**
     * Called when action appears on Stream Deck
     */
    onWillAppear(ev: WillAppearEvent<SummarySettings>): Promise<void>;
    /**
     * Called when action disappears from Stream Deck
     */
    onWillDisappear(ev: WillDisappearEvent<SummarySettings>): Promise<void>;
    /**
     * Called when settings are updated via Property Inspector
     */
    onDidReceiveSettings(ev: DidReceiveSettingsEvent<SummarySettings>): Promise<void>;
    /**
     * Called when key is pressed
     */
    onKeyDown(ev: KeyDownEvent<SummarySettings>): Promise<void>;
    /**
     * Start watching all projects' states
     */
    private startWatching;
    /**
     * Stop watching
     */
    private stopWatching;
    /**
     * Handle summary update
     */
    private handleSummaryUpdate;
    /**
     * Toggle blink state and update key
     */
    private toggleBlink;
    /**
     * Update key image
     */
    private updateKeyImage;
}
//# sourceMappingURL=ApprovalSummary.d.ts.map