FROM node:20-alpine

WORKDIR /app/frontend

# 复制 package 文件
COPY frontend/package.json frontend/package-lock.json ./

# 安装依赖（以 root 用户安装，然后调整权限）
RUN npm install && \
    chown -R node:node /app/frontend

# 切换到非 root 用户
USER node

CMD ["sh", "-c", "npm install && npm run dev -- --hostname 0.0.0.0 --port 3000"]
