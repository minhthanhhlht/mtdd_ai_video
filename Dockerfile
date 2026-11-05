FROM node:22-bookworm-slim

# Install system dependencies:
# - ffmpeg, ffprobe for video and audio processing
# - chromium and fonts for Remotion rendering & HyperFrames HTML scene capture
# - python3, make, g++, gcc for better-sqlite3 native C++ compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    chromium \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    fonts-freefont-ttf \
    fonts-dejavu-core \
    python3 \
    make \
    g++ \
    gcc \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for Chromium, Puppeteer and Remotion
ENV PORT=6868 \
    SERVER_PORT=6869 \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    CHROMIUM_PATH=/usr/bin/chromium \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    REMOTION_CHROME_EXECUTABLE=/usr/bin/chromium

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY engines/remotion/package.json ./engines/remotion/

# Install dependencies and clean cache immediately in the SAME layer to save disk space
RUN (npm ci --include=dev || npm install --include=dev) \
    && npm cache clean --force \
    && rm -rf /root/.npm /tmp/*

# Copy application source code
COPY . .

# Build server and web application, clean build temp
RUN npm run build \
    && npm cache clean --force \
    && rm -rf /root/.npm /tmp/*

# Ensure runtime directories exist
RUN mkdir -p .runtime/tmp .runtime/models apps/server/data video-projects outputs

# Set production mode for runtime
ENV NODE_ENV=production

# Expose Web port (Coolify routes traffic to port 6868)
EXPOSE 6868

# Start both backend and web dashboard
CMD ["npm", "run", "start"]
