# 布局构建器（Layout Builder）

可拖拽的页面布局编辑器 + 展示端渲染器，Schema 驱动，便于独立前端项目消费。

## 目录结构

```
layout-builder/
  registry.js          # 组件注册表（扩展入口）
  utils.js             # Schema 工具
  LayoutBuilder.vue    # 编辑器主界面
  ComponentLibrary.vue # 左侧组件库
  BuilderCanvas.vue    # 中间画布
  ConfigPanel.vue      # 右侧配置
  blocks/              # 画布预览块
  config/              # 各组件配置表单
  renderer/
    LayoutRenderer.vue # 展示端渲染（可拷贝到新项目）
```

## 页面组件 vs 壳层（Tabbar）

| 维度 | 页面宫格 `grid` | 底部 Tabbar |
|------|----------------|-------------|
| 作用域 | `scope: body` | `chrome.tabbar` |
| 数量 | 可多个，拖拽排序 | 全局唯一 |
| 位置 | 页面内，随内容滚动 | 固定在底部 |
| 配置入口 | 组件列表 + 左侧组件库 | 壳层 → 底部 Tabbar |
| 数据字段 | `components[]` | `chrome.tabbar` |

```json
{
  "pageSettings": { ... },
  "components": [
    { "type": "grid", "props": { ... } }
  ],
  "chrome": {
    "tabbar": {
      "enabled": true,
      "props": {
        "items": [{ "label": "首页", "icon": "House", "path": "/home" }],
        "activeColor": "#6366f1"
      }
    }
  }
}
```

展示端：`LayoutRenderer` 自动渲染 `components` + 固定底部 Tabbar。

## 扩展新页面组件

在 `registry.js` 中追加一项（必须 `scope: COMPONENT_SCOPE.BODY`）：

```js
import MyBlock from './blocks/MyBlock.vue'
import MyConfig from './config/MyConfig.vue'

layoutComponentRegistry.myComponent = {
  type: 'myComponent',
  label: '我的组件',
  category: 'basic',
  scope: COMPONENT_SCOPE.BODY,
  createInstance() {
    return { id: generateId(), type: 'myComponent', props: { ... } }
  },
  block: markRaw(MyBlock),
  config: markRaw(MyConfig),
}
```

并在 `LAYOUT_CATEGORIES` 中确认分类存在。

## Schema 格式

```json
{
  "version": 1,
  "pageSettings": {
    "backgroundType": "solid",
    "backgroundColor": "#f5f7fa",
    "backgroundImage": ""
  },
  "components": [
    { "id": "cmp_xxx", "type": "grid", "props": { "columns": 3, "rows": 2 } }
  ],
  "chrome": {
    "tabbar": { "enabled": true, "props": { "items": [] } }
  }
}
```

## 独立展示端项目接入

1. 拷贝 `src/layout-builder/` 到新项目（或发布为内部 npm 包）
2. 拉取已发布布局：

   ```js
   GET /api/layout/code/{code}
   ```

3. 渲染：

   ```vue
   <LayoutRenderer :schema="layout.schema" />
   ```

4. 仅展示 **status = published** 的布局；后台编辑保存为草稿，需点「发布」。

## 内置组件

| type | 说明 |
|------|------|
| `topContainer` | 顶部容器 + 轮播 |
| `carousel` | 独立轮播 |
| `grid` | 页面宫格（body，可多个） |
| `list` | 图文列表 |
| `chrome.tabbar` | 底部 Tabbar（壳层，固定） |
