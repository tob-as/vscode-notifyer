# Foundry Integration (Per-App)

## Prinzip

Jede App integriert Foundry direkt. **Kein zentraler Gateway.**

Vorteile:
- Einfach und nachvollziehbar
- Keine Cross-App Dependencies
- Schnelles Prototyping
- Unabhängige Deployments

## Setup

### 1. Secrets konfigurieren

```bash
# Foundry Token pro Environment
wrangler secret put FOUNDRY_TOKEN --env dev
wrangler secret put FOUNDRY_TOKEN --env staging
wrangler secret put FOUNDRY_TOKEN --env prod
```

### 2. Environment Types

```typescript
// src/types/env.ts
export interface Env {
  FOUNDRY_TOKEN: string;
  // ... andere Bindings
}
```

## Foundry Client Pattern

```typescript
// src/foundry/client.ts

interface FoundryConfig {
  baseUrl: string;  // z.B. "https://company.palantircloud.com"
  token: string;
}

export class FoundryClient {
  private config: FoundryConfig;

  constructor(config: FoundryConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.config.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Foundry API error: ${response.status}`);
    }

    return response.json();
  }

  // Dataset operations
  async getDataset(datasetRid: string) {
    return this.request(`/api/v2/datasets/${datasetRid}`);
  }

  async queryDataset(datasetRid: string, query: object) {
    return this.request(`/api/v2/datasets/${datasetRid}/data`, {
      method: "POST",
      body: JSON.stringify(query),
    });
  }

  // Ontology operations
  async getObjects(objectType: string, filters?: object) {
    const params = filters ? `?${new URLSearchParams(filters as any)}` : "";
    return this.request(`/api/v2/ontology/objects/${objectType}${params}`);
  }

  async getObject(objectType: string, primaryKey: string) {
    return this.request(`/api/v2/ontology/objects/${objectType}/${primaryKey}`);
  }

  // Actions
  async executeAction(actionType: string, parameters: object) {
    return this.request(`/api/v2/ontology/actions/${actionType}/execute`, {
      method: "POST",
      body: JSON.stringify({ parameters }),
    });
  }
}

// Factory function
export function createFoundryClient(env: Env): FoundryClient {
  return new FoundryClient({
    baseUrl: "https://your-company.palantircloud.com",
    token: env.FOUNDRY_TOKEN,
  });
}
```

## Verwendung

### In Hono API

```typescript
// src/routes/data.ts
import { Hono } from "hono";
import { createFoundryClient } from "../foundry/client";

const data = new Hono<{ Bindings: Env }>();

data.get("/customers", async (c) => {
  const foundry = createFoundryClient(c.env);

  const customers = await foundry.getObjects("Customer", {
    limit: 100,
    orderBy: "name",
  });

  return c.json(customers);
});

data.get("/customers/:id", async (c) => {
  const foundry = createFoundryClient(c.env);
  const id = c.req.param("id");

  const customer = await foundry.getObject("Customer", id);

  return c.json(customer);
});

export { data };
```

### In RedwoodSDK Server Functions

```typescript
// src/app/actions/customers.ts
"use server";

import { getContext } from "rwsdk/worker";
import { createFoundryClient } from "../../foundry/client";

export async function getCustomers() {
  const { env } = getContext();
  const foundry = createFoundryClient(env);

  return foundry.getObjects("Customer");
}

export async function getCustomer(id: string) {
  const { env } = getContext();
  const foundry = createFoundryClient(env);

  return foundry.getObject("Customer", id);
}
```

## Caching (Optional)

```typescript
// src/foundry/cached-client.ts
import { FoundryClient, createFoundryClient } from "./client";

export class CachedFoundryClient {
  private client: FoundryClient;
  private kv: KVNamespace;
  private ttl: number;

  constructor(env: Env, ttl = 300) {
    this.client = createFoundryClient(env);
    this.kv = env.CACHE;  // KV namespace for caching
    this.ttl = ttl;
  }

  async getObjects(objectType: string, filters?: object) {
    const cacheKey = `foundry:${objectType}:${JSON.stringify(filters)}`;

    // Check cache
    const cached = await this.kv.get(cacheKey, "json");
    if (cached) return cached;

    // Fetch from Foundry
    const data = await this.client.getObjects(objectType, filters);

    // Cache result
    await this.kv.put(cacheKey, JSON.stringify(data), {
      expirationTtl: this.ttl,
    });

    return data;
  }
}
```

## Error Handling

```typescript
// src/foundry/errors.ts
export class FoundryError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string
  ) {
    super(message);
    this.name = "FoundryError";
  }
}

// In client
if (!response.ok) {
  throw new FoundryError(
    `Foundry API error: ${response.statusText}`,
    response.status,
    endpoint
  );
}

// In route handler
try {
  const data = await foundry.getObjects("Customer");
  return c.json(data);
} catch (error) {
  if (error instanceof FoundryError) {
    if (error.status === 401) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    if (error.status === 404) {
      return c.json({ error: "Not found" }, 404);
    }
  }
  throw error;
}
```

## Best Practices

1. **Token pro App** - Jede App hat eigenen Foundry Service Account
2. **Keine SDK** - Direkter HTTP Fetch, einfach zu debuggen
3. **Caching bedacht** - KV Cache für häufig gelesene Daten
4. **Error Handling** - Foundry-Fehler sauber behandeln
5. **Type Safety** - TypeScript Interfaces für Foundry-Objekte
6. **Rate Limiting** - Bei hohem Traffic beachten

## Do Not

- Keine Foundry-Credentials im Code
- Kein zentraler Gateway Worker
- Keine komplexen SDK Dependencies
- Keine direkten Foundry-Calls aus dem Frontend
