import { defineConfig } from 'vitest/config';
import { cloudflareWorkersPool } from '@cloudflare/vitest-pool-workers/config';

export default defineConfig({
  test: {
    pool: cloudflareWorkersPool(),
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' }
      }
    }
  }
});
