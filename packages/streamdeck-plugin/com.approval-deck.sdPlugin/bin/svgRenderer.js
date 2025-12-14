/** Key image dimensions */
const KEY_WIDTH = 144;
const KEY_HEIGHT = 144;
/** Color palette */
const COLORS = {
    // Background colors
    waiting_approval_on: "#CC0000", // Bright red
    waiting_approval_off: "#330000", // Dark red
    running: "#006600", // Green
    idle_on: "#666600", // Olive
    idle_off: "#333300", // Dark olive
    error: "#660066", // Purple
    disconnected: "#333333", // Gray
    // Text colors
    text_primary: "#FFFFFF",
    text_secondary: "#CCCCCC",
    // Summary specific
    all_idle: "#666600",
    has_pending: "#CC0000",
};
/**
 * Escape XML special characters
 */
function escapeXml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
/**
 * Truncate string to max length with ellipsis
 */
function truncate(str, maxLen) {
    if (str.length <= maxLen)
        return str;
    return str.substring(0, maxLen - 1) + "…";
}
/**
 * Format duration as mm:ss or h:mm:ss
 */
function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
/**
 * Get background color for project state
 */
function getBackgroundColor(state, blinkOn) {
    if (!state) {
        return COLORS.disconnected;
    }
    switch (state.mode) {
        case "waiting_approval":
            return blinkOn ? COLORS.waiting_approval_on : COLORS.waiting_approval_off;
        case "running":
            return COLORS.running;
        case "idle":
            return blinkOn ? COLORS.idle_on : COLORS.idle_off;
        case "error":
            return COLORS.error;
        default:
            return COLORS.disconnected;
    }
}
/**
 * Get timer text for project state
 */
function getTimerText(state) {
    if (!state)
        return "--:--";
    const now = Date.now();
    if (state.pendingCount > 0 && state.oldestPendingSince) {
        // Show time since oldest pending approval
        return formatDuration(now - state.oldestPendingSince);
    }
    // Show time since last activity
    return formatDuration(now - state.lastActivityAt);
}
/**
 * Render a project monitor key
 */
export function renderMonitorKey(state, blinkOn, labelOverride) {
    const bgColor = getBackgroundColor(state, blinkOn);
    const label = truncate(labelOverride || state?.projectLabel || "?", 10);
    const pendingCount = state?.pendingCount ?? 0;
    const timer = getTimerText(state);
    const countColor = pendingCount > 0 ? COLORS.text_primary : COLORS.text_secondary;
    return `<svg width="${KEY_WIDTH}" height="${KEY_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${KEY_WIDTH}" height="${KEY_HEIGHT}" fill="${bgColor}"/>
    <text x="${KEY_WIDTH / 2}" y="40" text-anchor="middle" fill="${COLORS.text_primary}"
          font-size="16" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(label)}</text>
    <text x="${KEY_WIDTH / 2}" y="85" text-anchor="middle" fill="${countColor}"
          font-size="36" font-family="Arial, sans-serif" font-weight="bold">${pendingCount}</text>
    <text x="${KEY_WIDTH / 2}" y="125" text-anchor="middle" fill="${COLORS.text_secondary}"
          font-size="16" font-family="Arial, sans-serif">${timer}</text>
  </svg>`;
}
/**
 * Render a disconnected monitor key
 */
export function renderDisconnectedKey(label) {
    return `<svg width="${KEY_WIDTH}" height="${KEY_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${KEY_WIDTH}" height="${KEY_HEIGHT}" fill="${COLORS.disconnected}"/>
    <text x="${KEY_WIDTH / 2}" y="40" text-anchor="middle" fill="${COLORS.text_primary}"
          font-size="16" font-family="Arial, sans-serif" font-weight="bold">${escapeXml(truncate(label, 10))}</text>
    <text x="${KEY_WIDTH / 2}" y="85" text-anchor="middle" fill="${COLORS.text_secondary}"
          font-size="14" font-family="Arial, sans-serif">Not</text>
    <text x="${KEY_WIDTH / 2}" y="105" text-anchor="middle" fill="${COLORS.text_secondary}"
          font-size="14" font-family="Arial, sans-serif">Connected</text>
  </svg>`;
}
/**
 * Get background color for summary state
 */
