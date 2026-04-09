import mysql from "mysql2/promise";

function requireEnv(name, { allowEmpty = false } = {}) {
  const value = process.env[name];
  if (value === undefined || value === null || (!allowEmpty && value === "")) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const globalState = globalThis.__infixmartMysqlPool ||
  (globalThis.__infixmartMysqlPool = { pool: null });

export function getMysqlPool() {
  if (!globalState.pool) {
    globalState.pool = mysql.createPool({
      host: requireEnv("DB_HOST"),
      port: Number(process.env.DB_PORT || 3306),
      database: requireEnv("DB_NAME"),
      user: requireEnv("DB_USER"),
      password: requireEnv("DB_PASSWORD", { allowEmpty: true }),
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
      queueLimit: 0,
      namedPlaceholders: true,
      charset: "utf8mb4",
    });
  }

  return globalState.pool;
}

export async function query(sql, params = {}) {
  const [rows] = await getMysqlPool().query(sql, params);
  return rows;
}

export async function execute(sql, params = {}) {
  const [result] = await getMysqlPool().execute(sql, params);
  return result;
}

export async function withTransaction(callback) {
  const connection = await getMysqlPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
