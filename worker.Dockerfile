FROM node:20-bullseye-slim

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Only the LibreOffice modules actually needed for conversion —
# avoids pulling in Draw, Base, full language packs, etc.
# This alone usually cuts 1.5-2GB off the image vs the full `libreoffice` meta-package.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libreoffice-writer \
       libreoffice-calc \
       libreoffice-impress \
       libreoffice-core \
       ffmpeg \
       fonts-dejavu-core \
       fonts-liberation \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY package*.json ./
RUN npm install --production && npm cache clean --force

COPY . .

CMD ["node", "src/jobs/worker.js"]