import mysql from "mysql2/promise";

let pool = null;

/**
 * Get or create a MySQL connection pool.
 * Lambda reuses the pool across warm invocations.
 *
 * In AWS, credentials come from Secrets Manager (via env vars set by SAM).
 * In local dev, they come from .env or docker defaults.
 */
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      database: process.env.DB_NAME || "school_db",
      user: process.env.DB_USER || "school_user",
      password: process.env.DB_PASSWORD || "school_pass",
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
  }
  return pool;
}

/**
 * Execute a stored procedure and return the first result set.
 * @param {string} spName - Stored procedure name
 * @param {Array} params - Parameters for the SP
 * @returns {Array} Result rows
 */
export async function callProcedure(spName, params = []) {
  const pool = getPool();
  const placeholders = params.map(() => "?").join(", ");
  const sql = `CALL ${spName}(${placeholders})`;
  const [results] = await pool.execute(sql, params);
  // MySQL stored procedures return results as nested arrays
  // The actual data is in results[0]
  return Array.isArray(results[0]) ? results[0] : results;
}
