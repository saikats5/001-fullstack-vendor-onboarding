# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first so Docker can cache the npm install layer
# separately from the source code — rebuilds are faster this way
COPY package*.json ./
RUN npm ci

# Copy source and compile TypeScript to JavaScript
COPY . .
RUN npm run build

# ── Stage 2: Production image ───────────────────────────────────
FROM node:18-alpine AS production

WORKDIR /app

# Only install production dependencies in the final image
# keeping the image lean — devDependencies like ts-node-dev are not needed
COPY package*.json ./
RUN npm ci --omit=dev

# Copy only the compiled output from the builder stage
COPY --from=builder /app/dist ./dist

# Create the data directory for SQLite
# This is where vendors.db will live inside the container
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "dist/index.js"]