#!/bin/sh
set -e

echo "🔧 Inicializando base de datos con Prisma..."
npx prisma db push --accept-data-loss

echo "🚀 Iniciando aplicación como usuario nextjs..."
exec su-exec nextjs node server.js

