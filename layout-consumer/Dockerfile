# layout-consumer H5 静态站点（Railway C 端 Service）
#
# Railway Settings（重要）:
#   Root Directory = 留空（仓库根目录，不能填 layout-consumer）
#   Dockerfile Path = layout-consumer/Dockerfile
#   Config file = layout-consumer/railway.toml
#
# 构建上下文需包含 ../shared（与管理端共用的布局逻辑）
FROM node:20-alpine AS builder

WORKDIR /app/layout-consumer

COPY layout-consumer/package.json layout-consumer/package-lock.json* ./
ENV HUSKY=0
RUN npm install

COPY layout-consumer/ ./
COPY shared/ /app/shared/

ARG VITE_API_BASE_URL
ARG VITE_LAYOUT_CODE=demo-home
ENV VITE_USE_MOCK=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_LAYOUT_CODE=$VITE_LAYOUT_CODE
ENV VITE_API_TIMEOUT=15000
ENV VITE_API_SUCCESS_CODE=200

RUN npm run build:h5

FROM nginx:1.27-alpine

COPY layout-consumer/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/layout-consumer/dist/build/h5 /usr/share/nginx/html

ENV PORT=8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
