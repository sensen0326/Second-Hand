const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '123456',
  database: process.env.DB_NAME || 'campus_market',
};

const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
});

function parseImages(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [v];
      } catch {
        return [v];
      }
    }
    return [v];
  }
  return [];
}

const mapOrderRow = row => ({
  id: row.id,
  orderNo: row.order_no,
  goodsId: row.goods_old_id,
  buyerId: row.buyer_id,
  sellerId: row.seller_id,
  title: row.title,
  cover: row.cover,
  price: row.price,
  status: row.status,
  createdAt: row.created_at,
  completedAt: row.completed_at,
});

const mapGoodsRow = row => ({
  _id: row.old_id,
  id: row.cloud_item_id,
  openid: row.openid,
  title: row.title,
  description: row.description,
  category: row.category,
  price: row.price,
  newdegree: row.newdegree,
  status: row.status,
  hit: row.hit,
  showtime: row.showtime,
  tel: row.tel,
  username: row.username,
  avatorImg: row.avator_img,
  imageIds: parseImages(row.image_ids),
  videoUrl: row.video_url,
  time: row.time,
  reviewerId: row.reviewerId,
  reviewerName: row.reviewerName,
});

const app = express();
app.use(express.json({ limit: '2mb' }));
// Serve local images for mini-program access, e.g. http://localhost:3000/static/lunbotu/1.jpg
app.use('/static', express.static(path.join(__dirname, '../miniprogram/images')));

async function ensureSchema() {
  const conn = await pool.getConnection();
  try {
    await conn.query('CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci', [config.database]);
    await conn.query('USE ??', [config.database]);
    // optional columns on goods
    const [goodsCols] = await conn.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='goods'`,
      [config.database]
    );
    const colNames = goodsCols.map(c => c.COLUMN_NAME);
    if (!colNames.includes('reviewerId')) {
      await conn.query('ALTER TABLE goods ADD COLUMN reviewerId VARCHAR(64)');
    }
    if (!colNames.includes('reviewerName')) {
      await conn.query('ALTER TABLE goods ADD COLUMN reviewerName VARCHAR(64)');
    }
    if (!colNames.includes('video_url')) {
      await conn.query('ALTER TABLE goods ADD COLUMN video_url VARCHAR(255)');
    }
    // users.role column
    const [userCols] = await conn.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='users'`,
      [config.database]
    );
    const userColNames = userCols.map(c => c.COLUMN_NAME);
    if (!userColNames.includes('role')) {
      await conn.query("ALTER TABLE users ADD COLUMN role VARCHAR(32) DEFAULT 'user'");
    }
    // downs table
    await conn.query(
      `CREATE TABLE IF NOT EXISTS downs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        goods_old_id VARCHAR(32),
        owner_id VARCHAR(32),
        title VARCHAR(128),
        image_ids JSON,
        newdegree VARCHAR(32),
        showtime VARCHAR(64),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
    // orders table
    await conn.query(
      `CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_no VARCHAR(40),
        goods_old_id VARCHAR(32),
        buyer_id VARCHAR(32),
        seller_id VARCHAR(32),
        title VARCHAR(128),
        cover VARCHAR(255),
        price DECIMAL(10,2),
        status VARCHAR(32) DEFAULT 'created',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME NULL
      )`
    );
  } finally {
    conn.release();
  }
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Goods list
app.get('/api/goods', async (req, res) => {
  const { status, category, ownerId, q, page = 1, pageSize = 10, sortField, sortOrder } = req.query;
  const limit = Math.max(1, Math.min(Number(pageSize) || 10, 50));
  const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }
  if (category) {
    where += ' AND category = ?';
    params.push(category);
  }
  if (ownerId) {
    where += ' AND id = ?';
    params.push(ownerId);
  }
  if (q) {
    where += ' AND title LIKE ?';
    params.push(`%${q}%`);
  }
  let order = 'ORDER BY time DESC';
  const allowedSort = ['time', 'hit'];
  if (sortField && allowedSort.includes(sortField)) {
    const dir = (sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    order = `ORDER BY ${sortField} ${dir}`;
  }
  const [rows] = await pool.query(
    `SELECT * FROM goods ${where} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  res.json({ data: rows.map(mapGoodsRow) });
});

// Goods detail
app.get('/api/goods/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM goods WHERE old_id = ? LIMIT 1', [req.params.id]);
  if (!rows.length) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(mapGoodsRow(rows[0]));
});

