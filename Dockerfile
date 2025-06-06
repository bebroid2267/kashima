FROM node:18 AS builder

WORKDIR /app

COPY package.json package-lock.json* ./ 
RUN npm install

COPY . .
RUN npm run build

FROM node:18-slim AS runner

WORKDIR /app

ENV NODE_ENV production

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npx", "next", "start"]