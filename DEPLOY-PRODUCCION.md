# 🚀 Guía de Deploy a Producción

Esta guía te llevará paso a paso para configurar y desplegar tu aplicación de Portales Notion en producción.

---

## 📋 Requisitos Previos

- [ ] Servidor con Coolify o Docker configurado
- [ ] Base de datos PostgreSQL accesible
- [ ] Dominio configurado (ej: `portales.tudominio.com`)
- [ ] Cuenta de Google Cloud (para OAuth)
- [ ] Cuenta de Notion con permisos de administrador

---

## 1️⃣ Configurar Base de Datos PostgreSQL

### Opción A: Si usas Coolify

Coolify ya tiene PostgreSQL configurado. El host interno es:
```
lo8ckwo8wsgk84w00840k44s:5432
```

### Opción B: Si usas otro servidor

Asegúrate de tener PostgreSQL instalado y accesible.

### Crear las tablas

**Método 1: Ejecutar el script SQL directamente**

```bash
# Conectarte a tu servidor y ejecutar:
psql -U postgres -d postgres -f prisma/init-production.sql
```

**Método 2: Usar Prisma desde el servidor**

```bash
# En el servidor, dentro del contenedor de la app:
npm run db:push
```

---

## 2️⃣ Configurar Google OAuth (para login de usuarios)

### Paso 1: Crear proyecto en Google Cloud

1. Ve a: https://console.cloud.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre sugerido: "Portales Notion Cliente"

### Paso 2: Configurar OAuth Consent Screen

1. Ve a **APIs & Services** → **OAuth consent screen**
2. Selecciona **External**
3. Rellena:
   - **App name**: Portales Notion Cliente
   - **User support email**: tu-email@dominio.com
   - **Developer contact**: tu-email@dominio.com
4. Guarda

### Paso 3: Crear credenciales OAuth

1. Ve a **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Tipo: **Web application**
4. Configurar:
   - **Name**: Portales Producción
   - **Authorized JavaScript origins**:
     ```
     https://portales.tudominio.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://portales.tudominio.com/api/auth/callback/google
     ```
5. **Copiar** el `Client ID` y `Client Secret` generados

---

## 3️⃣ Configurar Notion OAuth

### Paso 1: Crear Public OAuth Integration

1. Ve a: https://www.notion.so/my-integrations
2. Click **+ New integration**
3. Configurar:
   - **Name**: Portal Web Clientes
   - **Type**: ⚠️ **Public** (NO Internal)
   - **Associated workspace**: Selecciona tu workspace
   - **Logo**: Sube tu logo (opcional)

### Paso 2: Configurar capacidades

Marca estos permisos:
- ✅ Read content
- ✅ Read user information (including email)
- ✅ No content write permissions

### Paso 3: Configurar Redirect URIs

En la sección **OAuth Domain & URIs**:

1. **Redirect URIs**: Agregar:
   ```
   https://portales.tudominio.com/api/notion/callback
   ```

2. Guarda los cambios

3. **Copiar** estos valores:
   - **OAuth client ID**
   - **OAuth client secret**

---

## 4️⃣ Variables de Entorno para Producción

En tu servidor Coolify o donde despliegues, configura estas variables de entorno:

```bash
# ============================================
# CONFIGURACIÓN PRODUCCIÓN
# ============================================

# Puerto
PORT=3006

# Base de datos PostgreSQL
# Si usas Coolify con el host interno:
DATABASE_URL="postgresql://postgres:mFupTlOITqS2yvgldAkXnNDpn4EEsGZLAqYvkgw1OmCq6kOq492H3T16X1vBAR2M@lo8ckwo8wsgk84w00840k44s:5432/postgres"

# Si usas IP pública de tu servidor:
# DATABASE_URL="postgresql://postgres:TU_PASSWORD@IP_PUBLICA:5432/postgres"

# ============================================
# NextAuth
# ============================================
NEXTAUTH_URL="https://portales.tudominio.com"

# Generar con: openssl rand -base64 32
NEXTAUTH_SECRET="TU_SECRET_GENERADO_AQUI_MINIMO_32_CARACTERES"

# ============================================
# Google OAuth (del paso 2)
# ============================================
GOOGLE_CLIENT_ID="123456789-xxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxx"

# ============================================
# Notion OAuth (del paso 3) ⭐
# ============================================
NOTION_CLIENT_ID="tu-notion-oauth-client-id-aqui"
NOTION_CLIENT_SECRET="secret_xxxxxxxxxxxxxxxxxxxxxxxxxx"
NOTION_REDIRECT_URI="https://portales.tudominio.com/api/notion/callback"

# ⚠️ NO INCLUIR NOTION_TOKEN en producción

# ============================================
# Configuración adicional
# ============================================
NOTION_MAX_REQUESTS_PER_SECOND="3"
ENABLE_DEBUG_LOGS="false"
ENABLE_STATIC_SNAPSHOTS="false"

# Proteger endpoint de sincronización
# Generar con: openssl rand -hex 32
CRON_SECRET="tu-secret-aleatorio-para-cron-jobs"
```

