# 使用跨平台 Node.js 镜像作为构建环境 (支持 ARM64 和 AMD64)
FROM --platform=$BUILDPLATFORM node:18-alpine AS build

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码 - 添加时间戳强制更新
ARG CACHEBUST=1
COPY . .

# 构建生产版本
RUN npm run build

# 使用跨平台 nginx 镜像作为生产服务器 (支持 ARM64 和 AMD64)
FROM nginx:alpine

# 复制构建产物到 nginx
COPY --from=build /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
