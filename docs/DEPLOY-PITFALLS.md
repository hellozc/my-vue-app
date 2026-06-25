# Railway 部署易错清单

本文档汇总 **本仓库在 Railway 上部署时的高频踩坑**，按「现象 → 原因 → 处理」组织。  
配合阅读：[DEPLOY-RAILWAY.md](./DEPLOY-RAILWAY.md)（步骤指南）、[DEPLOY.md](../DEPLOY.md)（总览）。

---

## 一、30 秒定位：看哪个 Service？

| 你看到的症状 | 先打开哪个 Service | 看哪个 Tab |
|-------------|-------------------|-----------|
| 登录报 `Table 'railway.sys_user' doesn't exist` | **my-vue-app**（后端） | Deploy Logs |
| 后端 `/health` 正常但登录失败 | **my-vue-app**（后端） | Deploy Logs / Variables |
| 页面打不开 / Application failed to respond | **my-vue-app-web**（前端） | Deploy Logs |
| 接口 404 / 连错地址 | **my-vue-app-web**（前端） | Variables |
| MySQL 连不上 | **my-vue-app**（后端） | Variables |
| 想确认有没有表 | **MySQL** | Database / Console |

> **易错点：** MySQL → **Deployments** 显示 `Deployment successful` 只代表数据库**容器在跑**，不代表业务表已创建。空库也会显示成功。

---

## 二、症状速查表

