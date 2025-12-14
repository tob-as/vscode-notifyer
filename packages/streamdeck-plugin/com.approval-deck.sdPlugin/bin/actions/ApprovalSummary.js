var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { action, SingletonAction, } from "@elgato/streamdeck";
import { DEFAULT_SUMMARY_SETTINGS } from "../types";
import { SummaryStateWatcher } from "../stateWatcher";
import { getCommandWriter } from "../commandWriter";
import { getSoundPlayer } from "../soundPlayer";
import { renderSummaryKey, svgToDataUrl, shouldSummaryBlink, } from "../svgRenderer";
/**
 * Approval Summary Action - shows summary across all projects
 */
let ApprovalSummary = class ApprovalSummary extends SingletonAction {
    watchers = new Map();
    blinkIntervals = new Map();
    blinkStates = new Map();
    lastTotalPending = new Map();
    timerIntervals = new Map();
    currentSummary = new Map();
    /**
     * Called when action appears on Stream Deck
     */
    async onWillAppear(ev) {
        const settings = { ...DEFAULT_SUMMARY_SETTINGS, ...ev.payload.settings };
        const contextId = ev.action.id;
        // Store initial state
        this.blinkStates.set(contextId, true);
        this.lastTotalPending.set(contextId, 0);
        this.currentSummary.set(contextId, null);
        // Start watching if settings are valid
        if (settings.sharedDirHost) {
            this.startWatching(ev, settings);
        }
        else {
            await this.updateKeyImage(ev, null, settings);
        }
    }
    /**
     * Called when action disappears from Stream Deck
     */
    async onWillDisappear(ev) {
        this.stopWatching(ev.action.id);
    }
    /**
     * Called when settings are updated via Property Inspector
     */
    async onDidReceiveSettings(ev) {
        const settings = { ...DEFAULT_SUMMARY_SETTINGS, ...ev.payload.settings };
        const contextId = ev.action.id;
        // Stop existing watcher
        this.stopWatching(contextId);
        // Restart with new settings
        if (settings.sharedDirHost) {
            this.startWatching(ev, settings);
        }
        else {
            await this.updateKeyImage(ev, null, settings);
        }
    }
    /**
     * Called when key is pressed
     */
    async onKeyDown(ev) {
        const settings = { ...DEFAULT_SUMMARY_SETTINGS, ...ev.payload.settings };
        const contextId = ev.action.id;
        if (!settings.sharedDirHost) {
            return;
        }
        // Get oldest pending project
        const watcher = this.watchers.get(contextId);
        const oldestProjectId = watcher?.getOldestPendingProjectId();
        if (oldestProjectId) {
            // Send focus command to the oldest pending project
            const writer = getCommandWriter(settings.sharedDirHost);
            writer.focusApprovals(oldestProjectId);
            console.log(`Sent focus_approvals command for ${oldestProjectId}`);
        }
        else {
            console.log("No pending approvals to focus");
        }
    }
    /**
     * Start watching all projects' states
     */
    startWatching(ev, settings) {
        const contextId = ev.action.id;
        // Create summary watcher
        const watcher = new SummaryStateWatcher(settings.sharedDirHost, async (summary) => {
            await this.handleSummaryUpdate(ev, settings, summary);
        });
        watcher.start();
        this.watchers.set(contextId, watcher);
        // Start blink interval
        const blinkInterval = setInterval(() => {
            this.toggleBlink(ev, settings);
        }, settings.blinkIntervalMs);
        this.blinkIntervals.set(contextId, blinkInterval);
        // Start timer update interval (every second)
        const timerInterval = setInterval(async () => {
            const summary = this.currentSummary.get(contextId);
            await this.updateKeyImage(ev, summary, settings, this.blinkStates.get(contextId) ?? true);
        }, 1000);
        this.timerIntervals.set(contextId, timerInterval);
        console.log(`Started summary watching in ${settings.sharedDirHost}`);
    }
    /**
     * Stop watching
     */
    stopWatching(contextId) {
        // Stop watcher
        const watcher = this.watchers.get(contextId);
        if (watcher) {
            watcher.stop();
            this.watchers.delete(contextId);
        }
        // Stop blink interval
        const blinkInterval = this.blinkIntervals.get(contextId);
        if (blinkInterval) {
            clearInterval(blinkInterval);
            this.blinkIntervals.delete(contextId);
        }
        // Stop timer interval
        const timerInterval = this.timerIntervals.get(contextId);
        if (timerInterval) {
            clearInterval(timerInterval);
            this.timerIntervals.delete(contextId);
        }
        // Clean up state
        this.blinkStates.delete(contextId);
        this.lastTotalPending.delete(contextId);
        this.currentSummary.delete(contextId);
    }
    /**
     * Handle summary update
     */
    async handleSummaryUpdate(ev, settings, summary) {
        const contextId = ev.action.id;
        // Store current summary
        this.currentSummary.set(contextId, summary);
        // Check for pending count change (0 -> >0)
        const lastTotal = this.lastTotalPending.get(contextId) ?? 0;
        const newTotal = summary.totalPending;
        if (lastTotal === 0 && newTotal > 0) {
            // New pending approval - play sound
            if (settings.enableSound) {
                const player = getSoundPlayer(settings.soundCooldownMs);
                player.play();
            }
        }
        this.lastTotalPending.set(contextId, newTotal);
        // Update key image
        await this.updateKeyImage(ev, summary, settings, this.blinkStates.get(contextId) ?? true);
    }
    /**
     * Toggle blink state and update key
     */
    async toggleBlink(ev, settings) {
        const contextId = ev.action.id;
        const summary = this.currentSummary.get(contextId);
        // Only toggle if should blink
        if (shouldSummaryBlink(summary)) {
            const currentBlink = this.blinkStates.get(contextId) ?? true;
            this.blinkStates.set(contextId, !currentBlink);
            await this.updateKeyImage(ev, summary, settings, !currentBlink);
        }
    }
    /**
     * Update key image
     */
    async updateKeyImage(ev, summary, settings, blinkOn = true) {
        const svg = renderSummaryKey(summary, blinkOn);
        await ev.action.setImage(svgToDataUrl(svg));
    }
};
ApprovalSummary = __decorate([
    action({ UUID: "com.approval-deck.summary" })
], ApprovalSummary);
export { ApprovalSummary };
//# sourceMappingURL=ApprovalSummary.js.map