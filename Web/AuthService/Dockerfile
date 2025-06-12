FROM node:24-alpine
WORKDIR /app
COPY . .
RUN npm install && npm install react

EXPOSE 3001
CMD ["node", "server.js"]