// Create goods
app.post('/api/goods', async (req, res) => {
  const data = req.body || {};
  const oldId = data._id || genId();
  const imageIds = Array.isArray(data.imageIds) ? JSON.stringify(data.imageIds) : null;
  const time = data.time ? new Date(data.time) : new Date();
  await pool.query(
    `INSERT INTO goods (old_id, cloud_item_id, openid, title, description, category, price, newdegree, status, hit, showtime, tel, username, avator_img, image_ids, video_url, time)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      oldId,
      data.id || data.cloud_item_id || null,
      data._openid || data.openid || null,
      data.title || '',
      data.description || '',
      data.category || '',
      data.price ?? null,
      data.newdegree || '',
      data.status || 'pending',
      data.hit || 0,
      data.showtime || '',
      data.tel || '',
      data.username || '',
      data.avatorImg || data.avator_img || '',
      imageIds,
      data.videoUrl || data.video_url || null,
      time,
    ]
  );
  res.json({ _id: oldId });
});

// Update goods
app.put('/api/goods/:id', async (req, res) => {
  const data = req.body || {};
  const fields = [];
  const params = [];
  const inc = data.hitIncrement;
  if (data.title !== undefined) {
    fields.push('title = ?');
    params.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    params.push(data.description);
  }
  if (data.status !== undefined) {
    fields.push('status = ?');
    params.push(data.status);
  }
  if (data.category !== undefined) {
    fields.push('category = ?');
    params.push(data.category);
  }
  if (data.price !== undefined) {
    fields.push('price = ?');
    params.push(data.price);
  }
  if (data.newdegree !== undefined) {
    fields.push('newdegree = ?');
    params.push(data.newdegree);
  }
  if (data.showtime !== undefined) {
    fields.push('showtime = ?');
    params.push(data.showtime);
  }
  if (data.tel !== undefined) {
    fields.push('tel = ?');
    params.push(data.tel);
  }
  if (data.username !== undefined) {
    fields.push('username = ?');
    params.push(data.username);
  }
  if (data.avatorImg !== undefined) {
    fields.push('avator_img = ?');
    params.push(data.avatorImg);
  }
  if (data.imageIds !== undefined) {
    fields.push('image_ids = ?');
    params.push(Array.isArray(data.imageIds) ? JSON.stringify(data.imageIds) : null);
  }
  if (data.videoUrl !== undefined) {
    fields.push('video_url = ?');
    params.push(data.videoUrl);
  }
  if (data.reviewerId !== undefined) {
    fields.push('reviewerId = ?');
    params.push(data.reviewerId);
  }
  if (data.reviewerName !== undefined) {
    fields.push('reviewerName = ?');
    params.push(data.reviewerName);
  }
  if (inc) {
    fields.push('hit = hit + ?');
    params.push(Number(inc) || 1);
  }
  if (!fields.length) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }
  params.push(req.params.id);
  await pool.query(`UPDATE goods SET ${fields.join(', ')} WHERE old_id = ?`, params);
  res.json({ ok: true });
});

// Delete goods
app.delete('/api/goods/:id', async (req, res) => {
  await pool.query('DELETE FROM goods WHERE old_id = ?', [req.params.id]);
  res.json({ ok: true });
});

// Banners
app.get('/api/lunbotus', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM banners');
  res.json({ data: rows.map(r => ({ _id: r.old_id, fileID: r.file_id })) });
});

// Categories
app.get('/api/jiugongges', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY cloud_cat_id ASC');
  res.json({ data: rows.map(r => ({ _id: r.old_id, id: r.cloud_cat_id, name: r.name, fileID: r.file_id })) });
});

// Users
app.get('/api/users', async (req, res) => {
  const { tel, pwd } = req.query;
  const params = [];
  let where = 'WHERE 1=1';
  if (tel) {
    where += ' AND tel = ?';
    params.push(tel);
  }
  if (pwd) {
    where += ' AND pwd = ?';
    params.push(pwd);
  }
  const [rows] = await pool.query(`SELECT * FROM users ${where}`, params);
  res.json({ data: rows.map(mapUser) });
});

app.get('/api/users/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE old_id = ? LIMIT 1', [req.params.id]);
  if (!rows.length) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(mapUser(rows[0]));
});

app.post('/api/users/login', async (req, res) => {
  const { tel, pwd } = req.body || {};
  const [rows] = await pool.query('SELECT * FROM users WHERE tel = ? AND pwd = ? LIMIT 1', [tel, pwd]);
  if (!rows.length) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  res.json(mapUser(rows[0]));
});

app.post('/api/users/register', async (req, res) => {
  const data = req.body || {};
  const oldId = genId();
  await pool.query(
    'INSERT INTO users (old_id, openid, uname, tel, avator, signature, pwd, role) VALUES (?,?,?,?,?,?,?,?)',
    [
      oldId,
      data._openid || '',
      data.uname || '',
      data.tel || '',
      data.avator || '',
      data.signature || '',
      data.pwd || '',
      data.role || 'user',
    ]
  );
  res.json({ _id: oldId });
});

app.post('/api/users', async (req, res) => {
  const data = req.body || {};
  const oldId = genId();
  await pool.query(
    'INSERT INTO users (old_id, openid, uname, tel, avator, signature, pwd, role) VALUES (?,?,?,?,?,?,?,?)',
    [
      oldId,
      data._openid || '',
      data.uname || '',
      data.tel || '',
      data.avator || '',
      data.signature || '',
      data.pwd || '',
      data.role || 'user',
    ]
  );
  res.json({ _id: oldId });
});

app.put('/api/users/:id', async (req, res) => {
  const data = req.body || {};
  const fields = [];
  const params = [];
  if (data.uname !== undefined) {
    fields.push('uname = ?');
    params.push(data.uname);
  }
  if (data.signature !== undefined) {
    fields.push('signature = ?');
    params.push(data.signature);
  }
  if (data.tel !== undefined) {
    fields.push('tel = ?');
    params.push(data.tel);
  }
  if (data.avator !== undefined) {
    fields.push('avator = ?');
    params.push(data.avator);
  }
  if (data.pwd !== undefined) {
    fields.push('pwd = ?');
    params.push(data.pwd);
  }
  if (!fields.length) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }
  params.push(req.params.id);
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE old_id = ?`, params);
  res.json({ ok: true });
});

