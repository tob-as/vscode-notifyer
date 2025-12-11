import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { healthRoutes } from "./routes/health";
import { itemRoutes } from "./routes/items";

// Define your environment bindings
type Env = {
  // DB: D1Database;
  // KV: KVNamespace;
};

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use("/*", logger());
app.use("/*", cors());

// Mount routes
app.route("/api", healthRoutes);
app.route("/api/items", itemRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Error:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
