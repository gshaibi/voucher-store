FROM node:18 as builder
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
RUN npm ci --production

# Copy source files
COPY . .

# Production stage
FROM node:18-slim
WORKDIR /app

# Copy only the necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./
COPY --from=builder /app/.env* ./

EXPOSE 4000
CMD ["node", "server.js"]
