# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Accept VITE_API_URL as build argument
ARG VITE_API_URL=http://144.79.218.126:5092
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build with VITE_API_URL
RUN VITE_API_URL=${VITE_API_URL} npm run build
ARG VITE_API_URL=http://144.79.218.126:5092
ENV VITE_API_URL=$VITE_API_URL

# Production stage
FROM node:22-alpine

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy dist from builder
COPY --from=builder /app/dist ./dist

# Install serve globally
RUN npm install -g serve

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 8005

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8005 || exit 1

CMD ["serve", "-s", "dist", "-l", "8005"]
