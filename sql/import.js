// import.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'campus_market',
  multipleStatements: true
};

async function ensureDatabaseAndTables() {
  // Create database if it doesn't exist
  const { database, ...baseConfig } = config;
  const baseConn = await mysql.createConnection(baseConfig);
  await baseConn.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await baseConn.end();

  // Create tables from schema file
  const conn = await mysql.createConnection(config);
  const schemaSql = fs.readFileSync(path.join(__dirname, 'create_table.sql'), 'utf8');
  await conn.query(schemaSql);
  await conn.query('SET NAMES utf8mb4');
  return conn;
}

async function main() {
  const conn = await ensureDatabaseAndTables();

  // users
  await loadJsonLines(path.join(__dirname, 'database_export-AYQdfxAHa2k7.json'), async row => {
    await conn.execute(
      `INSERT INTO users (old_id, openid, uname, tel, avator, signature, pwd)
       VALUES (?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE openid=VALUES(openid), uname=VALUES(uname), tel=VALUES(tel),
                               avator=VALUES(avator), signature=VALUES(signature), pwd=VALUES(pwd)`,
      [row._id, row._openid, row.uname, row.tel, row.avator, row.signature, row.pwd]
    );
  });

  // goods
  await loadJsonLines(path.join(__dirname, 'database_export-9kq4sbnFN0zB.json'), async row => {
    const time = row.time && row.time.$date ? new Date(row.time.$date) : null;
    const price = row.price && row.price !== '' ? Number(row.price) : null;
    await conn.execute(
      `INSERT INTO goods (old_id, cloud_item_id, openid, title, description, category, price, newdegree, status, hit, showtime, tel, username, avator_img, image_ids, time)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE cloud_item_id=VALUES(cloud_item_id), openid=VALUES(openid),
                               title=VALUES(title), description=VALUES(description), category=VALUES(category),
                               price=VALUES(price), newdegree=VALUES(newdegree), status=VALUES(status),
                               hit=VALUES(hit), showtime=VALUES(showtime), tel=VALUES(tel),
                               username=VALUES(username), avator_img=VALUES(avator_img),
                               image_ids=VALUES(image_ids), time=VALUES(time)`,
      [
        row._id,
        row.id,
        row._openid,
        row.title,
        row.description,
        row.category,
        price,
        row.newdegree,
        row.status,
        row.hit || 0,
        row.showtime,
        row.tel,
        row.username,
        row.avatorImg,
        row.imageIds ? JSON.stringify(row.imageIds) : null,
        time ? time.toISOString().slice(0, 19).replace('T', ' ') : null
      ]
    );
  });

  // banners
  await loadJsonLines(path.join(__dirname, 'database_export-bQS2_rb4npsG.json'), async row => {
    await conn.execute(
      `INSERT INTO banners (old_id, file_id)
       VALUES (?,?)
       ON DUPLICATE KEY UPDATE file_id=VALUES(file_id)`,
      [row._id, row.fileID]
    );
  });

  // categories
  await loadJsonLines(path.join(__dirname, 'database_export-VqjlsIp4ofo_.json'), async row => {
    await conn.execute(
      `INSERT INTO categories (old_id, cloud_cat_id, name, file_id)
       VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE cloud_cat_id=VALUES(cloud_cat_id), name=VALUES(name), file_id=VALUES(file_id)`,
      [row._id, row.id, row.name, row.fileID]
    );
  });

  console.log('Import done');
  await conn.end();
}

async function loadJsonLines(filePath, handler) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity
  });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const row = JSON.parse(line);
    await handler(row);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
