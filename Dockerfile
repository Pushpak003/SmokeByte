# Use small Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies required (if any extra, add here)
RUN apk add --no-cache bash

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose backend port
EXPOSE 3000

# Default command (can override in docker-compose)
CMD ["node", "src/server.js"]
