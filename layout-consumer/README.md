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
