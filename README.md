# 通用后台管理系统

基于 Vue 3 + Vite + Element Plus 的后台管理模板，包含侧边栏布局、多标签页、三级菜单、Pinia 状态管理、Mock 数据模拟及联调配置。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3、Vue Router 5 |
| 构建 | Vite 8 |
| UI | Element Plus、@element-plus/icons-vue |
| 状态 | Pinia |
| 请求 | Axios（二次封装） |
| 图表 | ECharts |
| Mock | Mock.js + vite-plugin-mock-dev-server |
| 样式 | Sass |

## 快速开始

### 环境要求

- Node.js >= 18
- npm / pnpm / yarn

### 首次安装

```bash
# 项目根目录：安装前端依赖
npm install

# 安装 Node 后台依赖（前后端联调时需要）
npm run server:install
```

---

## 启动与联调

### 场景一：仅前端 + Mock（日常开发）

无需启动后台，Mock 数据由 Vite 插件提供。

```bash
npm run dev
# 或
npm run dev:mock
```

| 项目 | 说明 |
|------|------|
| 配置文件 | `.env.development` |
| 访问地址 | 控制台输出，默认 `http://localhost:5173` |
| 首页路由 | `/home` |
| 控制台提示 | `[API] 当前模式: Mock 模拟数据` |

---

### 场景二：前后端联调（Node 后台）

需要**两个终端**，同时运行后台和前端。

**终端 1 — 启动后台**

```bash
npm run server:dev
```

| 项目 | 说明 |
|------|------|
| 配置文件 | `server/.env` |
| 服务地址 | `http://localhost:8080` |
| API 前缀 | `/api` |
| 健康检查 | `GET http://localhost:8080/health` |
| 示例接口 | `GET http://localhost:8080/api/home/getData` |

**终端 2 — 启动前端联调模式**

```bash
npm run dev:api
```

| 项目 | 说明 |
|------|------|
| 配置文件 | `.env.integration` |
| 控制台提示 | `[API] 当前模式: 联调真实接口 → http://localhost:8080` |

**请求链路**

```
浏览器 → 前端 /api/home/getData
       → Vite 代理
       → http://localhost:8080/api/home/getData
       → Node 后台
```

**联调前检查**

1. MySQL 已启动，且已执行 `npm run server:db:init`
2. `server/.env` 中数据库账号密码正确
3. `.env.integration` 中 `VITE_USE_MOCK=false`
4. `.env.integration` 中 `VITE_API_TARGET` 与 `server/.env` 的 `PORT` 一致（当前默认 `8081`）
5. 后台已启动且无端口冲突

**验证接口是否正常**

```bash
# PowerShell
Invoke-WebRequest http://localhost:8080/api/home/getData

# 或在浏览器直接访问
# http://localhost:8080/api/home/getData
```

正常返回：

```json
{ "code": 200, "message": "success", "data": { ... } }
```

---

### 场景三：联调外部后端（非本项目 server）

1. 编辑 `.env.integration`：

   ```env
   VITE_USE_MOCK=false
   VITE_API_TARGET=http://你的后端地址:端口
   VITE_API_STRIP_PREFIX=false   # 后端无 /api 前缀时改为 true
   ```

2. 启动前端：

   ```bash
   npm run dev:api
   ```

---

### 启动命令速查

| 命令 | 用途 | 配置文件 |
|------|------|----------|
| `npm run dev` | 前端 Mock 开发 | `.env.development` |
| `npm run dev:mock` | 同上 | `.env.development` |
| `npm run dev:api` | 前端联调模式 | `.env.integration` |
| `npm run server:dev` | Node 后台开发 | `server/.env` |
| `npm run server:db:init` | 初始化 MySQL 数据库 | `server/.env` |
| `npm run server:start` | Node 后台生产启动 | `server/.env` |
| `npm run build` | 前端生产构建 | `.env.production` |
| `npm run preview:mock` | 构建后 Mock 预览 | `.env.development` |
| `npm run preview:api` | 构建后联调预览 | `.env.integration` |

> 修改 `.env` 文件后需**重启**对应服务才能生效。

---

### 常见问题：端口 8080 被占用

启动 `npm run server:dev` 若提示 `address already in use ::8080`：

```powershell
# 1. 查找占用进程
netstat -ano | findstr :8080

# 2. 结束进程（将 <PID> 替换为上一步 LISTENING 行的 PID）
taskkill /PID <PID> /F

# 3. 重新启动
npm run server:dev
```

或改用其他端口：

1. `server/.env` → `PORT=8081`
2. `.env.integration` → `VITE_API_TARGET=http://localhost:8081`
3. 重启前后端

---

### 构建与预览

```bash
# 生产构建
npm run build

# 预览构建产物
npm run preview
```

## Node.js 后台

项目内置 Express + **MySQL** 后台，位于 `server/` 目录。详细说明见 [server/README.md](./server/README.md)。

### MySQL 首次配置

