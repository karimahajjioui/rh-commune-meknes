FROM node:20-alpine
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install --omit=dev
COPY backend/ ./
COPY database/ /app/database/
EXPOSE 5000
CMD ["node", "server.js"]
