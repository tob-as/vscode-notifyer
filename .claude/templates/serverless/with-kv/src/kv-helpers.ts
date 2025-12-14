/**
 * KV Storage Helpers
 *
 * Usage:
 *   import { KVStore } from './kv-helpers';
 *   const cache = new KVStore(env.CACHE);
 *   await cache.set('key', { data: 'value' }, 3600);
 */

export class KVStore {
  private kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  /**
   * Get a value from KV
   */
  async get<T = unknown>(key: string, json = true): Promise<T | null> {
    if (json) {
      return await this.kv.get(key, 'json') as T | null;
    }
    return await this.kv.get(key, 'text') as T | null;
  }

  /**
   * Set a value in KV
   */
  async set(key: string, value: unknown, ttl: number | null = null): Promise<void> {
    const options: KVNamespacePutOptions = ttl ? { expirationTtl: ttl } : {};
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await this.kv.put(key, stringValue, options);
  }

  /**
   * Delete a value from KV
   */
  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }

  /**
   * List keys with prefix
   */
  async list(prefix = '', limit = 1000): Promise<string[]> {
    const { keys } = await this.kv.list({ prefix, limit });
    return keys.map(k => k.name);
  }

  /**
   * Get or set with callback (cache pattern)
   */
  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl = 3600): Promise<T> {
    let value = await this.get<T>(key);
    if (value === null) {
      value = await fetchFn();
      await this.set(key, value, ttl);
    }
    return value;
  }
}
