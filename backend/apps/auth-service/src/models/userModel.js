/**
 * Postgres-backed UserModel
 * Uses shared/db.postgres to run parameterized queries against the `users` table
 * Matches schema defined in `init-db/01-init.sql` (columns: id, email, password_hash, first_name, last_name, phone, ...)
 */
const db = require('../../../../shared/db').postgres;
const { v4: uuidv4 } = require('uuid');

class UserModel {
  /**
   * Create a new user record
   * @param {Object} payload { email, password (hashed), name, first_name, last_name, phone }
   */
  static async create({ email, password, name, first_name, last_name, phone }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // split name if provided but not first/last
      let fName = first_name || null;
      let lName = last_name || null;
      if (!fName && name) {
        const parts = String(name).trim().split(/\s+/);
        fName = parts.shift() || null;
        lName = parts.join(' ') || null;
      }

      const insertSQL = `
        INSERT INTO users (id, email, password_hash, first_name, last_name, phone)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, password_hash, first_name, last_name, phone, status, created_at, updated_at
      `;

      const id = uuidv4();
      const values = [id, email, password, fName, lName, phone || null];

      const res = await client.query(insertSQL, values);
      await client.query('COMMIT');

      const row = res.rows[0];
      // keep backward compatibility: return `password` field (used by controller) mapped from password_hash
      row.password = row.password_hash;
      return row;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /** Find a user by email */
  static async findByEmail(email) {
    const sql = 'SELECT id, email, password_hash, first_name, last_name, phone, status, created_at, updated_at FROM users WHERE email = $1 LIMIT 1';
    const res = await db.query(sql, [email]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    row.password = row.password_hash; // compatibility with previous API
    return row;
  }

  /** Find user by id */
  static async findById(id) {
    const sql = 'SELECT id, email, password_hash, first_name, last_name, phone, status, created_at, updated_at FROM users WHERE id = $1 LIMIT 1';
    const res = await db.query(sql, [id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    row.password = row.password_hash;
    return row;
  }
}

module.exports = UserModel;
