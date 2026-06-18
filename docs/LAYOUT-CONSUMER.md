# C 端布局展示项目（layout-consumer）

独立 UniApp 项目，用于在 **H5 / 微信小程序 / 支付宝小程序 / App** 等端渲染管理端已发布的布局。

## 位置

```
my-vue-app/layout-consumer/
```

## 启动

```bash
cd layout-consumer
npm install
npm run dev:h5          # 浏览器
npm run dev:mp-weixin   # 微信小程序
npm run dev:mp-alipay   # 支付宝小程序
npm run dev:app         # App
```

## 前置条件

1. 管理端后端已启动（默认 `http://localhost:8080`）
2. 存在**已发布**布局，例如编码 `demo-home`（Mock 或数据库均可）
3. **微信小程序**联调真实接口：
   - 模拟器：`npm run dev:mp-weixin:api`（自动将 `/api` 拼为 `http://localhost:8080/api`）
   - 真机：复制 `.env.integration.local.example` 为 `.env.integration.local`，把 `VITE_API_TARGET` 改为电脑局域网 IP
   - 微信开发者工具 → 详情 → 本地设置 → 勾选「不校验合法域名」

## 与管理端对接

| 接口 | 用途 |
|------|------|
| `GET /api/layout/code/:code` | 拉取已发布布局 Schema |
| `GET /api/link/options` | 链接库（跳转解析） |
| `POST /api/link/track/:code` | 点击统计 |

Schema 字段与管理端 `layout-builder` 一致，无需二次转换。

## 代码规范

- ESLint 9 + `typescript-eslint` + `eslint-plugin-vue`
- Husky pre-commit 执行 `lint-staged`

```bash
npm run lint
npm run type-check
```

更多说明见 [layout-consumer/README.md](../layout-consumer/README.md)。
