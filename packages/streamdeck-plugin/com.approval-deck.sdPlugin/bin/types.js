/**
 * Shared types for Stream Deck plugin
 * (Mirrors VS Code extension types for state/command protocol)
 */
/** Schema version for state file format */
export const STATE_SCHEMA_VERSION = 1;
/** Default settings for Monitor action */
export const DEFAULT_MONITOR_SETTINGS = {
    sharedDirHost: "",
    projectId: "",
    projectLabelOverride: "",
    blinkIntervalMs: 500,
    enableSound: true,
    soundCooldownMs: 1500,
};
/** Default settings for Summary action */
export const DEFAULT_SUMMARY_SETTINGS = {
    sharedDirHost: "",
    blinkIntervalMs: 500,
    enableSound: true,
    soundCooldownMs: 1500,
};
//# sourceMappingURL=types.js.map