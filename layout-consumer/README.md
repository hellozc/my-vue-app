# layout-consumer

UniApp + Vue3 + TypeScript C 端项目，用于拉取并渲染管理端已发布的页面布局。

## 技术栈

- UniApp（Vue 3 + Vite + TypeScript）
- ESLint 9（flat config）
- Husky + lint-staged（提交前校验）

## 支持平台

| 命令 | 平台 |
|------|------|
| `npm run dev:h5` | H5 |
| `npm run dev:mp-weixin` | 微信小程序 |
| `npm run dev:mp-alipay` | 支付宝小程序 |
| `npm run dev:app` | App |

## 快速开始

```bash
cd layout-consumer
npm install
npm run dev:h5          # Mock 数据，无需启动后端
# 或
npm run dev:h5:api      # 联调 server 真实接口（需先启动 server）
```

浏览器访问后，点击「打开预览示例 demo-home」，或输入布局编码查看。

## 开发命令（Mock / 联调）

| 命令 | 模式 | 数据来源 |
|------|------|----------|
| `npm run dev:h5` | Mock | `mock/handlers.mjs`（默认） |
| `npm run dev:h5:mock` | Mock | 同上 |
| `npm run dev:h5:api` | 联调 | `server/` 真实接口（`GET /api/layout/code/:code`） |

联调前请先启动后端：

```bash
cd ../server
npm run dev
```

并确保数据库中存在**已发布**的布局（如 `demo-home`）。后端端口默认 `8080`，若修改了 `server/.env` 的 `PORT`，请同步改 `layout-consumer/.env.integration` 中的 `VITE_API_TARGET`。

## 环境变量

| 变量 | 说明 | Mock 默认 | 联调默认 |
|------|------|-----------|----------|
| `VITE_USE_MOCK` | 是否使用本地 Mock | `true` | `false` |
| `VITE_API_BASE_URL` | 请求前缀 | `/api` | `/api` |
| `VITE_API_TARGET` | 联调代理目标（仅 H5 dev） | — | `http://localhost:8080` |
| `VITE_LAYOUT_CODE` | 默认布局编码 | `demo-home` | `demo-home` |

## 常见问题

- **不要执行 `npm audit fix --force`**：UniApp 依赖链固定了 Vite / `@dcloudio/*` 版本，强制升级会破坏依赖并出现 `undefined@undefined` 等错误。`npm install` 后的 audit 警告在开发环境可忽略。
- **请用 `npm run dev:h5`**，不要直接在终端运行 `uni`；也不要在本子项目用 `pnpm install`（请用 npm）。

### 小程序联调

1. 微信/支付宝开发者工具打开 `dist/dev/mp-weixin` 或 `dist/dev/mp-alipay`
2. `manifest.json` 已关闭 url 校验（开发环境）
3. 真机调试时将 API 改为可访问的内网/公网地址

### 局域网 IP 访问（手机 / 其他设备）

开发服务器已配置 `server.host: true`，启动后终端会显示 `Network: http://192.168.x.x:端口`。

**管理端（仓库根目录）：**

```bash
npm run dev:api
# 手机浏览器访问 http://你的电脑IP:5173
```

**C 端 H5：**

```bash
cd layout-consumer
npm run dev:h5:api
# 手机浏览器访问终端里 Network 地址（端口以终端输出为准）
```

H5 走 Vite 代理时，`VITE_API_TARGET` 保持 `http://localhost:8080` 即可（代理在本机转发到后端）。

**小程序 / App 真机**无法走 H5 代理，需复制 `.env.integration.local.example` 为 `.env.integration.local`，把 API 改成局域网 IP：

```env
VITE_API_BASE_URL=http://192.168.1.100:8080/api
VITE_API_TARGET=http://192.168.1.100:8080
```

Windows 查 IP：`ipconfig` → 无线/以太网 IPv4。若无法访问，检查防火墙是否放行对应端口。

## 项目结构

```
src/
  api/           # 布局、链接 API
  layout/
    blocks/      # 与 admin 端对应的渲染块
    renderer/    # LayoutRenderer
    components/  # AppLink
  pages/
    index/       # 入口，输入布局编码
    layout/      # 布局渲染页
    webview/     # 站外链接（小程序）
```

## 与管理端的关系

- 拉取布局：`GET /api/layout/code/:code`（仅已发布）
- 拉取链接库：`GET /api/link/options`
- 点击统计：`POST /api/link/track/:code`

Schema 结构与管理端 `layout-builder` 保持一致。

## 样式与自适应

### 单位策略（方案 A）

| 场景 | 用法 |
|------|------|
| 组件 `<style>` 静态尺寸 | **rpx**（750 设计稿） |
| 管理端 schema 下发的 px | `pxToRpx()` / `pxStringToRpx()` |
| 状态栏、与系统对齐 | **px**（如 `$lc-header-height: 44px`） |
| H5 布局 | **全宽铺满**，不套 max-width 容器 |

不引入 rem / `lib-flexible`：UniApp 在 H5 会将 rpx 编译为自适应单位，小程序原生支持 rpx，避免二次缩放。

### 浏览器前缀

- 构建：`postcss.config.cjs` + `autoprefixer`（读取 `package.json` → `browserslist`）
- 业务样式无需手写 `-webkit-transform` 等；`line-clamp`、`safe-area` 等见 `src/styles/_mixins.scss` 与 `reset.scss`

### 新增布局组件时

- 复用现有 block：只改 schema，C 端无需发版
- 新 block 类型：在 `layout/registry.ts` 增加渲染组件，静态样式用 rpx，动态 props 用 `unit.ts` 换算

## Railway 部署（H5）

| Railway 设置 | 值 |
|--------------|-----|
| **Root Directory** | `layout-consumer` |
| **Builder** | Dockerfile |

**Variables（构建时注入）：**

| 变量 | 示例 |
|------|------|
| `VITE_API_BASE_URL` | `https://你的后端域名/api` |
| `VITE_LAYOUT_CODE` | `demo-home` |

> C 端构建使用 `layout-consumer/shared/`（从仓库根 `shared/` 同步）。修改根目录 `shared/` 后请执行 `npm run sync:layout-shared` 并提交 `layout-consumer/shared/`。
