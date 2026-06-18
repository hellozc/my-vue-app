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
3. 小程序调试时将 `.env.development` 中 `VITE_API_BASE_URL` 改为可访问的后端地址（不能用 `localhost`）

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