| 现象 | 常见原因 | 处理 |
|------|---------|------|
| `Table 'railway.sys_user' doesn't exist` | 未初始化表结构 | 见 [§3](#三数据库未初始化) |
| `railway up` 构建 7 秒失败 `Build image` | 在 `server/` 目录执行 CLI | 见 [§4](#四railway-up-构建失败) |
| 改了代码仍报旧错 | 未 `git push`，线上仍是旧版本 | 提交并推送，等 GitHub 自动部署 |
| `railway run npm run db:init` 连不上库 | 本地无法解析 `mysql.railway.internal` | 见 [§3](#三数据库未初始化) |
| `railway ssh` 提示 No SSH keys | 本机未配置 SSH 公钥 | 见 [§3](#三数据库未初始化) |
| `DB_USER` 实际是 `3306` | Variables 引用写错 | 见 [§5](#五后端-db_-变量配错) |
| 访问后端域名打开 `/home` 404 | 后端只有 `/api`，没有前端页面 | 访问**前端**域名 |
| 前端能开，接口失败 | `VITE_API_BASE_URL` 错误或仍是占位符 | 见 [§6](#六前端-api-地址) |
| 前端 Application failed to respond | Nginx 端口与 Railway 不一致 | 根目录 `Dockerfile` + `deploy/nginx.conf` 监听 **8080** |

---

## 三、数据库未初始化

### 现象

登录或调 `/api/auth/login` 返回：

```text
Table 'railway.sys_user' doesn't exist
```

### 原因

- Railway MySQL 插件默认只有空库 **`railway`**，**不会**自动创建 `sys_user`、`sys_menu` 等表。
- 必须执行一次 `npm run db:init`，或部署带 **启动时自动建表** 的后端代码（见 `server/src/db/initSchema.js`）。
- **注意：** 后续版本新增的表（如 `app_member`、`app_auth_config`）在 **`ensureSchemaPatches`** 里补全，不在 `sql/init.sql`。`db:init` 与后端启动都会跑这段补丁；若只跑过旧版 `db:init` 或 `railway run` 连错库，会表现为「老表有、新表没有」。

### 易错认知

| 误解 | 事实 |
|------|------|
| MySQL 部署成功 = 表已建好 | 错。插件只提供空实例 |
| 库名 `railway` 不对 | 对。这是 Railway 默认库名 |
| 去 MySQL Deployments 改配置 | 错。应查**后端** Variables 与 Deploy Logs |

### 处理方式（任选其一）

#### 方式 A：重新部署后端（推荐，需代码已包含自动建表）

1. 确认本地改动已推送 GitHub（含 `server/src/db/initSchema.js`）。
2. 等待 **my-vue-app** 后端 Deploy 成功。
3. 在 Deploy Logs 中应看到：

   ```text
   [DB] 检测到数据库未初始化，开始建表并导入种子数据...
   [DB] 默认管理员已导入 → admin / 123456
   ```

4. 使用 **`admin / 123456`** 登录。

> 若不想启动时自动建表，可在后端 Variables 设置 `DB_AUTO_INIT=false`（默认开启）。

#### 方式 B：MySQL 公网 + 本机初始化

1. MySQL Service → **Settings → Networking** → 开启 **Public Network**。
2. 复制 **MYSQL_PUBLIC_URL**。
3. PowerShell（在 `server` 目录）：

   ```powershell
   $env:DATABASE_URL = "粘贴 MYSQL_PUBLIC_URL"
   $env:DB_SSL = "true"
   Remove-Item Env:DB_HOST, Env:DB_USER, Env:DB_PASSWORD, Env:DB_NAME -ErrorAction SilentlyContinue
   npm run db:init
   ```

4. 可选：关闭 MySQL 公网。
5. 默认账号：**`admin / 123456`**

#### 方式 C：`railway ssh` 进容器执行（需本机 SSH 密钥）

```powershell
# 若提示 No SSH keys，先执行：ssh-keygen -t ed25519
cd D:\web\my-vue-app\server
railway link    # 选择 my-vue-app 后端，不是 my-vue-app-web
railway ssh
npm run db:init
exit
```

#### ❌ 通常无效的方式

```powershell
cd server
railway run npm run db:init
```

**原因：** `railway run` 在**你本机**注入环境变量，主机名 `mysql.railway.internal` 只在 Railway 内网可解析，本地会 `ECONNREFUSED`。

### 验证表是否已创建

MySQL Service → **Database** 或 **Console**：

```sql
USE railway;
SHOW TABLES;
-- 应包含 sys_user, sys_menu, sys_role, sys_role_menu
-- 以及 app_member, app_member_auth, app_auth_config（C 端会员相关）
```

若只有 `sys_*` 没有 `app_*`：多为 **结构补丁中途失败**（常见：Docker 镜像缺少 `server/seeds/demo-user.json`，`seedDemoUserLayout` 抛错后旧版补丁逻辑未执行 `ensureMemberTables`）。处理：部署含修复的后端并 **Redeploy**，或按上文方式执行 `db:init`。

---

## 四、`railway up` 构建失败

### 现象

后端 **my-vue-app** Deployments 显示 **FAILED**，失败在 **Build > Build image**，约数秒内结束；触发方式为 `railway up`。

### 原因

后端 Service 设置了 **Root Directory = `server`**。

若在 **`server` 目录内** 执行 `railway up`，上传内容已是 `server/` 根，Railway 会再寻找 `server/Dockerfile`，路径变成：

```text
上传包/Dockerfile          ✓ 实际存在
Railway 查找 server/Dockerfile  ✗ 不存在 → 构建失败
```

### 正确做法

**方式 1：GitHub 自动部署（推荐）**

```powershell
cd D:\web\my-vue-app
git add .
git commit -m "fix: ..."
git push
```

**方式 2：CLI 必须在仓库根目录执行**

```powershell
cd D:\web\my-vue-app\server
railway link          # 链接到 my-vue-app 后端

cd D:\web\my-vue-app   # 回到仓库根目录，不要省略
railway up
```

### 对照

| 操作 | 结果 |
|------|------|
| 在 `server/` 里 `railway up` | ❌ 易失败 |
| 在仓库根目录 `railway up` | ✅ |
| `git push` 触发 GitHub 部署 | ✅（与 Root Directory 一致） |

---

## 五、后端 DB_* 变量配错

### 现象

- 连接异常，或行为不符合预期。
- Variables 里 **`DB_USER` 显示为 `3306`**（端口号）。

### 原因

手动填错，或引用变量时把 `MYSQLPORT` 写进了 `DB_USER`。

### 正确配置（my-vue-app 后端 Service → Variables）

| 变量 | 正确值 |
|------|--------|
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
| `DB_USER` | `${{MySQL.MYSQLUSER}}`（一般为 `root`） |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `DB_NAME` | `${{MySQL.MYSQLDATABASE}}`（一般为 `railway`） |
| `DB_SSL` | `true` |

> `${{MySQL.xxx}}` 中的 `MySQL` 须与 MySQL Service **名称**一致，在 Railway 变量引用面板里点选，不要手打错字段。

修改 Variables 后 → **Redeploy** 后端。

---

## 六、前端 API 地址

### 现象

- 页面能打开，登录/接口失败、404、连到 localhost。
- Variables 里 `VITE_API_BASE_URL` 仍是 `https://your-backend.up.railway.app/api` 等占位符。

### 原因

`VITE_*` 在 **构建时** 写入前端包，改变量后必须 **重新构建前端**。

### 正确配置（my-vue-app-web 前端 Service → Variables）

```text
VITE_API_BASE_URL=https://你的后端域名/api
VITE_USE_MOCK=false
```

示例：

```text
VITE_API_BASE_URL=https://my-vue-app-production-41ef.up.railway.app/api
```

保存后 → 前端 Service **Redeploy**。

### 易错：访问错域名

| URL | 用途 |
|-----|------|
| `https://...my-vue-app-web....` | ✅ 浏览器打开系统 |
| `https://...my-vue-app....`（无 web） | 仅 API：`/health`、`/api/*`，无 `/home` 页面 |

---

## 七、三个 Service 不要搞混

```text
┌─────────────┐
│   MySQL     │  插件，只管存数据，不管建业务表
└──────┬──────┘
       │
┌──────▼──────┐
│  my-vue-app │  Root Directory = server，后端 API
└──────┬──────┘
       │ /api
┌──────▼──────────┐
│ my-vue-app-web  │  Root Directory = /（空），前端 Nginx
└─────────────────┘
```

| 易错操作 | 后果 |
|---------|------|
| `railway link` 选成 web 服务 | 命令连错服务 |
| 在后端 Service 配 `VITE_API_BASE_URL` | 对后端运行时无意义（应配在前端） |
| 在 MySQL Service 找登录配置 | 找不到，应改后端 Variables |

---

## 八、代码已改但线上仍旧

### 检查清单

1. 本地是否有未提交改动？

   ```powershell
   cd D:\web\my-vue-app
   git status
   ```

2. 是否已 push？

   ```powershell
   git push
   ```

3. Railway 上最新 Deploy 是否来自 **GitHub** 且状态 **SUCCESS**？
4. 失败的那条若是 **`railway up` + FAILED**，不要当作已上线，按 [§4](#四railway-up-构建失败) 处理。

---

## 九、推荐发布顺序（防踩坑）

1. 添加 **MySQL** 插件  
2. 部署 **后端**（Root Directory = `server`，配齐 `DB_*` + `DB_SSL=true`）  
3. 确认 `/health` 返回 `{"status":"ok"}`  
4. 确认 Deploy Logs 出现数据库初始化成功，或手动 `db:init`  
5. 部署 **前端**（Root Directory 留空，配 `VITE_API_BASE_URL`）  
6. 浏览器打开**前端域名**，`admin / 123456` 登录  
7. 登录成功后修改默认密码  

---

## 十、仍无法解决时收集这些信息

1. **my-vue-app** 最新 Deploy Logs（含 `[DB]` 行）  
2. **my-vue-app** Variables 截图（可打码密码）  
3. MySQL Console 执行 `SHOW TABLES;` 的结果  
4. 浏览器 Network 里登录请求的 URL 与响应 body  
5. 失败 Deploy 的触发方式（GitHub / `railway up`）  

---

## 相关文件

| 文件 | 说明 |
|------|------|
| `server/src/db/initSchema.js` | 启动时自动建表 + `ensureSchemaPatches` 增量补丁 |
| `server/scripts/init-db.js` | CLI：`npm run db:init`（建表 + 补丁） |
| `server/sql/init.sql` | 表结构 |
| `server/.env.railway.example` | 后端变量示例 |
| `server/railway.toml` | 后端 Docker 构建配置 |
| `railway.toml` | 前端 Docker 构建配置 |
