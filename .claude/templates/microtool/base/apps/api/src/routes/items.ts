import { Hono } from "hono";

type Env = {
  // DB: D1Database;
};

// In-memory store for demo (replace with D1)
const items: Array<{ id: number; title: string; createdAt: string }> = [];
let nextId = 1;

export const itemRoutes = new Hono<{ Bindings: Env }>();

// List items
itemRoutes.get("/", (c) => {
  return c.json(items);
});

// Get item by ID
itemRoutes.get("/:id", (c) => {
  const id = parseInt(c.req.param("id"));
  const item = items.find((i) => i.id === id);

  if (!item) {
    return c.json({ error: "Item not found" }, 404);
  }

  return c.json(item);
});

// Create item
itemRoutes.post("/", async (c) => {
  const body = await c.req.json<{ title: string }>();

  if (!body.title) {
    return c.json({ error: "Title is required" }, 400);
  }

  const item = {
    id: nextId++,
    title: body.title,
    createdAt: new Date().toISOString(),
  };

  items.push(item);

  return c.json(item, 201);
});

// Delete item
itemRoutes.delete("/:id", (c) => {
  const id = parseInt(c.req.param("id"));
  const index = items.findIndex((i) => i.id === id);

  if (index === -1) {
    return c.json({ error: "Item not found" }, 404);
  }

  items.splice(index, 1);

  return c.json({ success: true });
});