---

## 5️⃣ Configurar Prisma para PostgreSQL

Verifica que el archivo `prisma/schema.prisma` tenga:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 6️⃣ Proceso de Deploy

### En Coolify:

1. **Crear nueva aplicación**:
   - Tipo: Dockerfile o Docker Compose
   - Repositorio: Tu repo de GitHub
   - Branch: `main` o `master`

2. **Configurar variables de entorno**:
   - Pega todas las variables del paso 4

3. **Configurar dominio**:
   - Agrega tu dominio (ej: `portales.tudominio.com`)
   - Activa SSL/HTTPS automático

4. **Build settings**:
   ```dockerfile
   # Asegúrate de tener un Dockerfile
   # O configurar el build command:
   npm run build
   
   # Start command:
   npm start
   ```

5. **Deploy**:
   - Click en **Deploy**
   - Monitorea los logs

---

## 7️⃣ Verificación Post-Deploy

### Verificar que todo funciona:

1. **Acceder a tu app**: `https://portales.tudominio.com`

2. **Test de login con Google**:
   - Click en "Iniciar sesión"
   - Debe redirigir a Google OAuth
   - Debe crear tu usuario en la BD

3. **Test de conexión con Notion**:
   - Una vez logueado, ir a "Portales"
   - Click en "Conectar con Notion"
   - Debe redirigir a Notion OAuth
   - Autorizar el acceso
   - Debe guardar el token correctamente

4. **Verificar base de datos**:
   ```bash
   # En el servidor
   psql -U postgres -d postgres -c "SELECT * FROM \"User\";"
   psql -U postgres -d postgres -c "SELECT * FROM \"NotionConnection\";"
   ```

---

## 8️⃣ Configurar Sincronización Automática (Opcional)

Si quieres sincronizar automáticamente los portales:

### Opción A: Cron Job en el servidor

```bash
# Agregar a crontab:
*/15 * * * * curl -X POST https://portales.tudominio.com/api/sync \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

### Opción B: GitHub Actions

```yaml
# .github/workflows/sync-portals.yml
name: Sync Portals
on:
  schedule:
    - cron: '*/15 * * * *'  # Cada 15 minutos
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Sync
        run: |
          curl -X POST https://portales.tudominio.com/api/sync \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

## 🔒 Checklist de Seguridad

Antes de lanzar a producción:

- [ ] `NEXTAUTH_SECRET` es único y seguro (>32 caracteres)
- [ ] `CRON_SECRET` es único y seguro
- [ ] `ENABLE_DEBUG_LOGS="false"` en producción
- [ ] HTTPS configurado correctamente
- [ ] Variables de entorno NO están en el código
- [ ] `.env` está en `.gitignore`
- [ ] Redirect URIs configuradas correctamente en Google y Notion
- [ ] Base de datos tiene backups automáticos

---

## 🐛 Troubleshooting

### Error: "Can't reach database"
- Verifica que el `DATABASE_URL` sea correcto
- Si usas Coolify, usa el host interno: `lo8ckwo8wsgk84w00840k44s:5432`
- Si usas IP externa, verifica que el puerto 5432 esté abierto

### Error: "OAuth redirect URI mismatch"
- Verifica que las URIs en Google/Notion coincidan EXACTAMENTE
- Incluye `https://` (no `http://`)
- No incluyas trailing slash `/`

### Error: "Session not found"
- Verifica que `NEXTAUTH_SECRET` esté configurado
- Limpia cookies del navegador
- Verifica que la tabla `Session` exista en la BD

### No se conecta con Notion
- Verifica que sea una integración **Public** (no Internal)
- Verifica que las credenciales OAuth sean correctas
- Revisa los logs del servidor

---

## 📞 Comandos Útiles

```bash
# Ver logs en tiempo real (Coolify)
docker logs -f CONTAINER_ID

# Conectar a la BD
psql -U postgres -h localhost -d postgres

# Regenerar cliente de Prisma
npm run db:generate

# Crear/actualizar tablas
npm run db:push

# Ver todas las tablas
psql -U postgres -d postgres -c "\dt"

# Generar secret para NEXTAUTH_SECRET
openssl rand -base64 32

# Generar secret para CRON_SECRET
openssl rand -hex 32
```

---

## ✅ Todo listo

Una vez completados todos estos pasos:

1. Tu app estará funcionando en producción
2. Los usuarios podrán loguearse con Google
3. Podrán conectar sus workspaces de Notion
4. Podrán crear portales para sus clientes
5. Los portales se sincronizarán automáticamente

---

## 🎉 Próximos Pasos

Después del deploy:

1. Crear tu primer portal de prueba
2. Compartir una base de datos de Notion con la integración
3. Probar el portal público con el token
4. Configurar el cron para sincronización automática
5. Personalizar branding (logo, colores)

**¿Algún problema?** Revisa la sección de Troubleshooting o los logs del servidor.

