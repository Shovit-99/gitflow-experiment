FROM node:24-alpine
WORKDIR /app
COPY package.json ./
COPY src/ ./src/
EXPOSE 5000
CMD ["node", "src/server.js"]

