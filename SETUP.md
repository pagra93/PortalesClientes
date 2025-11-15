# Setup Guide - Portales Notion

Guía paso a paso para configurar el proyecto desde cero.

## 1. Prerrequisitos

✅ Node.js 18 o superior
✅ npm o pnpm
✅ Cuenta de Supabase (o PostgreSQL)
✅ Cuenta de Notion

## 2. Clonar o crear proyecto

```bash
# Si es nuevo
mkdir portales-notion
cd portales-notion
# Copiar archivos del proyecto aquí
```

## 3. Instalar dependencias

```bash
npm install
```

## 4. Configurar Base de Datos (Supabase)

### Opción A: Supabase

1. Crea proyecto en https://supabase.com
2. Ve a Project Settings → Database
3. Copia la "Connection string" (URI format)
4. Pégala en `.env` como `DATABASE_URL`

### Opción B: PostgreSQL local

```bash
# Si tienes Docker
docker run --name portales-postgres -e POSTGRES_PASSWORD=mysecret -p 5432:5432 -d postgres

# DATABASE_URL en .env:
DATABASE_URL="postgresql://postgres:mysecret@localhost:5432/portales"
```

## 5. Configurar Notion OAuth

1. Ve a https://www.notion.so/my-integrations
2. Click "Create new integration"
3. Configura:
   - **Name**: "Portales Cliente"
   - **Associated workspace**: tu workspace
   - **Capabilities**: Read content ✓
   - **Type**: Public
4. En "OAuth Domain & URIs":
   - **Redirect URIs**: `http://localhost:3006/api/notion/callback`
5. Copia:
   - **OAuth client ID** → `NOTION_CLIENT_ID`
   - **OAuth client secret** → `NOTION_CLIENT_SECRET`

## 6. Configurar variables de entorno

Crea archivo `.env`:

```bash
# Puerto de la aplicación
PORT=3006

# Base de datos
DATABASE_URL="postgresql://..."

# Notion OAuth
NOTION_CLIENT_ID="tu-client-id"
NOTION_CLIENT_SECRET="tu-client-secret"
NOTION_REDIRECT_URI="http://localhost:3006/api/notion/callback"

# Auth secret (genera con: openssl rand -base64 32)
NEXTAUTH_SECRET="tu-secret-aleatorio-muy-largo"
NEXTAUTH_URL="http://localhost:3006"

# Opcional: Google OAuth (para login)
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""

# Rate limiting
NOTION_MAX_REQUESTS_PER_SECOND="3"

# Feature flags
ENABLE_DEBUG_LOGS="true"
```

## 7. Inicializar base de datos

```bash
# Generar cliente Prisma
npm run db:generate

# Crear tablas
npm run db:push

# (Opcional) Seed datos de prueba
npm run db:seed
```

## 8. Ejecutar en desarrollo

```bash
npm run dev
```

Abre http://localhost:3006

## 9. Verificar instalación

### Checklist:

- [ ] La página carga sin errores
- [ ] Puedes ir a `/portals`
- [ ] El botón "Crear Portal" funciona
- [ ] Al hacer click en "Conectar Notion" te redirige a Notion

## 10. Crear tu primer portal

1. Click "Crear Portal" en `/portals`
2. **Paso 1**: Conecta Notion
   - Autoriza el acceso
   - Selecciona al menos una base de datos para compartir
3. **Paso 2**: Configura plantilla y branding
4. **Paso 3**: 
   - Asigna bases de datos a secciones
   - Selecciona propiedades permitidas (allowlist)
5. **Paso 4**: Publica
   - Copia la URL generada
   - Compártela con tu cliente

## 11. Troubleshooting

### Error: "No hay conexión de Notion"

- Verifica que completaste el OAuth flow
- Comprueba que seleccionaste bases de datos en Notion
- Revisa la BD: `NotionConnection` debe tener un registro

### Error: "Portal no encontrado" al abrir /p/[token]

- El portal debe tener `status = 'published'`
- Verifica que el token es correcto
- Revisa que hubo al menos una sincronización exitosa

### Error de Prisma: "Can't reach database"

- Verifica `DATABASE_URL` en `.env`
- Si es Supabase, usa la "Connection string" completa
- Intenta hacer ping a la BD

### Error: "Rate limited" de Notion

- Disminuye `NOTION_MAX_REQUESTS_PER_SECOND` en `.env`
- Espera un minuto y reintenta
- Verifica que no tienes múltiples syncs simultáneos

## 12. Deploy a producción (Vercel)

1. Push a GitHub
2. Conecta en Vercel
3. Configura variables de entorno (mismas que `.env`)
4. **Actualiza** `NOTION_REDIRECT_URI` en Notion dashboard:
   ```
   https://tu-dominio.vercel.app/api/notion/callback
   ```
5. Deploy

### Vercel Cron (opcional)

Crea `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/sync",
    "schedule": "*/15 * * * *"
  }]
}
```

Esto sincroniza portales cada 15 minutos automáticamente.

## 13. Siguientes pasos

- [ ] Crea tu primer portal de prueba
- [ ] Comparte el link con alguien para validar
- [ ] Configura sync automático (cron)
- [ ] Revisa logs en `/api/sync`
- [ ] Personaliza plantillas en `components/Portal/`

## ¿Dudas?

Consulta el README.md principal o abre un issue en GitHub.

