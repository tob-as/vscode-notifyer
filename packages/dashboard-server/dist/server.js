#!/usr/bin/env node
import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { StateWatcher } from "./stateWatcher.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Parse CLI arguments
function parseArgs() {
    const args = process.argv.slice(2);
    let port = 3847;
    let sharedDir = process.env.APPROVAL_DECK_SHARED_DIR || "/shared/approval-deck";
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--port" && args[i + 1]) {
            port = parseInt(args[i + 1], 10);
            i++;
        }
        else if (args[i] === "--shared-dir" && args[i + 1]) {
            sharedDir = args[i + 1];
            i++;
        }
        else if (args[i] === "--help" || args[i] === "-h") {
            console.log(`
Approval Deck Dashboard Server

Usage: approval-dashboard [options]

Options:
  --port <number>       Port to listen on (default: 3847)
  --shared-dir <path>   Path to shared directory (default: /shared/approval-deck)
  --help, -h            Show this help message

Environment variables:
  APPROVAL_DECK_SHARED_DIR   Default shared directory path
`);
            process.exit(0);
        }
    }
    return { port, sharedDir };
}
// SSE clients
const sseClients = new Set();
// Broadcast SSE event to all clients
function broadcastSSE(event, data) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of sseClients) {
        try {
            client.write(message);
        }
        catch {
            sseClients.delete(client);
        }
    }
}
// Read request body as JSON
async function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            }
            catch (e) {
                reject(new Error("Invalid JSON"));
            }
        });
        req.on("error", reject);
    });
}
// Send JSON response
function sendJSON(res, data, status = 200) {
    res.writeHead(status, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify(data));
}
// Send HTML response
function sendHTML(res, html) {
    res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
    });
    res.end(html);
}
// Write command to NDJSON file
function writeCommand(sharedDir, projectId, command) {
    const commandsDir = path.join(sharedDir, "commands");
    const commandFile = path.join(commandsDir, `${projectId}.ndjson`);
    // Ensure commands directory exists
    if (!fs.existsSync(commandsDir)) {
        fs.mkdirSync(commandsDir, { recursive: true });
    }
    const line = JSON.stringify(command) + "\n";
    fs.appendFileSync(commandFile, line, "utf8");
}
// Load dashboard HTML
function loadDashboardHTML() {
    // Try to load from src directory first (development), then dist (production)
    const srcPath = path.join(__dirname, "index.html");
    const distPath = path.join(__dirname, "..", "src", "index.html");
    for (const htmlPath of [srcPath, distPath]) {
        if (fs.existsSync(htmlPath)) {
            return fs.readFileSync(htmlPath, "utf8");
        }
    }
    return `<!DOCTYPE html>
<html><body>
<h1>Error</h1>
<p>Dashboard HTML not found. Please ensure index.html is in the correct location.</p>
</body></html>`;
}
// Main server
function main() {
    const config = parseArgs();
    console.log(`Starting Approval Deck Dashboard...`);
    console.log(`  Port: ${config.port}`);
    console.log(`  Shared Dir: ${config.sharedDir}`);
    // Verify shared directory exists
    if (!fs.existsSync(config.sharedDir)) {
        console.log(`  Creating shared directory...`);
        fs.mkdirSync(config.sharedDir, { recursive: true });
    }
    // Create state watcher
    const watcher = new StateWatcher(config.sharedDir);
    // Set up watcher events
    watcher.on("state-change", (_projectId, state) => {
        broadcastSSE("state-change", state);
    });
    watcher.on("new-approval", (projectId, requestId) => {
        broadcastSSE("new-approval", { projectId, requestId });
    });
    watcher.on("project-removed", (projectId) => {
        broadcastSSE("project-removed", { projectId });
    });
    watcher.on("error", (error) => {
        console.error("StateWatcher error:", error.message);
    });
    // Start watching
    watcher.start();
    // Load dashboard HTML
    let dashboardHTML = loadDashboardHTML();
    // Create HTTP server
    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url || "/", `http://localhost:${config.port}`);
        const pathname = url.pathname;
        // CORS preflight
        if (req.method === "OPTIONS") {
            res.writeHead(204, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            });
            res.end();
            return;
        }
        try {
            // Routes
            if (pathname === "/" && req.method === "GET") {
                // Reload HTML in development
                if (process.env.NODE_ENV !== "production") {
                    dashboardHTML = loadDashboardHTML();
                }
                sendHTML(res, dashboardHTML);
            }
            else if (pathname === "/api/projects" && req.method === "GET") {
                const projects = watcher.getAllStates();
                const summary = watcher.getSummary();
                sendJSON(res, { projects, summary });
            }
            else if (pathname === "/api/events" && req.method === "GET") {
                // SSE endpoint
                res.writeHead(200, {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                    "Access-Control-Allow-Origin": "*",
                });
                // Send initial state
                const projects = watcher.getAllStates();
                const summary = watcher.getSummary();
                res.write(`event: init\ndata: ${JSON.stringify({ projects, summary })}\n\n`);
                // Add to clients
                sseClients.add(res);
                // Remove on close
                req.on("close", () => {
                    sseClients.delete(res);
                });
            }
            else if (pathname === "/api/respond" && req.method === "POST") {
                const body = (await readBody(req));
                if (!body.projectId || !body.requestId || !body.response) {
                    sendJSON(res, { error: "Missing projectId, requestId, or response" }, 400);
                    return;
                }
                // Write command to file
                const command = {
                    ts: Date.now(),
                    type: "respond_approval",
                    projectId: body.projectId,
                    requestId: body.requestId,
                    response: body.response,
                };
                try {
                    writeCommand(config.sharedDir, body.projectId, command);
                    sendJSON(res, { success: true, message: "Response sent" });
                }
                catch (error) {
                    sendJSON(res, { error: `Failed to write command: ${error}` }, 500);
                }
            }
            else if (pathname === "/api/health" && req.method === "GET") {
                sendJSON(res, { status: "ok", uptime: process.uptime() });
            }
            else {
                sendJSON(res, { error: "Not found" }, 404);
            }
        }
        catch (error) {
            console.error("Request error:", error);
            sendJSON(res, { error: "Internal server error" }, 500);
        }
    });
    // Start server
    server.listen(config.port, () => {
        console.log(`\nDashboard running at http://localhost:${config.port}`);
        console.log(`Press Ctrl+C to stop\n`);
    });
    // Graceful shutdown
    process.on("SIGINT", () => {
        console.log("\nShutting down...");
        watcher.stop();
        server.close();
        process.exit(0);
    });
    process.on("SIGTERM", () => {
        watcher.stop();
        server.close();
        process.exit(0);
    });
}
main();
//# sourceMappingURL=server.js.map