FROM node:24-alpine
WORKDIR /app
COPY package.json ./
COPY src/ ./src/
EXPOSE 3000
CMD ["node", "-e", "console.log('Staging frontend active at port 3000'); setInterval(() => {}, 10000);"]

