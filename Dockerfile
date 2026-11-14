# Production Dockerfile for Vyapaar & Cafe Vaidehi WhatsApp Bot
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install build dependencies for native modules if needed
RUN apk add --no-cache python3 make g++ git

# Copy root configuration and dependency manifests
COPY package.json pnpm-workspace.yaml* ./
COPY whatsapp-bot-control/package*.json ./whatsapp-bot-control/

# Install bot dependencies
WORKDIR /app/whatsapp-bot-control
RUN npm install --production

# Return to root and copy application files
WORKDIR /app
COPY . .

# Persistent volume for WhatsApp authentication session tokens
VOLUME ["/app/whatsapp-bot-control/auth_info"]

# Environment & Ports
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# Start the unified backend & static UI
CMD ["node", "whatsapp-bot-control/server.js"]