function getSummaryBackgroundColor(summary, blinkOn) {
    if (!summary || summary.projects.size === 0) {
        return COLORS.disconnected;
    }
    if (summary.totalPending > 0) {
        return blinkOn ? COLORS.waiting_approval_on : COLORS.waiting_approval_off;
    }
    if (summary.runningCount === 0 && summary.idleCount > 0) {
        // All idle
        return blinkOn ? COLORS.idle_on : COLORS.idle_off;
    }
    return COLORS.running;
}
/**
 * Render a summary key
 */
export function renderSummaryKey(summary, blinkOn) {
    const bgColor = getSummaryBackgroundColor(summary, blinkOn);
    if (!summary || summary.projects.size === 0) {
        return `<svg width="${KEY_WIDTH}" height="${KEY_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${KEY_WIDTH}" height="${KEY_HEIGHT}" fill="${COLORS.disconnected}"/>
      <text x="${KEY_WIDTH / 2}" y="50" text-anchor="middle" fill="${COLORS.text_primary}"
            font-size="14" font-family="Arial, sans-serif" font-weight="bold">Summary</text>
      <text x="${KEY_WIDTH / 2}" y="85" text-anchor="middle" fill="${COLORS.text_secondary}"
            font-size="12" font-family="Arial, sans-serif">No Projects</text>
    </svg>`;
    }
    const totalPending = summary.totalPending;
    const projectCount = summary.projects.size;
    // Timer: if pending, show oldest pending time; otherwise show "all running" or "all idle"
    let statusText;
    if (totalPending > 0 && summary.oldestPendingSince) {
        statusText = formatDuration(Date.now() - summary.oldestPendingSince);
    }
    else if (summary.runningCount > 0) {
        statusText = `${summary.runningCount} active`;
    }
    else {
        statusText = "all idle";
    }
    const pendingColor = totalPending > 0 ? COLORS.text_primary : COLORS.text_secondary;
    return `<svg width="${KEY_WIDTH}" height="${KEY_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${KEY_WIDTH}" height="${KEY_HEIGHT}" fill="${bgColor}"/>
    <text x="${KEY_WIDTH / 2}" y="35" text-anchor="middle" fill="${COLORS.text_primary}"
          font-size="14" font-family="Arial, sans-serif" font-weight="bold">Summary</text>
    <text x="${KEY_WIDTH / 2}" y="55" text-anchor="middle" fill="${COLORS.text_secondary}"
          font-size="12" font-family="Arial, sans-serif">${projectCount} project${projectCount !== 1 ? "s" : ""}</text>
    <text x="${KEY_WIDTH / 2}" y="95" text-anchor="middle" fill="${pendingColor}"
          font-size="32" font-family="Arial, sans-serif" font-weight="bold">${totalPending}</text>
    <text x="${KEY_WIDTH / 2}" y="125" text-anchor="middle" fill="${COLORS.text_secondary}"
          font-size="14" font-family="Arial, sans-serif">${statusText}</text>
  </svg>`;
}
/**
 * Convert SVG to data URL for Stream Deck
 */
export function svgToDataUrl(svg) {
    const base64 = Buffer.from(svg).toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
}
/**
 * Check if state should blink
 */
export function shouldBlink(state) {
    if (!state)
        return false;
    return state.mode === "waiting_approval" || state.mode === "idle";
}
/**
 * Check if summary should blink
 */
export function shouldSummaryBlink(summary) {
    if (!summary || summary.projects.size === 0)
        return false;
    // Blink if any pending or all idle
    if (summary.totalPending > 0)
        return true;
    if (summary.runningCount === 0 && summary.idleCount > 0)
        return true;
    return false;
}
//# sourceMappingURL=svgRenderer.js.map