# layout-consumer H5 静态站点（Railway C 端 Service）
# Settings → Root Directory = layout-consumer，Builder = Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
ENV HUSKY=0
RUN npm install

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_LAYOUT_CODE=demo-home
ENV VITE_USE_MOCK=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_LAYOUT_CODE=$VITE_LAYOUT_CODE
ENV VITE_API_TIMEOUT=15000
ENV VITE_API_SUCCESS_CODE=200

RUN npm run build:h5

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/build/h5 /usr/share/nginx/html

ENV PORT=8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
