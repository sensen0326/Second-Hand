CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  old_id VARCHAR(32) NOT NULL,      -- 云开发 _id
  openid VARCHAR(64),
  uname VARCHAR(64),
  tel VARCHAR(32),
  avator VARCHAR(255),
  signature VARCHAR(255),
  pwd VARCHAR(255),
  role VARCHAR(32) DEFAULT 'user',
  UNIQUE KEY uk_users_old_id (old_id)
);

CREATE TABLE goods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  old_id VARCHAR(32) NOT NULL,      -- 云开发 _id
  cloud_item_id VARCHAR(32),        -- data里的 id 字段
  openid VARCHAR(64),
  title VARCHAR(128),
  description TEXT,
  category VARCHAR(64),
  price DECIMAL(10,2),
  newdegree VARCHAR(32),
  status VARCHAR(32),
  hit INT,
  showtime VARCHAR(64),
  tel VARCHAR(32),
  username VARCHAR(64),
  avator_img VARCHAR(255),
  image_ids JSON,
  video_url VARCHAR(255),
  time DATETIME,
  reviewerId VARCHAR(64),
  reviewerName VARCHAR(64),
  UNIQUE KEY uk_goods_old_id (old_id)
);

CREATE TABLE banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  old_id VARCHAR(32) NOT NULL,
  file_id VARCHAR(255),
  UNIQUE KEY uk_banners_old_id (old_id)
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  old_id VARCHAR(32) NOT NULL,
  cloud_cat_id INT,
  name VARCHAR(64),
  file_id VARCHAR(255),
  UNIQUE KEY uk_categories_old_id (old_id)
);

-- 已下架商品记录
CREATE TABLE IF NOT EXISTS downs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  goods_old_id VARCHAR(32),
  owner_id VARCHAR(32),
  title VARCHAR(128),
  image_ids JSON,
  newdegree VARCHAR(32),
  showtime VARCHAR(64),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 订单记录（无支付，仅撮合）
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(40),
  goods_old_id VARCHAR(32),
  buyer_id VARCHAR(32),
  seller_id VARCHAR(32),
  title VARCHAR(128),
  cover VARCHAR(255),
  price DECIMAL(10,2),
  status VARCHAR(32) DEFAULT 'created', -- created/completed/cancelled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL
);
