# 1. Use official Node.js image
FROM node:20-alpine

# 2. Set working directory inside container
WORKDIR /app

RUN apk update && apk add --no-cache libreoffice

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# 4. Copy app source code
COPY . .

# 5. Expose the port your app runs on
EXPOSE 3000

# 7. Switch to root user
USER root

# 6. Start the app
CMD ["node", "src/server.js"]
