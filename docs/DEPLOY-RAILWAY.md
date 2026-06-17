# Railway 部署指南

无需购买云服务器 ECS，在 Railway 上托管 **MySQL + 后端 + 前端** 三个 Service。

> **踩坑速查：** 登录报 `sys_user doesn't exist`、`railway up` 构建失败、变量配错等，见 [DEPLOY-PITFALLS.md](./DEPLOY-PITFALLS.md)。

## 架构

```
用户浏览器
    ↓
前端 Service（Nginx 静态页，dist）
    ↓  HTTPS  /api
后端 Service（Node.js Express，server/）
    ↓
MySQL Service（Railway 插件）
```

## 前置准备

1. [Railway 账号](https://railway.app/)（GitHub 登录）
2. 代码推送到 **GitHub** 仓库
3. 本地安装 Railway CLI（可选，用于初始化数据库）：
   ```bash
   npm i -g @railway/cli
   railway login
   ```

---

## 第一步：创建项目并添加 MySQL

1. Railway Dashboard → **New Project**
2. **Add Plugin** → 搜索 **MySQL** → 添加
3. 进入 MySQL Service → **Variables**，记下：
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

---

## 第二步：部署后端（API）

1. 同一 Project 内 → **New Service** → **GitHub Repo** → 选择本仓库
2. 进入该 Service → **Settings**：
   - **Root Directory**：`server`
   - **Builder**：Dockerfile（使用 `server/Dockerfile`）或 Nixpacks 均可
3. **Variables** 添加：

   | 变量 | 值 |
   |------|-----|
   | `PORT` | `8080`（Railway 也可能自动注入，保留即可） |
   | `API_PREFIX` | `/api` |
   | `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
   | `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
   | `DB_USER` | `${{MySQL.MYSQLUSER}}` |
   | `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
   | `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |
   | `DB_SSL` | `true` |

   > `${{MySQL.xxx}}` 中 `MySQL` 为你的 MySQL Service 名称，若不同请在 Railway 变量引用面板中选择。

4. **Settings → Networking → Generate Domain**，得到后端公网地址，例如：
   ```
   https://my-vue-app-api-production.up.railway.app
   ```
5. 验证健康检查：
   ```
   https://你的后端域名/health
   ```
   应返回 `{"status":"ok"}`

### 初始化数据库（只需执行一次）

**方式 A：部署后端自动建表（推荐）**

本仓库后端启动时会检测 `sys_user` 是否存在，不存在则自动执行初始化（见 `server/src/db/initSchema.js`）。  
推送代码并部署成功后，在 **my-vue-app** Deploy Logs 中确认出现 `[DB] 默认管理员已导入 → admin / 123456`。

**方式 B：MySQL 公网 + 本机执行**

MySQL → **Public Network** 开启，复制 `MYSQL_PUBLIC_URL`：

```powershell
cd server
$env:DATABASE_URL = "粘贴 MYSQL_PUBLIC_URL"
$env:DB_SSL = "true"
Remove-Item Env:DB_HOST, Env:DB_USER, Env:DB_PASSWORD, Env:DB_NAME -ErrorAction SilentlyContinue
npm run db:init
```

**方式 C：`railway ssh` 进后端容器**

```bash
cd server && railway link   # 选择后端 Service
railway ssh
npm run db:init
```

> ⚠️ **`railway run npm run db:init` 在本机通常会失败**（无法解析 `mysql.railway.internal`）。详见 [DEPLOY-PITFALLS.md](./DEPLOY-PITFALLS.md)。

默认账号：`admin / 123456`

---

## 第三步：部署前端（静态站点）

1. 同一 Project → **New Service** → 再次选择**同一 GitHub 仓库**
2. **Settings**：
   - **Root Directory**：留空（仓库根目录）
   - **Builder**：Dockerfile（使用根目录 `Dockerfile`）
3. **Variables** 添加构建参数：

   | 变量 | 值 |
   |------|-----|
   | `VITE_API_BASE_URL` | `https://你的后端域名/api` |

   Railway Docker 构建需将该变量作为 build arg。若构建未生效，可在 **Settings → Build** 中添加：
   ```
   VITE_API_BASE_URL=https://你的后端域名/api
   ```

4. **Networking → Generate Domain**，得到前端访问地址，例如：
   ```
   https://my-vue-app-web-production.up.railway.app
   ```

5. 浏览器打开前端域名，使用 `admin / 123456` 登录。

---

## 环境变量速查

### 后端 `server/`

见 `server/.env.railway.example`

### 前端构建

见 `.env.production.example`

生产环境**不要**开启 `VITE_USE_MOCK`。

---

## 常见问题

完整易错清单见 **[DEPLOY-PITFALLS.md](./DEPLOY-PITFALLS.md)**。

### 1. 登录报 `Table 'railway.sys_user' doesn't exist`

- MySQL 部署成功 ≠ 业务表已创建，需 `db:init` 或后端自动建表
- 检查 **my-vue-app** Deploy Logs，不是 MySQL Deployments 页

### 2. 后端启动报 MySQL 连接失败

- 检查 `DB_*` 变量是否引用正确（`DB_USER` 不能误填成端口号 `3306`）
- 确认 `DB_SSL=true`
- 确认已执行 `db:init` 或自动初始化日志已成功

### 3. 前端能打开但接口 404 / CORS

- 确认 `VITE_API_BASE_URL` 指向后端公网域名 + `/api`
- 重新触发前端 **Redeploy**（构建参数变更需重新构建）
- 后端已启用 `cors()`，跨域一般无问题

### 4. 刷新页面 404

- 前端必须使用本仓库 `deploy/nginx.conf`（SPA `try_files`），不要直接用静态文件服务省略 fallback

### 5. `railway up` 构建失败

- 后端 Root Directory = `server` 时，必须在**仓库根目录**执行 `railway up`，不要在 `server/` 内执行
- 更推荐 `git push` 走 GitHub 自动部署

### 6. 修改代码后如何更新

- Push 到 GitHub → Railway 自动重新部署
- 若只改前端 API 地址：修改变量后在前端 Service 手动 **Redeploy**

### 7. 费用

- Railway 每月有免费额度（约 $5 credit），轻量后台通常够用
- 超出后按用量计费，可在 Dashboard 设置 **Usage Limit**

---

## 本地模拟生产构建（可选）

```bash
# 1. 构建前端（替换为你的后端地址）
set VITE_API_BASE_URL=https://你的后端域名/api
set VITE_USE_MOCK=false
npm run build

# 2. 预览
npm run preview
```

---

## 一键检查清单

- [ ] MySQL 插件已添加
- [ ] 后端 Service Root Directory = `server`
- [ ] 后端 DB 环境变量已配置
- [ ] 后端 `/health` 可访问
- [ ] 已执行 `db:init`
- [ ] 前端 `VITE_API_BASE_URL` 已指向后端
- [ ] 前端域名可访问且登录成功
