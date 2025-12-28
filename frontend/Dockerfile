# Frontend Dockerfile (Vite React + Nginx)

# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json ./
RUN npm install --no-audit --no-fund

# Copy source
COPY . .

# Build with API URL provided at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Serve stage ---
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
