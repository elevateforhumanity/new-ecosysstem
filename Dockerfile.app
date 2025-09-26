FROM node:20-alpine
WORKDIR /app

# install production deps
COPY app/package*.json ./
RUN npm ci --omit=dev

# app source
COPY app/ ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# simple healthcheck
HEALTHCHECK CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "server.js"]