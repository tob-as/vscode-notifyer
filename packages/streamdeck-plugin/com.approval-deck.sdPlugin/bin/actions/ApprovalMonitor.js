var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { action, SingletonAction, } from "@elgato/streamdeck";
import { DEFAULT_MONITOR_SETTINGS, } from "../types";
import { ProjectStateWatcher } from "../stateWatcher";
import { getCommandWriter } from "../commandWriter";
import { getSoundPlayer } from "../soundPlayer";
import { renderMonitorKey, renderDisconnectedKey, svgToDataUrl, shouldBlink, } from "../svgRenderer";
/**
 * Approval Monitor Action - monitors a single project
 */
let ApprovalMonitor = class ApprovalMonitor extends SingletonAction {
    watchers = new Map();
    blinkIntervals = new Map();
    blinkStates = new Map();
    lastPendingCounts = new Map();
    timerIntervals = new Map();
    /**
     * Called when action appears on Stream Deck
     */
    async onWillAppear(ev) {
        const settings = { ...DEFAULT_MONITOR_SETTINGS, ...ev.payload.settings };
        const contextId = ev.action.id;
        // Store initial settings
        this.blinkStates.set(contextId, true);
        this.lastPendingCounts.set(contextId, 0);
        // Start watching if settings are valid
        if (settings.sharedDirHost && settings.projectId) {
            this.startWatching(ev, settings);
        }
        else {
            // Show configuration required
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
        const settings = { ...DEFAULT_MONITOR_SETTINGS, ...ev.payload.settings };
        const contextId = ev.action.id;
        // Stop existing watcher
        this.stopWatching(contextId);
        // Restart with new settings
        if (settings.sharedDirHost && settings.projectId) {
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
        const settings = { ...DEFAULT_MONITOR_SETTINGS, ...ev.payload.settings };
        if (!settings.sharedDirHost || !settings.projectId) {
            return;
        }
        // Send focus command to VS Code
        const writer = getCommandWriter(settings.sharedDirHost);
        writer.focusApprovals(settings.projectId);
        console.log(`Sent focus_approvals command for ${settings.projectId}`);
    }
    /**
     * Start watching a project's state
     */
    startWatching(ev, settings) {
        const contextId = ev.action.id;
        // Create state watcher
        const watcher = new ProjectStateWatcher(settings.sharedDirHost, settings.projectId, async (state) => {
            await this.handleStateUpdate(ev, settings, state);
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
            const currentWatcher = this.watchers.get(contextId);
            if (currentWatcher) {
                const state = currentWatcher.getState();
                await this.updateKeyImage(ev, state, settings, this.blinkStates.get(contextId) ?? true);
            }
        }, 1000);
        this.timerIntervals.set(contextId, timerInterval);
        console.log(`Started watching project ${settings.projectId}`);
    }
    /**
     * Stop watching a project's state
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
        this.lastPendingCounts.delete(contextId);
    }
    /**
     * Handle state update from watcher
     */
    async handleStateUpdate(ev, settings, state) {
        const contextId = ev.action.id;
        // Check for pending count change (0 -> >0)
        const lastCount = this.lastPendingCounts.get(contextId) ?? 0;
        const newCount = state?.pendingCount ?? 0;
        if (lastCount === 0 && newCount > 0) {
            // New pending approval - play sound
            if (settings.enableSound) {
                const player = getSoundPlayer(settings.soundCooldownMs);
                player.play();
            }
        }
        this.lastPendingCounts.set(contextId, newCount);
        // Update key image
        await this.updateKeyImage(ev, state, settings, this.blinkStates.get(contextId) ?? true);
    }
    /**
     * Toggle blink state and update key
     */
    async toggleBlink(ev, settings) {
        const contextId = ev.action.id;
        const watcher = this.watchers.get(contextId);
        const state = watcher?.getState() ?? null;
        // Only toggle if should blink
        if (shouldBlink(state)) {
            const currentBlink = this.blinkStates.get(contextId) ?? true;
            this.blinkStates.set(contextId, !currentBlink);
            await this.updateKeyImage(ev, state, settings, !currentBlink);
        }
    }
    /**
     * Update key image
     */
    async updateKeyImage(ev, state, settings, blinkOn = true) {
        let svg;
        if (!settings.sharedDirHost || !settings.projectId) {
            svg = renderDisconnectedKey("Configure");
        }
        else if (!state) {
            svg = renderDisconnectedKey(settings.projectLabelOverride || settings.projectId);
        }
        else {
            svg = renderMonitorKey(state, blinkOn, settings.projectLabelOverride);
        }
        await ev.action.setImage(svgToDataUrl(svg));
    }
};
ApprovalMonitor = __decorate([
    action({ UUID: "com.approval-deck.monitor" })
], ApprovalMonitor);
export { ApprovalMonitor };
//# sourceMappingURL=ApprovalMonitor.js.map