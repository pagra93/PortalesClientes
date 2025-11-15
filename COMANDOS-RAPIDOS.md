# ⚡ Comandos Rápidos para Deploy

Guía ultra-resumida con los comandos esenciales.

---

## 🔧 Generar Secrets

```bash
# Para NEXTAUTH_SECRET
openssl rand -base64 32

# Para CRON_SECRET
openssl rand -hex 32
```

---

## 📦 Instalar Dependencias

```bash
cd /Users/pablogranados/Desktop/Notion
npm install
```

---

## 🗄️ Inicializar Base de Datos en Producción

```bash
# Opción 1: Desde tu máquina (si tienes acceso remoto)
psql -h TU_HOST -U postgres -d postgres -f prisma/init-production.sql

# Opción 2: Dentro del servidor
# 1. Subir el archivo SQL al servidor
# 2. Ejecutar:
psql -U postgres -d postgres -f init-production.sql
```

---

## 🐳 Docker (si lo usas directamente)

```bash
# Build
docker build -t portales-notion .

# Run local (para probar)
docker run -p 3006:3006 --env-file .env portales-notion

# Docker Compose
docker-compose -f docker-compose.production.yml up -d

# Ver logs
docker logs -f <container-name>

# Parar
docker-compose -f docker-compose.production.yml down
```

---

## 🚀 Deploy en Coolify

### Setup Inicial

1. **Nueva aplicación**
   - Source: GitHub/GitLab
   - Build Type: Dockerfile
   - Port: 3006

2. **Variables de entorno** (copiar y pegar):

```bash
DATABASE_URL=postgresql://postgres:TU_PASSWORD@lo8ckwo8wsgk84w00840k44s:5432/postgres
NEXTAUTH_URL=https://portales.tudominio.com
NEXTAUTH_SECRET=[generar con openssl rand -base64 32]
GOOGLE_CLIENT_ID=[obtener de Google Cloud]
GOOGLE_CLIENT_SECRET=[obtener de Google Cloud]
NOTION_CLIENT_ID=[obtener de Notion]
NOTION_CLIENT_SECRET=[obtener de Notion]
NOTION_REDIRECT_URI=https://portales.tudominio.com/api/notion/callback
NOTION_MAX_REQUESTS_PER_SECOND=3
ENABLE_DEBUG_LOGS=false
ENABLE_STATIC_SNAPSHOTS=false
CRON_SECRET=[generar con openssl rand -hex 32]
NODE_ENV=production
PORT=3006
```

3. **Dominio**
   - Agregar: `portales.tudominio.com`
   - SSL: Activar automático

4. **Deploy**
   - Click "Deploy"
   - Esperar ~2-5 minutos

---

## 🔍 Verificación Post-Deploy

```bash
# Health check
curl https://portales.tudominio.com/api/health

# Debería retornar:
# {"status":"ok","timestamp":"...","uptime":123}
```

```bash
# Ver logs en Coolify
# (En la interfaz web → Logs)

# O con Docker:
docker logs -f <container-name>
```

```sql
-- Verificar tablas en PostgreSQL
psql -U postgres -d postgres -c "\dt"

-- Debería mostrar:
-- User, Portal, PortalSource, NotionConnection, SyncLog, Account, Session, VerificationToken
```

---

## 🧪 Pruebas Funcionales

### 1. Login con Google
```
1. Ir a: https://portales.tudominio.com/login
2. Click "Iniciar sesión con Google"
3. Autorizar
4. Debe redirigir a /portals
```

### 2. Conectar Notion
```
1. En /portals, click "Conectar Notion"
2. Autorizar en Notion
3. Debe volver y mostrar bases de datos
```

### 3. Verificar en BD
```sql
-- Ver usuarios
SELECT id, email, name FROM "User";

-- Ver conexiones de Notion
SELECT id, "userId", "workspaceName" FROM "NotionConnection";
```

---

## 🐛 Troubleshooting Rápido

### Error: "Can't reach database"
```bash
# Verificar que DATABASE_URL es correcto
docker exec <container> env | grep DATABASE_URL

# Testear conexión
docker exec <container> npx prisma db pull
```

