# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run check && npm test && npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/.svelte-kit/cloudflare ./.svelte-kit/cloudflare
RUN npm ci --omit=dev && npm cache clean --force
EXPOSE 8788
CMD ["npx", "wrangler", "pages", "dev", ".svelte-kit/cloudflare", "--ip", "0.0.0.0", "--port", "8788"]
