# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Cache dependencies separately from source code
COPY package*.json ./
RUN npm ci

# Copy source and build the Vite app for production
# This produces a dist/ folder of static HTML/CSS/JS
COPY . .
RUN npm run build

# ── Stage 2: Serve with nginx ───────────────────────────────────
FROM nginx:alpine AS production

# Copy the built static files into nginx's default serve directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config which handles Vue Router
# and proxies /api requests to the backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]