```bash
# 1. 安装并启动 MySQL，修改 server/.env 中的 DB_PASSWORD
# 2. 初始化数据库（建库、建表、导入菜单）
npm run server:db:init

# 3. 启动后台
npm run server:dev
```

### 打开数据库

用 Navicat、DBeaver 或 MySQL Workbench 连接：

| 参数 | 值 |
|------|-----|
| 主机 | `localhost` |
| 端口 | `3306` |
| 用户 | `root` |
| 密码 | `server/.env` 中配置的 `DB_PASSWORD` |
| 数据库 | `my_vue_app` |

菜单数据在 `sys_menu` 表中，菜单管理页的修改会持久化到 MySQL。

### 后台分层结构

```
路由 routes     →  定义 URL，接收请求、返回响应
服务 services   →  业务逻辑、数据处理
工具 utils      →  统一响应格式 success() / fail()
```

新增接口时：先写 `services` → 再写 `routes` → 最后在 `src/api/` 添加前端调用。

## 项目结构

```
my-vue-app/
├── server/                    # Node.js 后台（Express）
│   └── src/
│       ├── app.js             # 入口
│       ├── routes/            # 路由
│       ├── services/          # 业务逻辑
│       └── utils/response.js  # 统一响应
├── mock/                      # Mock 接口定义
│   └── home.mock.js
├── src/
│   ├── api/                   # 接口请求
│   │   ├── request.js         # Axios 封装
│   │   └── home.js            # 首页接口
│   ├── assets/styles/         # 全局样式
│   ├── components/            # 公共组件
│   │   ├── CommonAside.vue    # 侧边栏
│   │   ├── CommonHeader.vue   # 顶栏
│   │   ├── CommonTabs.vue     # 标签页
│   │   └── MenuItem.vue       # 递归菜单项（支持三级）
│   ├── config/
│   │   ├── api.js             # API 环境配置
│   │   └── menu.js            # 菜单配置
│   ├── router/                # 路由
│   ├── stores/
│   │   └── app.js             # Pinia（菜单收缩等）
│   ├── utils/
│   │   └── menu.js            # 菜单工具函数
│   └── views/                 # 页面
├── .env.development           # Mock 开发环境（npm run dev / dev:mock）
├── .env.integration           # 联调环境（npm run dev:api）
├── .env.development.local.example  # 本地覆盖配置模板（需手动复制，不会自动加载）
├── .env.production            # 生产环境变量
└── vite.config.js
```

## Mock 与联调配置

