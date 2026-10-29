FROM node:20-bookworm-slim

WORKDIR /app

# better-sqlite3 compila un binding nativo; build-essential + python3 lo cubren.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=4000
EXPOSE 4000

CMD ["sh", "-c", "node src/db/seed.js && node src/server.js"]
