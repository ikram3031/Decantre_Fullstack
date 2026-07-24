import mysql from "mysql2/promise";
import { env } from "../config/env.js";

let pool;

export async function connectMySQL() {
  if (pool) {
    return pool;
  }

  pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("Connected to MySQL");
  } catch (err) {
    console.warn("Could not connect to MySQL. Server will continue without MySQL connection:", err.message);
  }
  return pool;
}

export async function closeMySQL() {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = undefined;
}

export function getMySQLPool() {
  if (!pool) {
    throw new Error("MySQL pool has not been initialized");
  }

  return pool;
}
