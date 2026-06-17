# Node.js 后台服务

Express + MySQL 实现的 API 服务，与前端 `src/api` 及 Mock 接口格式对齐。

## 快速开始

```bash
# 安装依赖
npm install

# 初始化 MySQL（首次必须执行）
npm run db:init

# 开发模式
npm run dev

# 生产启动
npm start
```

## MySQL 数据库

### 1. 安装并启动 MySQL

- 本地安装 [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
- 或使用 Docker：

  ```bash
  docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 mysql:8
  ```

### 2. 配置连接

复制 `.env.example` 为 `.env`，修改数据库密码：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=my_vue_app
```

### 3. 初始化数据库

```bash
npm run db:init
```

会自动完成：

- 创建数据库 `my_vue_app`
- 创建表 `sys_menu`
- 导入初始菜单数据

### 4. 打开 / 查看数据库

**方式一：命令行**

```bash
mysql -u root -p
USE my_vue_app;
SELECT * FROM sys_menu;
```

**方式二：图形化工具（推荐）**

| 工具 | 连接参数 |
|------|----------|
| [Navicat](https://www.navicat.com/) | 主机 `localhost`，端口 `3306`，用户 `root`，数据库 `my_vue_app` |
| [DBeaver](https://dbeaver.io/) | 同上 |
| [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) | 同上 |

连接后在 `my_vue_app` 库中可看到 `sys_menu` 表，菜单管理页的增删改会直接写入该表。

### 5. 表结构

`sys_menu` 菜单表：

| 字段 | 说明 |
|------|------|
| id | 主键 |
| parent_id | 上级菜单 ID，0 为顶级 |
| path | 路由路径 |
| name | 路由 name（唯一） |
| label | 菜单名称 |
| icon | 图标 |
| component | 组件路径 |
| sort | 排序 |
| type | `directory` 目录 / `menu` 菜单 |

## 目录结构

```
server/
├── sql/init.sql              # 建表 SQL
├── scripts/init-db.js      # 数据库初始化脚本
├── src/
│   ├── app.js                # 入口
│   ├── db/pool.js            # MySQL 连接池
│   ├── repositories/         # 数据访问层
│   ├── routes/               # 路由
│   ├── services/             # 业务逻辑
│   └── utils/                # 工具函数
├── .env                      # 环境变量（含数据库配置）
└── package.json
```

## 与前端联调

```bash
# 终端 1：后台
npm run dev

# 终端 2：项目根目录
npm run dev:api
```

确认 `.env.integration` 中 `VITE_API_TARGET` 与 `server/.env` 的 `PORT` 一致。

> Mock 模式（`npm run dev`）仍走内存 Mock，不访问 MySQL。联调模式（`npm run dev:api`）才走 MySQL 后台。

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | `8080` |
| `API_PREFIX` | 接口前缀 | `/api` |
| `DB_HOST` | MySQL 主机 | `localhost` |
| `DB_PORT` | MySQL 端口 | `3306` |
| `DB_USER` | 用户名 | `root` |
| `DB_PASSWORD` | 密码 | 空 |
| `DB_NAME` | 数据库名 | `my_vue_app` |

## 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## 健康检查

```
GET http://localhost:8081/health
```
