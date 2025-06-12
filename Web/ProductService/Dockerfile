FROM node:24-alpine
WORKDIR /app
COPY . .
RUN npm install

EXPOSE 3002
CMD ["node", "server.js"]