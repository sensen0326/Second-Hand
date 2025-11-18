// One-off script to set admin role for a specific tel.
const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'campus_market',
  });
  const tel = process.env.ADMIN_TEL || '17603343390';
  const [r] = await conn.execute("UPDATE users SET role='admin' WHERE tel=?", [tel]);
  console.log('updated rows', r.affectedRows, 'for tel', tel);
  await conn.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
