import { useState, useEffect } from "react";

interface HealthResponse {
  status: string;
  timestamp: string;
}

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then(setHealth)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="container">
      <h1>{{APP_NAME}}</h1>
      <p>React + Hono Microtool running on Cloudflare</p>

      <section className="card">
        <h2>API Health Check</h2>
        {error ? (
          <p className="error">Error: {error}</p>
        ) : health ? (
          <p className="success">
            Status: {health.status} <br />
            Time: {health.timestamp}
          </p>
        ) : (
          <p>Loading...</p>
        )}
      </section>

      <section>
        <h2>Getting Started</h2>
        <ul>
          <li>
            <code>apps/web/</code> - React SPA (Cloudflare Pages)
          </li>
          <li>
            <code>apps/api/</code> - Hono API (Cloudflare Workers)
          </li>
          <li>
            <code>packages/shared/</code> - Shared types and utilities
          </li>
        </ul>
      </section>

      <section>
        <h2>Commands</h2>
        <ul>
          <li>
            <code>pnpm dev</code> - Start development
          </li>
          <li>
            <code>pnpm build</code> - Build all packages
          </li>
          <li>
            <code>pnpm deploy</code> - Deploy to production
          </li>
        </ul>
      </section>
    </div>
  );
}
