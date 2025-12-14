import { ProjectState, SummaryState } from "./types";
/**
 * Render a project monitor key
 */
export declare function renderMonitorKey(state: ProjectState | null, blinkOn: boolean, labelOverride?: string): string;
/**
 * Render a disconnected monitor key
 */
export declare function renderDisconnectedKey(label: string): string;
/**
 * Render a summary key
 */
export declare function renderSummaryKey(summary: SummaryState | null, blinkOn: boolean): string;
/**
 * Convert SVG to data URL for Stream Deck
 */
export declare function svgToDataUrl(svg: string): string;
/**
 * Check if state should blink
 */
export declare function shouldBlink(state: ProjectState | null): boolean;
/**
 * Check if summary should blink
 */
export declare function shouldSummaryBlink(summary: SummaryState | null): boolean;
//# sourceMappingURL=svgRenderer.d.ts.map