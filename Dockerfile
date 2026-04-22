FROM node:20-alpine

WORKDIR /app

# 🔥 SSL fix (correct package name)
RUN apk add --no-cache bash ca-certificates && update-ca-certificates

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]