// Downs
app.get('/api/downs', async (req, res) => {
  const { ownerId } = req.query;
  const params = [];
  let where = 'WHERE 1=1';
  if (ownerId) {
    where += ' AND owner_id = ?';
    params.push(ownerId);
  }
  const [rows] = await pool.query(`SELECT * FROM downs ${where} ORDER BY created_at DESC`, params);
  res.json({
    data: rows.map(r => ({
      _id: String(r.id),
      goods_old_id: r.goods_old_id,
      id: r.owner_id,
      title: r.title,
      imageIds: parseImages(r.image_ids),
      newdegree: r.newdegree,
      showtime: r.showtime,
      created_at: r.created_at,
    })),
  });
});

app.post('/api/downs', async (req, res) => {
  const data = req.body || {};
  await pool.query(
    'INSERT INTO downs (goods_old_id, owner_id, title, image_ids, newdegree, showtime) VALUES (?,?,?,?,?,?)',
    [
      data.goods_old_id || data.goodsId || '',
      data.owner_id || data.id || '',
      data.title || '',
      Array.isArray(data.imageIds) ? JSON.stringify(data.imageIds) : null,
      data.newdegree || '',
      data.showtime || '',
    ]
  );
  res.json({ ok: true });
});

// Orders
app.get('/api/orders', async (req, res) => {
  const { buyerId, sellerId, status, goodsId } = req.query;
  const params = [];
  let where = 'WHERE 1=1';
  if (buyerId) {
    where += ' AND buyer_id = ?';
    params.push(buyerId);
  }
  if (sellerId) {
    where += ' AND seller_id = ?';
    params.push(sellerId);
  }
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }
  if (goodsId) {
    where += ' AND goods_old_id = ?';
    params.push(goodsId);
  }
  const [rows] = await pool.query(`SELECT * FROM orders ${where} ORDER BY created_at DESC`, params);
  res.json({ data: rows.map(mapOrderRow) });
});

app.post('/api/orders', async (req, res) => {
  const data = req.body || {};
  const orderNo = data.orderNo || 'O' + Date.now() + Math.floor(Math.random() * 1000);
  await pool.query(
    `INSERT INTO orders (order_no, goods_old_id, buyer_id, seller_id, title, cover, price, status)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      orderNo,
      data.goodsId || data.goods_old_id || '',
      data.buyerId || data.buyer_id || '',
      data.sellerId || data.seller_id || '',
      data.title || '',
      data.cover || '',
      data.price ?? 0,
      data.status || 'created',
    ]
  );
  res.json({ orderNo });
});

app.put('/api/orders/:id', async (req, res) => {
  const data = req.body || {};
  const fields = [];
  const params = [];
  if (data.status !== undefined) {
    fields.push('status = ?');
    params.push(data.status);
    if (data.status === 'completed') {
      fields.push('completed_at = NOW()');
    }
  }
  if (!fields.length) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }
  params.push(req.params.id);
  await pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, params);
  res.json({ ok: true });
});

function mapUser(row) {
  return {
    _id: row.old_id,
    _openid: row.openid,
    uname: row.uname,
    tel: row.tel,
    avator: row.avator,
    signature: row.signature,
    pwd: row.pwd,
    role: row.role || 'user',
  };
}

function genId() {
  return Math.random().toString(16).slice(2, 10) + Date.now().toString(16);
}

const port = process.env.PORT || 3000;

ensureSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`API server listening on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to init schema', err);
    process.exit(1);
  });
