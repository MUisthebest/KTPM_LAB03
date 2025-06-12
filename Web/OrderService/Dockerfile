FROM node:24-alpine
WORKDIR /app
COPY . .
RUN npm install

EXPOSE 3003
CMD ["node", "server.js"]