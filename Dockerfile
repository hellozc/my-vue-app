# 前端静态站点（Railway 第二个 Service 使用）
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# 构建时注入后端 API 地址，Railway 可在 Variables 里设置
ARG VITE_API_BASE_URL=/api
ENV VITE_USE_MOCK=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_TIMEOUT=10000
ENV VITE_API_SUCCESS_CODE=200

RUN npm run build

FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
