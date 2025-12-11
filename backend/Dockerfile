## --- Builder: installe dev deps et compile TS ---
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev

## --- Runner: image légère avec dist uniquement ---
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/server.js"]


