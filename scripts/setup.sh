#!/usr/bin/env bash
# Instala dependencias y siembra la base de datos sin Docker.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== Backend =="
cd backend
[ -f .env ] || cp .env.example .env
npm install
npm run seed
cd ..

echo "== Frontend =="
cd frontend
npm install
cd ..

echo
echo "Listo. En dos terminales:"
echo "  cd backend  && npm run dev"
echo "  cd frontend && npm run dev"
