# Stage 1: Build stage
FROM node:22-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    gcc \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY engines/remotion/package.json ./engines/remotion/

RUN (npm ci --include=dev --no-audit --no-fund || npm install --include=dev --no-audit --no-fund) \
    && npm cache clean --force \
    && rm -rf /root/.npm /tmp/* \
    && (find node_modules/better-sqlite3/prebuilds -type f ! -name "linux-x64.node" -delete 2>/dev/null || true)

COPY . .

RUN npm run build \
    && npm prune --omit=dev \
    && npm cache clean --force \
    && rm -rf apps/web/.next/cache /root/.npm /tmp/*

# Stage 2: Minimal runtime image
FROM node:22-bookworm-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    chromium \
    bubblewrap \
    fonts-freefont-ttf \
    fonts-dejavu-core \
    ca-certificates \
    curl \
    python3 \
    python3-pip \
    python3-venv \
    libgomp1 \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/* /usr/share/doc /usr/share/man /tmp/*

ENV PORT=6868 \
    SERVER_PORT=6869 \
    NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    CHROMIUM_PATH=/usr/bin/chromium \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    REMOTION_CHROME_EXECUTABLE=/usr/bin/chromium

WORKDIR /app

COPY --from=builder /app ./

RUN mkdir -p .runtime/tmp .runtime/models .runtime/gemini-web apps/server/data video-projects outputs assets/voices \
    && python3 -m venv /app/.runtime/venv-gateway \
    && /app/.runtime/venv-gateway/bin/pip install --no-cache-dir --upgrade pip \
    && /app/.runtime/venv-gateway/bin/pip install --no-cache-dir -r /app/gateways/requirements.txt \
    && python3 -m venv /app/.runtime/venv \
    && /app/.runtime/venv/bin/pip install --no-cache-dir --upgrade pip \
    && /app/.runtime/venv/bin/pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu \
    && /app/.runtime/venv/bin/pip install --no-cache-dir vieneu soundfile \
    && rm -rf /root/.cache/pip /tmp/*

EXPOSE 6868

CMD ["npm", "run", "start"]
