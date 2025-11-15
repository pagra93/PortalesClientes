# 🚀 EMPIEZA AQUÍ - Deploy a Producción

## ✅ TODO ESTÁ LISTO

Tu proyecto ya está 100% configurado para desplegar a producción. Estos son los pasos que debes seguir:

---

## 📋 Paso 1: Instalar Dependencias (2 min)

```bash
cd /Users/pablogranados/Desktop/Notion
npm install
```

Esto instalará:
- ✅ `next-auth` - Autenticación con Google OAuth
- ✅ `@auth/prisma-adapter` - Integración con base de datos
- ✅ Todas las demás dependencias necesarias

---

## 🗄️ Paso 2: Inicializar PostgreSQL (5 min)

### En tu servidor Coolify:

```bash
# Conectarte a PostgreSQL
psql -U postgres -d postgres

# Ejecutar el script (puedes copiar y pegar todo el contenido)
\i /ruta/al/archivo/prisma/init-production.sql

# O desde fuera:
psql -U postgres -d postgres -f prisma/init-production.sql
```

Esto creará 8 tablas:
- User, Portal, PortalSource, NotionConnection, SyncLog
- Account, Session, VerificationToken (para NextAuth)

---

## 🔑 Paso 3: Configurar Google OAuth (10 min)

1. **Ir a:** https://console.cloud.google.com/
2. **Crear proyecto** "Portales Notion"
3. **OAuth Consent Screen** → External → Completar datos básicos
4. **Credentials** → Create → OAuth client ID → Web Application
5. **Authorized redirect URIs:**
   ```
   https://portales.tudominio.com/api/auth/callback/google
   ```
6. **Copiar:**
   - Client ID
   - Client Secret

---

## 🔗 Paso 4: Configurar Notion OAuth (10 min)

1. **Ir a:** https://www.notion.so/my-integrations
2. **+ New integration**
3. **⚠️ IMPORTANTE: Seleccionar tipo "Public"** (no Internal)
4. **Configurar:**
   - Name: "Portal Web Clientes"
   - Permissions: ✅ Read content, ✅ Read user info
5. **OAuth Domain & URIs:**
   ```
   https://portales.tudominio.com/api/notion/callback
   ```
6. **Copiar:**
   - OAuth client ID
   - OAuth client secret

---

## ⚙️ Paso 5: Variables de Entorno en Coolify (5 min)

Copia y pega esto en las variables de entorno de tu app en Coolify:

```bash
# Base de datos (host interno de Coolify)
DATABASE_URL=postgresql://postgres:mFupTlOITqS2yvgldAkXnNDpn4EEsGZLAqYvkgw1OmCq6kOq492H3T16X1vBAR2M@lo8ckwo8wsgk84w00840k44s:5432/postgres

# NextAuth
NEXTAUTH_URL=https://portales.tudominio.com
NEXTAUTH_SECRET=[PEGAR_AQUI_VER_ABAJO]

# Google OAuth (del paso 3)
GOOGLE_CLIENT_ID=[PEGAR_CLIENT_ID_DE_GOOGLE]
GOOGLE_CLIENT_SECRET=[PEGAR_SECRET_DE_GOOGLE]

# Notion OAuth (del paso 4)
NOTION_CLIENT_ID=[PEGAR_CLIENT_ID_DE_NOTION]
NOTION_CLIENT_SECRET=[PEGAR_SECRET_DE_NOTION]
NOTION_REDIRECT_URI=https://portales.tudominio.com/api/notion/callback

# Configuración
NOTION_MAX_REQUESTS_PER_SECOND=3
ENABLE_DEBUG_LOGS=false
ENABLE_STATIC_SNAPSHOTS=false
CRON_SECRET=[PEGAR_AQUI_VER_ABAJO]
NODE_ENV=production
PORT=3006
```

### Generar los secrets:

```bash
# Para NEXTAUTH_SECRET
openssl rand -base64 32

# Para CRON_SECRET
openssl rand -hex 32
```

---

## 🚀 Paso 6: Deploy en Coolify (5 min)

1. **Push a Git:**
   ```bash
   git add .
   git commit -m "feat: configuración completa para producción"
   git push
   ```

2. **En Coolify:**
   - Crear nueva aplicación → Dockerfile
   - Conectar tu repositorio
   - Branch: main/master
   - Build pack: Dockerfile (auto-detectado)
   - Variables de entorno: Pegar las de arriba
   - Dominio: `portales.tudominio.com`
   - SSL: Activar
   - **Deploy**

3. **Esperar ~3-5 minutos** para el build

---

## ✅ Paso 7: Verificar que Funciona (5 min)

### 1. Health Check
```bash
curl https://portales.tudominio.com/api/health
```

Debe retornar:
```json
{"status":"ok","timestamp":"...","uptime":123}
```

### 2. Login con Google
1. Ir a: `https://portales.tudominio.com/login`
2. Click "Iniciar sesión con Google"
3. Autorizar
4. Debe redirigir a `/portals`

### 3. Conectar Notion
1. En dashboard, click "Conectar Notion"
2. Autorizar en Notion
3. Debe mostrar tus bases de datos

