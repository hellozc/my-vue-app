# 发布部署指南

本文档说明如何将 **通用后台管理系统** 发布到线上环境。

> 推荐平台：[Railway](https://railway.app/)（无需购买云服务器 ECS，按量计费，有免费额度）  
> Railway 详细图文步骤见：[docs/DEPLOY-RAILWAY.md](./docs/DEPLOY-RAILWAY.md)  
> **部署踩坑速查：** [docs/DEPLOY-PITFALLS.md](./docs/DEPLOY-PITFALLS.md)

---

## 一、发布架构

```
┌─────────────┐     HTTPS      ┌──────────────────┐
│   浏览器     │ ──────────────▶│  前端（静态站点）  │
└─────────────┘                │  Vue dist + Nginx │
                               └────────┬─────────┘
                                        │ /api
                                        ▼
                               ┌──────────────────┐
                               │  后端（Node.js）   │
                               │  server/ Express │
                               └────────┬─────────┘
                                        │
                                        ▼
                               ┌──────────────────┐
                               │  MySQL 数据库     │
                               └──────────────────┘
```

| 组件 | 目录 | 说明 |
|------|------|------|
| 前端 | 仓库根目录 | `npm run build` → `dist/`，由 Nginx 托管 |
| 后端 | `server/` | Express API，前缀 `/api` |
| 数据库 | — | MySQL 8.x，表结构见 `server/sql/init.sql` |

---

## 二、发布前准备

### 环境要求

- Node.js >= 18
- Git + GitHub 账号（Railway 从 GitHub 拉代码）
- Railway 账号

### 代码推送

```bash
git add .
git commit -m "prepare for release"
git push origin main
```

### 本地验证生产构建（建议）

**Windows PowerShell：**

```powershell
$env:VITE_USE_MOCK="false"
$env:VITE_API_BASE_URL="http://localhost:8081/api"
npm run build
npm run preview
```

**macOS / Linux：**

```bash
VITE_USE_MOCK=false VITE_API_BASE_URL=http://localhost:8081/api npm run build
npm run preview
```

本地需同时启动后端（`npm run server:dev`）且已初始化数据库（`npm run server:db:init`）。

---

## 三、Railway 一键发布（推荐）

在 Railway 同一 Project 中创建 **3 个 Service**：

| 顺序 | Service | Root Directory | 说明 |
|------|---------|----------------|------|
| 1 | MySQL | — | Add Plugin → MySQL |
| 2 | 后端 API | `server` | Node + Express |
| 3 | 前端 Web | `/`（留空） | Docker 构建 dist + Nginx |

### 3.1 MySQL

1. Railway → **New Project** → **Add Plugin** → **MySQL**
2. 记录 Variables 中的 `MYSQLHOST`、`MYSQLPORT`、`MYSQLUSER`、`MYSQLPASSWORD`、`MYSQLDATABASE`

### 3.2 后端 Service

**Settings**

- Root Directory：`server`
- Builder：Dockerfile（`server/Dockerfile`）

**Variables**

| 变量 | 值 |
|------|-----|
| `API_PREFIX` | `/api` |
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
| `DB_USER` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |
| `DB_SSL` | `true` |

> `${{MySQL.xxx}}` 中的 `MySQL` 需与 MySQL Service 名称一致，可在 Railway 变量引用面板中选择。

**Networking** → **Generate Domain**，得到后端地址，例如：

```
https://my-vue-app-api-production.up.railway.app
```

**健康检查：**

```
GET https://你的后端域名/health
→ {"status":"ok"}
```

**初始化数据库（仅首次）：**

详见 [docs/DEPLOY-PITFALLS.md §三](./docs/DEPLOY-PITFALLS.md#三数据库未初始化)。推荐方式：

1. 推送含自动建表逻辑的后端代码，部署后在 Deploy Logs 确认 `[DB] 默认管理员已导入`
2. 或 MySQL 开公网，本机 `npm run server:db:init`
3. 或 `railway ssh` 进后端容器执行 `npm run db:init`

> ⚠️ 勿在本机使用 `railway run npm run db:init`（内网地址不可达）。

### 3.3 前端 Service

**Settings**

- Root Directory：留空（仓库根目录）
- Builder：Dockerfile（根目录 `Dockerfile`）

**Variables**

| 变量 | 值 |
|------|-----|
| `VITE_API_BASE_URL` | `https://你的后端域名/api` |

**Networking** → **Generate Domain**，得到前端访问地址。

**登录验证：** 打开前端域名，使用默认账号 `admin / 123456` 登录。

---

## 四、环境变量说明

### 前端（构建时注入）

复制 `.env.production.example` 为参考：

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://你的后端域名/api
VITE_API_TIMEOUT=10000
VITE_API_SUCCESS_CODE=200
```

| 变量 | 说明 |
|------|------|
| `VITE_USE_MOCK` | 生产环境必须为 `false` |
| `VITE_API_BASE_URL` | 后端 API 完整前缀，需含 `/api` |

### 后端（运行时）

复制 `server/.env.railway.example` 为参考：

| 变量 | 说明 |
|------|------|
| `PORT` | 监听端口，Railway 通常自动注入 |
| `API_PREFIX` | 默认 `/api` |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL 连接 |
| `DB_SSL` | Railway MySQL 设为 `true` |
| `DATABASE_URL` | 可选，完整连接串（与 `DB_*` 二选一） |

---

## 五、发布相关文件

| 文件 | 用途 |
|------|------|
| `Dockerfile` | 前端：构建 Vue + Nginx 托管 |
| `server/Dockerfile` | 后端：Node 生产镜像 |
| `deploy/nginx.conf` | SPA 路由 fallback（刷新不 404） |
| `railway.toml` | 前端 Railway 构建配置 |
| `server/railway.toml` | 后端 Railway 构建配置 |
| `.env.production.example` | 前端生产环境变量模板 |
| `server/.env.railway.example` | 后端 Railway 环境变量模板 |
| `docs/DEPLOY-RAILWAY.md` | Railway 详细步骤 |
| `docs/DEPLOY-PITFALLS.md` | Railway 部署易错清单（排错优先看） |

---

## 六、发布后检查清单

- [ ] MySQL 插件已创建
- [ ] 后端 Root Directory = `server`
- [ ] 后端 DB 环境变量已配置，`DB_SSL=true`
- [ ] `GET /health` 返回 ok
- [ ] 数据库已初始化（Deploy Logs 有 `[DB] 初始化完成` 或手动 `db:init` 成功）
- [ ] 前端 `VITE_API_BASE_URL` 指向后端公网地址
- [ ] 前端域名可访问，登录成功
- [ ] 侧边栏菜单、员工管理、角色管理功能正常
- [ ] **已修改默认管理员密码**（见下方安全说明）

---

## 七、更新与重新发布

| 变更类型 | 操作 |
|----------|------|
| 代码更新 | Push 到 GitHub → Railway 自动重新部署 |
| 仅改后端环境变量 | 后端 Service → Redeploy |
| 仅改前端 API 地址 | 修改 `VITE_API_BASE_URL` → 前端 Service **Redeploy**（需重新构建） |
| 数据库结构变更 | 重新部署后端（自动补全）或见 [DEPLOY-PITFALLS.md](./docs/DEPLOY-PITFALLS.md) 手动 `db:init` |

---

## 八、常见问题

> 完整易错清单（含 `sys_user` 不存在、`railway up` 失败、变量配错等）：**[docs/DEPLOY-PITFALLS.md](./docs/DEPLOY-PITFALLS.md)**

### 登录报 `Table 'railway.sys_user' doesn't exist`

MySQL 插件只提供空库，不会自动建表。见 [DEPLOY-PITFALLS.md §三](./docs/DEPLOY-PITFALLS.md#三数据库未初始化)。

### 后端启动失败：MySQL 连接错误

1. 检查 `DB_*` 变量是否引用 MySQL 插件
2. 确认 `DB_SSL=true`
3. 确认已执行数据库初始化

### 前端能打开，接口 404 或网络错误

1. 确认 `VITE_API_BASE_URL` 格式：`https://域名/api`（不要漏 `/api`）
2. 修改后必须 **Redeploy 前端**（重新 Docker 构建）
3. 浏览器 F12 → Network 查看实际请求地址

### 刷新页面 404

前端必须使用本仓库 `deploy/nginx.conf`（`try_files` 回退到 `index.html`），不要省略 SPA 配置。

### 登录后菜单为空

1. 确认数据库已初始化（含菜单、角色、权限数据）
2. 确认 admin 用户 `role_id = 1`（超级管理员）

### Railway 费用

- 每月约 **$5 免费额度**
- Dashboard → **Usage** 可设置上限，避免超额

---

## 九、安全建议（上线必做）

1. **立即修改**默认密码 `admin / 123456`（登录后 → 修改密码）
2. 不要将 `server/.env` 提交到 Git
3. 生产环境关闭 Mock（`VITE_USE_MOCK=false`）
4. MySQL 初始化完成后，关闭 MySQL 公网访问（仅 Railway 内网通信）
5. 定期备份 Railway MySQL 数据

---

## 十、其他部署方式（简述）

| 方式 | 说明 |
|------|------|
| **Railway**（本文推荐） | 零运维，适合个人/小团队 |
| **Vercel 前端 + Railway 后端** | 前端 CDN 加速更好，需配 CORS |
| **自建 ECS + Nginx** | 完全自控，需自行维护服务器 |
| **纯静态托管** | 仅 `dist/`，**无法**运行 Node/MySQL，完整功能不可用 |

---

## 快速命令参考

```bash
# 安装依赖
npm install
npm run server:install

# 本地开发
npm run dev              # Mock 模式
npm run dev:api          # 联调模式
npm run server:dev       # 启动后端

# 数据库
npm run server:db:init   # 初始化表 + 种子数据

# 生产构建
npm run build            # 输出 dist/

# Railway 远程初始化 DB（勿用 railway run，见 DEPLOY-PITFALLS.md）
# git push 部署后端自动建表，或 railway ssh 后 npm run db:init
```

---

如有问题，请先查阅 **[docs/DEPLOY-PITFALLS.md](./docs/DEPLOY-PITFALLS.md)**（易错清单），再看 [docs/DEPLOY-RAILWAY.md](./docs/DEPLOY-RAILWAY.md) 步骤说明。
