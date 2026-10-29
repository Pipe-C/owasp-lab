#!/usr/bin/env bash
# Borra la base de datos SQLite y la vuelve a sembrar desde cero.
set -euo pipefail

cd "$(dirname "$0")/../backend"

rm -f data/fintrace.db data/fintrace.db-wal data/fintrace.db-shm
npm run seed
echo "Base de datos reiniciada."
