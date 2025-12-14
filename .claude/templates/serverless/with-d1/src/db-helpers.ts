/**
 * D1 Database Helpers
 *
 * Usage:
 *   import { Database } from './db-helpers';
 *   const db = new Database(env.DB);
 *   const user = await db.findOne('users', { email: 'test@example.com' });
 */

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
}

export class Database {
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  /**
   * Find one record by conditions
   */
  async findOne<T = Record<string, unknown>>(table: string, where: Record<string, unknown>): Promise<T | null> {
    const keys = Object.keys(where);
    const conditions = keys.map(k => `${k} = ?`).join(' AND ');
    const values = Object.values(where);

    return await this.d1.prepare(
      `SELECT * FROM ${table} WHERE ${conditions} LIMIT 1`
    ).bind(...values).first() as T | null;
  }

  /**
   * Find all records by conditions
   */
  async findAll<T = Record<string, unknown>>(
    table: string,
    where: Record<string, unknown> = {},
    options: QueryOptions = {}
  ): Promise<T[]> {
    let sql = `SELECT * FROM ${table}`;
    const values: unknown[] = [];

    if (Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
      sql += ` WHERE ${conditions}`;
      values.push(...Object.values(where));
    }

    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`;
    }

    if (options.limit) {
      sql += ` LIMIT ${options.limit}`;
    }

    if (options.offset) {
      sql += ` OFFSET ${options.offset}`;
    }

    const { results } = await this.d1.prepare(sql).bind(...values).all();
    return results as T[];
  }

  /**
   * Insert a record
   */
  async insert(table: string, data: Record<string, unknown>): Promise<number> {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(', ');
    const values = Object.values(data);

    const result = await this.d1.prepare(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
    ).bind(...values).run();

    return result.meta.last_row_id;
  }

  /**
   * Update records
   */
  async update(
    table: string,
    data: Record<string, unknown>,
    where: Record<string, unknown>
  ): Promise<number> {
    const setClause = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
    const values = [...Object.values(data), ...Object.values(where)];

    const result = await this.d1.prepare(
      `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`
    ).bind(...values).run();

    return result.meta.changes;
  }

  /**
   * Delete records
   */
  async delete(table: string, where: Record<string, unknown>): Promise<number> {
    const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
    const values = Object.values(where);

    const result = await this.d1.prepare(
      `DELETE FROM ${table} WHERE ${whereClause}`
    ).bind(...values).run();

    return result.meta.changes;
  }

  /**
   * Execute raw SQL
   */
  async raw<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<D1Result<T>> {
    return await this.d1.prepare(sql).bind(...params).all() as D1Result<T>;
  }
}
