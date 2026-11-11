FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine AS test

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src
COPY scripts ./scripts
COPY migrations ./migrations
COPY seeds ./seeds
COPY tests ./tests

USER node

ENTRYPOINT ["node", "scripts/testWithDatabase.js"]
CMD ["npm", "test"]

FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=3001

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY scripts ./scripts
COPY migrations ./migrations
COPY seeds ./seeds
COPY --from=build /app/dist ./dist

EXPOSE 3001

USER node

CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && npm run auth:seed-demo-users && node src/server.js"]
