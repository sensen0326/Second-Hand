// import.js
const fs = require('fs');
const readline = require('readline');
const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'yourpass',
    database: 'campus_market',
    multipleStatements: true
  });

  await conn.query('SET NAMES utf8mb4');

  // users
  await loadJsonLines('sql/database_export-AYQdfxAHa2k7.json', async row => {
    await conn.execute(
      'INSERT INTO users (old_id, openid, uname, tel, avator, signature, pwd) VALUES (?,?,?,?,?,?,?)',
      [row._id, row._openid, row.uname, row.tel, row.avator, row.signature, row.pwd]
    );
  });

  // goods
  await loadJsonLines('sql/database_export-9kq4sbnFN0zB.json', async row => {
    const time = row.time && row.time.$date ? new Date(row.time.$date) : null;
    await conn.execute(
      `INSERT INTO goods (old_id, cloud_item_id, openid, title, description, category, price, newdegree, status, hit, showtime, tel, username, avator_img, image_ids, time)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        row._id,
        row.id,
        row._openid,
        row.title,
        row.description,
        row.category,
        row.price ? Number(row.price) : null,
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
  await loadJsonLines('sql/database_export-bQS2_rb4npsG.json', async row => {
    await conn.execute(
      'INSERT INTO banners (old_id, file_id) VALUES (?,?)',
      [row._id, row.fileID]
    );
  });

  // categories
  await loadJsonLines('sql/database_export-VqjlsIp4ofo_.json', async row => {
    await conn.execute(
      'INSERT INTO categories (old_id, cloud_cat_id, name, file_id) VALUES (?,?,?,?)',
      [row._id, row.id, row.name, row.fileID]
    );
  });

  console.log('Import done');
  await conn.end();
}

async function loadJsonLines(path, handler) {
  const rl = readline.createInterface({
    input: fs.createReadStream(path, { encoding: 'utf8' }),
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
