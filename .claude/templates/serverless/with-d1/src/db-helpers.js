/**
 * D1 Database Helpers
 *
 * Usage:
 *   import { Database } from './db-helpers.js';
 *   const db = new Database(env.DB);
 *   const user = await db.findOne('users', { email: 'test@example.com' });
 */

export class Database {
  constructor(d1) {
    this.d1 = d1;
  }

  /**
   * Find one record by conditions
   * @param {string} table
   * @param {object} where - { column: value }
   */
  async findOne(table, where) {
    const keys = Object.keys(where);
    const conditions = keys.map(k => `${k} = ?`).join(' AND ');
    const values = Object.values(where);

    return await this.d1.prepare(
      `SELECT * FROM ${table} WHERE ${conditions} LIMIT 1`
    ).bind(...values).first();
  }

  /**
   * Find all records by conditions
   * @param {string} table
   * @param {object} where - { column: value }
   * @param {object} options - { limit, offset, orderBy }
   */
  async findAll(table, where = {}, options = {}) {
    let sql = `SELECT * FROM ${table}`;
    const values = [];

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
    return results;
  }

  /**
   * Insert a record
   * @param {string} table
   * @param {object} data
   */
  async insert(table, data) {
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
   * @param {string} table
   * @param {object} data - Data to update
   * @param {object} where - Conditions
   */
  async update(table, data, where) {
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
   * @param {string} table
   * @param {object} where
   */
  async delete(table, where) {
    const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
    const values = Object.values(where);

    const result = await this.d1.prepare(
      `DELETE FROM ${table} WHERE ${whereClause}`
    ).bind(...values).run();

    return result.meta.changes;
  }

  /**
   * Execute raw SQL
   * @param {string} sql
   * @param {array} params
   */
  async raw(sql, params = []) {
    return await this.d1.prepare(sql).bind(...params).all();
  }
}