### Error: "OAuth redirect URI mismatch"
```
Verificar que las URIs en Google/Notion sean EXACTAMENTE:
✅ https://portales.tudominio.com/api/auth/callback/google
✅ https://portales.tudominio.com/api/notion/callback

❌ NO incluir trailing slash: .../callback/
❌ NO usar http:// (debe ser https://)
```

### Error: "Session not found"
```bash
# Verificar que NEXTAUTH_SECRET está configurado
docker exec <container> env | grep NEXTAUTH_SECRET

# Limpiar cookies del navegador
# Chrome: DevTools → Application → Cookies → Clear
```

### Logs muestran errores
```bash
# Ver logs completos
docker logs -f <container-name> 2>&1

# Entrar al contenedor
docker exec -it <container-name> sh

# Verificar Prisma
npx prisma db pull
```

---

## 🔄 Actualizar después de cambios en código

```bash
# En Coolify: simplemente hacer push a Git
git add .
git commit -m "feat: nueva funcionalidad"
git push

# Coolify rebuildeará automáticamente (si está configurado)
# O manualmente: click "Redeploy" en Coolify
```

---

## 📊 Monitoreo

```bash
# Health check cada minuto (crontab)
* * * * * curl -f https://portales.tudominio.com/api/health || echo "App down!"

# Ver uso de recursos
docker stats <container-name>

# Ver espacio en disco
df -h
```

---

## 🔐 Seguridad

```bash
# Verificar que secrets son fuertes
echo "TU_NEXTAUTH_SECRET" | wc -c  # Debe ser >32

# Verificar HTTPS
curl -I https://portales.tudominio.com  # Debe retornar 200, no redirect

# Ver headers de seguridad
curl -I https://portales.tudominio.com | grep -i "strict-transport"
```

---

## 📁 Estructura de Archivos Clave

```
Notion/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  ← NextAuth config
│   │   ├── health/route.ts              ← Health check
│   │   └── notion/
│   │       ├── oauth/route.ts           ← Notion OAuth
│   │       └── callback/route.ts        ← Notion callback
│   ├── login/page.tsx                   ← Login page
│   └── auth/error/page.tsx              ← Auth errors
├── lib/
│   └── auth.ts                          ← Auth helpers
├── prisma/
│   ├── schema.prisma                    ← DB schema
│   └── init-production.sql              ← SQL init script
├── Dockerfile                           ← Production build
├── .dockerignore                        ← Exclude files
├── docker-compose.production.yml        ← Optional compose
├── DEPLOY-PRODUCCION.md                 ← Guía completa
├── CHECKLIST-DEPLOY.md                  ← Lista verificable
├── RESUMEN-CONFIGURACION.md             ← Resumen ejecutivo
└── COMANDOS-RAPIDOS.md                  ← Este archivo
```

---

## 🎯 Checklist Ultra-Rápido

```bash
# Pre-deploy
□ npm install
□ SQL ejecutado en PostgreSQL
□ Google OAuth configurado
□ Notion OAuth configurado (TIPO PUBLIC)
□ Variables de entorno copiadas a Coolify
□ Dominio configurado con SSL

# Deploy
□ Push a Git
□ Deploy en Coolify
□ Build exitoso
□ Logs sin errores

# Post-deploy
□ curl https://TU_DOMINIO/api/health → {"status":"ok"}
□ Login con Google funciona
□ Conectar Notion funciona
□ Usuario en BD: SELECT * FROM "User";
```

---

## 📞 Enlaces Útiles

- Google Cloud Console: https://console.cloud.google.com/
- Notion Integrations: https://www.notion.so/my-integrations
- Coolify Docs: https://coolify.io/docs
- NextAuth Docs: https://next-auth.js.org/

---

## 💡 Tips

1. **Siempre verifica los logs primero** cuando algo no funciona
2. **Las URIs deben ser EXACTAS** (sin trailing slash, con https://)
3. **Los secrets deben ser ÚNICOS** (no reusar ejemplos)
4. **PostgreSQL debe ser accesible** desde el contenedor
5. **Notion OAuth debe ser PUBLIC** (no Internal)

---

¡Éxito! 🚀

