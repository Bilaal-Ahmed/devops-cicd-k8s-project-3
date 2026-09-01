FROM node:22-alpine

WORKDIR /app

COPY app/package*.json ./

RUN npm ci --omit=dev

COPY app/ ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER node

CMD ["node", "server.js"]