### 4. Verificar en BD
```bash
# Ver usuarios creados
psql -U postgres -d postgres -c "SELECT * FROM \"User\";"

# Ver conexiones de Notion
psql -U postgres -d postgres -c "SELECT * FROM \"NotionConnection\";"
```

---

## 📁 Archivos Importantes Creados

### ✅ Configuración de Producción
- `Dockerfile` - Build optimizado
- `docker-compose.production.yml` - Opcional para Docker Compose
- `.dockerignore` - Optimización de build
- `prisma/init-production.sql` - Script de inicialización de PostgreSQL

### ✅ Autenticación
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configurado
- `lib/auth.ts` - Helpers de autenticación
- `app/login/page.tsx` - Página de login
- `app/auth/error/page.tsx` - Página de errores

### ✅ Monitoring
- `app/api/health/route.ts` - Health check

### ✅ Documentación
- **`DEPLOY-PRODUCCION.md`** ← Guía completa paso a paso
- **`CHECKLIST-DEPLOY.md`** ← Lista verificable
- **`COMANDOS-RAPIDOS.md`** ← Comandos esenciales
- **`RESUMEN-CONFIGURACION.md`** ← Resumen técnico
- **`START-HERE.md`** ← Este archivo

### ✅ Código Actualizado
- `package.json` - Nuevas dependencias agregadas
- `prisma/schema.prisma` - Compatible con PostgreSQL
- `env.example` - Template actualizado
- `README.md` - Documentación actualizada

---

## 🆘 Si Algo No Funciona

### Error: "Can't reach database"
- Verifica que el `DATABASE_URL` sea correcto
- El host `lo8ckwo8wsgk84w00840k44s` solo funciona DENTRO del servidor

### Error: "OAuth redirect URI mismatch"
- Las URIs deben ser EXACTAMENTE:
  - Google: `https://portales.tudominio.com/api/auth/callback/google`
  - Notion: `https://portales.tudominio.com/api/notion/callback`
- Sin trailing slash `/`
- Con `https://` (no `http://`)

### Error: "Session not found"
- Verifica que `NEXTAUTH_SECRET` esté configurado
- Limpia cookies del navegador

### Ver logs
```bash
# En Coolify → Logs (interfaz web)
# O con Docker:
docker logs -f <container-name>
```

---

## 📞 Documentación de Referencia

Si necesitas más detalles sobre algún paso:

1. **[DEPLOY-PRODUCCION.md](./DEPLOY-PRODUCCION.md)** - Guía detallada completa
2. **[CHECKLIST-DEPLOY.md](./CHECKLIST-DEPLOY.md)** - Checklist verificable
3. **[COMANDOS-RAPIDOS.md](./COMANDOS-RAPIDOS.md)** - Todos los comandos útiles
4. **[RESUMEN-CONFIGURACION.md](./RESUMEN-CONFIGURACION.md)** - Resumen técnico

---

## ⏱️ Tiempo Estimado Total

- ✅ Paso 1 - Dependencias: **2 min**
- ✅ Paso 2 - PostgreSQL: **5 min**
- ✅ Paso 3 - Google OAuth: **10 min**
- ✅ Paso 4 - Notion OAuth: **10 min**
- ✅ Paso 5 - Variables: **5 min**
- ✅ Paso 6 - Deploy: **5 min**
- ✅ Paso 7 - Verificación: **5 min**

**TOTAL: ~42 minutos** ⏱️

---

## 🎯 Orden Recomendado

1. **Ahora:** Instalar dependencias (`npm install`)
2. **Mientras se instala:** Crear OAuth apps (Google + Notion)
3. **Después:** Generar secrets y configurar variables
4. **Luego:** Ejecutar SQL en PostgreSQL
5. **Finalmente:** Deploy en Coolify
6. **Verificar:** Tests de funcionalidad

---

## ⚠️ Checklist Pre-Deploy

Antes de hacer deploy, verifica que tengas:

- [ ] Dependencias instaladas (`npm install` completado)
- [ ] Google OAuth configurado (Client ID + Secret)
- [ ] Notion OAuth configurado (Client ID + Secret, tipo PUBLIC)
- [ ] Variables de entorno listas para Coolify
- [ ] Secrets generados (`NEXTAUTH_SECRET`, `CRON_SECRET`)
- [ ] Script SQL listo para ejecutar en PostgreSQL
- [ ] Código subido a Git
- [ ] Dominio configurado

---

## 🎉 ¡Listo para Producción!

Una vez completados todos los pasos:

✅ Tu app estará funcionando en `https://portales.tudominio.com`  
✅ Los usuarios podrán loguearse con Google  
✅ Podrán conectar sus workspaces de Notion  
✅ Podrán crear portales para sus clientes  
✅ Todo con seguridad OAuth completa  

**¡Éxito con el deploy! 🚀**

---

## 📧 ¿Dudas?

Revisa la documentación completa en:
- [DEPLOY-PRODUCCION.md](./DEPLOY-PRODUCCION.md)
- [CHECKLIST-DEPLOY.md](./CHECKLIST-DEPLOY.md)

O verifica los logs del servidor si algo falla.

