# Step 1: Debian-based Node.js image ko base banayein
FROM node:20-bullseye

# Step 2: Fonts ke EULA ko automatically accept karne ke liye environment variable set karein
ENV DEBIAN_FRONTEND=noninteractive

# Step 3: Container ke andar working directory set karein
WORKDIR /app

# Step 4: Output files ke liye '/app/public/uploads' directory banayein
RUN mkdir -p /app/public/uploads

# Step 5: Zaroori dependencies install karein (LibreOffice, FFmpeg, aur MS Fonts)
# MS fonts ke liye 'contrib' aur 'non-free' repositories add karein
RUN echo "deb http://deb.debian.org/debian bullseye contrib non-free" >> /etc/apt/sources.list \
    && apt-get update \
    # MS fonts ke EULA ko pehle se hi accept karein
    && echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections \
    && apt-get install -y \
    ttf-mscorefonts-installer \
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    ffmpeg \
    fonts-dejavu \
    # Installation ke baad cache saaf karke image size chhota rakhein
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Step 6: npm dependencies install karein
COPY package*.json ./
RUN npm install --production

# Step 7: Baaki ka poora source code copy karein
COPY . .

# Step 8: Container start hone par worker script ko chalane ki default command
CMD ["node", "src/jobs/worker.js"]
