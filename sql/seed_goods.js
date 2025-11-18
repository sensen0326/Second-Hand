// Quick seeder for goods table with sample network images
const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'campus_market',
  });

  const seeds = Array.from({ length: 10 }).map((_, i) => {
    const id = genId();
    const price = (Math.random() * 300 + 20).toFixed(2);
    const now = new Date();
    const showtime = now.toISOString().slice(0, 19).replace('T', ' ');
    const category = ['电子设备', '书籍资料', '生活用品', '学习用品'][i % 4];
    const imgs = [
      `https://picsum.photos/seed/goods${i}a/600/400`,
      `https://picsum.photos/seed/goods${i}b/600/400`,
    ];
    return [
      id,              // old_id
      `item-${i}`,     // cloud_item_id
      '',              // openid
      `示例商品${i + 1}`,
      `这是示例商品 ${i + 1} 的描述，类别为 ${category}`,
      category,
      price,
      '9成新',
      'approved',
      Math.floor(Math.random() * 50),
      showtime,
      '13800000000',
      `卖家${i + 1}`,
      'https://picsum.photos/seed/avatar${i}/200/200',
      JSON.stringify(imgs),
      now,
      null,
      null,
    ];
  });

  await conn.query(
    `INSERT INTO goods
    (old_id, cloud_item_id, openid, title, description, category, price, newdegree, status, hit, showtime, tel, username, avator_img, image_ids, time, reviewerId, reviewerName)
    VALUES ?`,
    [seeds]
  );
  console.log('Inserted sample goods:', seeds.length);
  await conn.end();
}

function genId() {
  return Math.random().toString(16).slice(2, 10) + Date.now().toString(16);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
