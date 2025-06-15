const pg = require("pg");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased for scale-to-zero
});

pool.on("error", (err) => {
  console.error("Database pool error:", err.stack);
});

module.exports = pool;
