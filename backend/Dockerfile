# ---- Build stage ---------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install build deps for Prisma engines on Alpine.
RUN apk add --no-cache openssl libc6-compat

# Copy manifests first for better layer caching.
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Install all deps (postinstall runs `prisma generate`).
RUN npm ci

# Copy the rest of the source and compile.
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Drop dev-only deps for the runtime image.
RUN npm prune --omit=dev

# ---- Runtime stage -------------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000

RUN apk add --no-cache openssl libc6-compat tini && \
    addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs
EXPOSE 5000

# tini is PID 1 so SIGTERM propagates cleanly to Node and our shutdown hook
# can flush Sentry + close the DB pool.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
