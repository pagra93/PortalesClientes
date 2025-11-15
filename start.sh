#!/bin/bash

echo "🚀 Iniciando Portales Notion en puerto 3006..."
echo ""

# Verificar si existe .env
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << 'EOF'
# Puerto de la aplicación
PORT=3006

# Base de datos (SQLite local para desarrollo rápido)
DATABASE_URL="file:./dev.db"

# Next Auth
NEXTAUTH_URL="http://localhost:3006"
NEXTAUTH_SECRET="desarrollo-local-secret-cambiar-en-produccion-12345678"

# Notion OAuth (configurar después en https://www.notion.so/my-integrations)
NOTION_CLIENT_ID="your-notion-client-id"
NOTION_CLIENT_SECRET="your-notion-client-secret"
NOTION_REDIRECT_URI="http://localhost:3006/api/notion/callback"

# Rate limiting
NOTION_MAX_REQUESTS_PER_SECOND="3"

# Feature flags
ENABLE_DEBUG_LOGS="true"
ENABLE_STATIC_SNAPSHOTS="false"
EOF
    echo "✅ Archivo .env creado"
fi

echo ""
echo "🗄️ Configurando base de datos..."
npx prisma generate
npx prisma db push --accept-data-loss

echo ""
echo "🌱 Poblando datos iniciales..."
npm run db:seed

echo ""
echo "✨ ¡Todo listo! Iniciando servidor en http://localhost:3006"
echo ""

npm run dev

