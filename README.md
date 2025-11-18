# 高校二手商品交易平台（微信小程序 + Node/Express + MySQL）

面向校园场景的二手物品交易小程序。提供商品发布、浏览、搜索、下单、订单管理、用户中心等能力，并配套 Node/Express + MySQL 接口服务。

## 功能特点
- 商品：发布/编辑/删除、图片或视频上传、上架下架、浏览量统计、分类与关键词搜索、按时间/热度排序。
- 订单：买家/卖家订单查询，创建订单，状态更新（created → completed）。
- 用户：注册、登录、个人资料与联系方式维护，角色字段支持（user/admin）。
- 运营位与记录：轮播图、九宫格接口；下架记录（downs）留存。
- 健康检查与静态资源：`/api/health` 健康检查；`/static` 暴露本地图片等资源供小程序访问。

## 技术栈
- 小程序：微信小程序（目录 `miniprogram/`）
- 后端：Node.js + Express（文件 `server/index.js`）
- 数据库：MySQL（默认库名 `campus_market`，自动建库建表与补字段）

## 目录结构
```
├─miniprogram/           # 小程序页面与资源
├─server/index.js        # Express API 服务与建表逻辑
├─cloudfunctions/        # 云函数（如需要可在小程序端调用）
├─i18n/                  # 语言资源
├─sql/                   # SQL 相关脚本/文件
├─package.json           # 依赖与 npm 脚本
└─project*.json          # 小程序项目配置
```

## 环境要求
- Node.js（建议 ≥ 16）
- MySQL（默认账号 `root/123456`，库名 `campus_market`，可通过环境变量覆盖）
- 微信开发者工具（导入 `miniprogram` 目录进行调试）

## 快速开始
1) 安装依赖  
```bash
npm install
```
2) 启动 MySQL，确保账号/密码可用。首次启动会自动创建数据库及表（goods、users、downs、orders）并补齐必要字段。  
3) 启动后端服务（默认端口 3000）  
```bash
npm run start
# API:     http://localhost:3000/api
# 静态资源: http://localhost:3000/static/...
```
4) 小程序端调试  
   - 使用微信开发者工具导入 `miniprogram` 目录（使用项目内 `project.config.json`）。  
   - 确保接口可从小程序访问（本地需要开启“开发环境不校验合法域名”或使用内网穿透/云端环境）。  
   - 如需修改接口地址，可在开发者工具控制台执行：  
```js
wx.setStorageSync('API_BASE', 'http://你的域名或IP:端口/api');
```
   头像/商品示例静态资源：`http://<host>:3000/static/...`。

### 可用环境变量
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=123456
DB_NAME=campus_market
PORT=3000
```

## 主要 API 速览
- 商品：`GET /api/goods`（支持状态/分类/关键词/排序/分页）、`GET /api/goods/:id`、`POST /api/goods`、`PUT /api/goods/:id`、`DELETE /api/goods/:id`
- 用户：`POST /api/users/login`、`POST /api/users/register`、`GET /api/users`、`GET /api/users/:id`、`POST /api/users`、`PUT /api/users/:id`
- 订单：`GET /api/orders`、`POST /api/orders`、`PUT /api/orders/:id`
- 下架记录：`GET /api/downs`、`POST /api/downs`
- 运营配置：`GET /api/lunbotus`、`GET /api/jiugongges`
- 健康检查：`GET /api/health`

## 部署与运维建议
- 后端可使用 pm2/Docker 部署，确保 MySQL 与静态资源访问路径正确；生产环境修改默认数据库凭据。
- 在微信小程序后台配置合法域名（request、download、upload），与实际接口域名保持一致。
- 建议将图片/视频迁移到对象存储或 CDN，再在商品数据中写入对应 URL。

## 其他
- 静态文件由 `/static` 暴露（来自 `miniprogram/images`）。若迁移到 CDN，可在前端对应字段直接写入完整 URL。
- 若需要代理访问 GitHub/npm，可配置 `http.proxy` 等（例如 `git config --global http.proxy http://127.0.0.1:7897`）。
