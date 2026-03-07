FROM node:20-alpine

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./

RUN npm install

CMD ["sh", "-c", "npm install && npm run dev -- --hostname 0.0.0.0 --port 3000"]
