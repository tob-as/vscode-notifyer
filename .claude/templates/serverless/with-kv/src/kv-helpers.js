/**
 * KV Storage Helpers
 *
 * Usage:
 *   import { KVStore } from './kv-helpers.js';
 *   const cache = new KVStore(env.CACHE);
 *   await cache.set('key', { data: 'value' }, 3600);
 */

export class KVStore {
  constructor(kv) {
    this.kv = kv;
  }

  /**
   * Get a value from KV
   * @param {string} key
   * @param {boolean} json - Parse as JSON (default: true)
   */
  async get(key, json = true) {
    const value = await this.kv.get(key, json ? 'json' : 'text');
    return value;
  }

  /**
   * Set a value in KV
   * @param {string} key
   * @param {any} value
   * @param {number} ttl - Time to live in seconds (optional)
   */
  async set(key, value, ttl = null) {
    const options = ttl ? { expirationTtl: ttl } : {};
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await this.kv.put(key, stringValue, options);
  }

  /**
   * Delete a value from KV
   * @param {string} key
   */
  async delete(key) {
    await this.kv.delete(key);
  }

  /**
   * List keys with prefix
   * @param {string} prefix
   * @param {number} limit
   */
  async list(prefix = '', limit = 1000) {
    const { keys } = await this.kv.list({ prefix, limit });
    return keys.map(k => k.name);
  }

  /**
   * Get or set with callback (cache pattern)
   * @param {string} key
   * @param {function} fetchFn - Async function to fetch if not cached
   * @param {number} ttl - Cache TTL in seconds
   */
  async getOrSet(key, fetchFn, ttl = 3600) {
    let value = await this.get(key);
    if (value === null) {
      value = await fetchFn();
      await this.set(key, value, ttl);
    }
    return value;
  }
}