项目通过 **npm 脚本** 或 **环境变量文件** 控制请求走 Mock 还是真实后端。完整启动步骤见上方 [启动与联调](#启动与联调) 章节。

### 环境文件加载规则

Vite **不会**自动加载 `.env.development.local.example`，该文件只是模板。

实际加载优先级（后者覆盖前者）：

```
.env  →  .env.[mode]  →  .env.[mode].local
```

| 启动方式 | mode | 加载的文件 |
|----------|------|------------|
| `npm run dev` | `development` | `.env.development` + `.env.development.local`（若存在） |
| `npm run dev:api` | `integration` | `.env.integration` + `.env.integration.local`（若存在） |
| `npm run build` | `production` | `.env.production` + `.env.production.local`（若存在） |

> 带 `.local` 后缀的文件已被 git 忽略，适合存放个人本地配置。

### 三种联调方式

**方式一：npm 脚本（团队统一，推荐）**

```bash
# 1. 编辑 .env.integration，设置后端地址
# 2. 启动
npm run dev:api
```

**方式二：本地覆盖文件（个人持久配置）**

将模板复制为本地文件，之后一直用 `npm run dev` 即可走联调：

```bash
# Windows PowerShell
Copy-Item .env.development.local.example .env.development.local

# macOS / Linux
cp .env.development.local.example .env.development.local
```

编辑 `.env.development.local`：

```env
VITE_USE_MOCK=false
VITE_API_TARGET=http://你的后端地址:端口
VITE_API_STRIP_PREFIX=false
```

```bash
npm run dev
```

**方式三：integration 本地覆盖**

创建 `.env.integration.local`（git 已忽略），在 `npm run dev:api` 时覆盖 `.env.integration` 的配置。

### 环境变量说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_USE_MOCK` | `true` 走 Mock，`false` 走真实接口 | `true` |
| `VITE_API_BASE_URL` | Axios 请求前缀 | `/api` |
| `VITE_API_TARGET` | 联调后端地址（Vite 代理目标） | `http://localhost:8080` |
| `VITE_API_STRIP_PREFIX` | 转发时是否去掉 `/api` 前缀 | `false` |
| `VITE_API_TIMEOUT` | 请求超时（毫秒） | `10000` |
| `VITE_API_SUCCESS_CODE` | 业务成功状态码 | `200` |

### Mock 模式

`.env.development` 中默认配置：

```env
VITE_USE_MOCK=true
```

使用 `npm run dev` 或 `npm run dev:mock` 启动即可。

### 联调模式

使用 `npm run dev:api` 启动，或按上文「方式二」配置 `.env.development.local` 后用 `npm run dev`。

修改环境变量后需**重启**开发服务才能生效。

### 后端接口格式

Axios 封装默认期望后端返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

- `code === VITE_API_SUCCESS_CODE` 时返回 `data`
- 若接口直接返回数据（无 `code` 字段），也会正常透传

## 新增 Mock 接口

在 `mock/` 目录下新建 `*.mock.js` 文件，例如 `mock/user.mock.js`：

```javascript
import { defineMock } from 'vite-plugin-mock-dev-server'
import Mock from 'mockjs'

export default defineMock({
  url: '/api/user/list',
  method: ['GET'],
  body() {
    return {
      code: 200,
      message: 'success',
      data: Mock.mock({
        'list|5-10': [{ id: '@id', name: '@cname' }],
      }),
    }
  },
})
```

Mock 仅在 `VITE_USE_MOCK=true` 时生效，修改 mock 文件支持热更新。

## 新增业务接口

1. 在 `src/api/` 下创建模块文件：

   ```javascript
   // src/api/user.js
   import http from './request'

   export function getUserList(params) {
     return http.get('/user/list', { params })
   }
   ```

2. 在页面中调用：

   ```javascript
   import { getUserList } from '@/api/user'

   const loadData = async () => {
     const data = await getUserList({ page: 1 })
     // ...
   }
   ```

3. 联调时在 `src/api/request.js` 请求拦截器中注入 Token：

   ```javascript
   const token = localStorage.getItem('token')
   if (token) config.headers.Authorization = `Bearer ${token}`
   ```

## 菜单与路由

### 菜单配置

编辑 `src/config/menu.js`，支持**三级菜单**：

```javascript
{
  path: '/other',
  name: 'other',
  label: '其他',
  icon: 'More',
  children: [
    {
      path: '/other-group',
      label: '分组管理',
      icon: 'Folder',
      children: [
        { path: '/page1', label: '页面1', icon: 'Document' },
        { path: '/page2', label: '页面2', icon: 'Document' },
      ],
    },
  ],
}
```

- 有 `children` 的节点渲染为子菜单
- 无 `children` 的节点为可点击菜单项
- `icon` 对应 `@element-plus/icons-vue` 组件名

### 路由配置

在 `src/router/index.js` 中为**叶子菜单**添加路由：

```javascript
{
  path: 'page1',
  name: 'page1',
  component: () => import('@/views/PageOne.vue'),
  meta: { title: '页面1' },
}
```

并创建对应页面组件 `src/views/PageOne.vue`。

## Pinia 状态

侧边栏收缩状态在 `src/stores/app.js`：

```javascript
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

appStore.isCollapse       // 是否收缩
appStore.toggleCollapse() // 切换
appStore.setCollapse(true) // 手动设置
```

## 布局说明

| 组件 | 作用 |
|------|------|
| `Main.vue` | 主布局容器 |
| `CommonAside.vue` | 左侧导航，读取 `menu.js` |
| `CommonHeader.vue` | 顶栏（折叠按钮、面包屑、头像） |
| `CommonTabs.vue` | 多标签页，随路由自动添加 |

## 常见问题

### 修改环境变量后不生效？

1. 确认修改的是当前启动命令对应的 env 文件（见上方加载规则表）
2. 环境变量修改后需要**重启**开发服务
3. `.env.development.local.example` 只是模板，必须复制为 `.env.development.local` 才会生效

### 联调时请求 404？

1. 确认后台已启动（`npm run server:dev`），且 `VITE_API_TARGET` 地址正确
2. 若后端接口不带 `/api` 前缀，将 `VITE_API_STRIP_PREFIX` 设为 `true`
3. 确认后端路径与前端请求路径一致（如 `/api/home/getData`）

### 端口被占用？

见上方 [常见问题：端口 8080 被占用](#常见问题端口-8080-被占用) 章节。

### 生产环境如何配置？

生产构建使用 `.env.production`，默认 `VITE_USE_MOCK=false`。

**完整发布步骤见 → [DEPLOY.md](./DEPLOY.md)**（含 Railway 部署、环境变量、检查清单）

Railway 详细操作见 → [docs/DEPLOY-RAILWAY.md](./docs/DEPLOY-RAILWAY.md)

自建 Nginx 反向代理示例：

```nginx
location /api/ {
  proxy_pass http://backend-server:8080/;
}
```

## 脚本命令

完整说明见 [启动命令速查](#启动命令速查)，常用命令：

| 命令 | 说明 |
|------|------|
| `npm run dev` | 前端 Mock 开发 |
| `npm run dev:api` | 前端联调模式 |
| `npm run server:dev` | 启动 Node 后台 |
| `npm run server:db:init` | 初始化 MySQL 数据库 |
| `npm run server:install` | 安装后台依赖 |
| `npm run build` | 前端生产构建 |
| `npm run preview` | 预览生产构建产物 |

> 线上发布详见 [DEPLOY.md](./DEPLOY.md)
