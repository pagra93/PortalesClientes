# 🚀 Guía SIMPLIFICADA - Sin OAuth

## ✅ LO QUE CAMBIÓ

**Antes:** Google OAuth + Notion OAuth (complicado)  
**Ahora:** Login simple con Email/Password (FÁCIL)

---

## 📋 Pasos Ultra Simplificados

### 1️⃣ Instalar Dependencias (2 min)

```bash
npm install
```

---

### 2️⃣ ~~Configurar OAuth~~ ❌ YA NO ES NECESARIO

✅ **Login automático** con email/password  
✅ **Registro directo** en la app  
✅ **Sin configuraciones externas**  

---

### 3️⃣ Configurar Notion OAuth (10 min)

**Solo necesitas Notion**, no Google:

1. Ve a: https://www.notion.so/my-integrations
2. + New integration
3. **Tipo: PUBLIC** (importante)
4. Permisos: ✅ Read content, ✅ Read user info
5. Redirect URI: `https://tu-dominio.com/api/notion/callback`
6. Copiar Client ID y Secret

---

### 4️⃣ Variables de Entorno para Coolify

**SIMPLIFICADAS** - Solo lo esencial:

```bash
# Base de datos
DATABASE_URL=postgresql://postgres:mFupTlOITqS2yvgldAkXnNDpn4EEsGZLAqYvkgw1OmCq6kOq492H3T16X1vBAR2M@lo8ckwo8wsgk84w00840k44s:5432/postgres

# NextAuth (generar con: openssl rand -base64 32)
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=[generar-con-openssl-rand-base64-32]

# Notion OAuth
NOTION_CLIENT_ID=[client-id-de-notion]
NOTION_CLIENT_SECRET=[secret-de-notion]
NOTION_REDIRECT_URI=https://tu-dominio.com/api/notion/callback

# Configuración
NOTION_MAX_REQUESTS_PER_SECOND=3
ENABLE_DEBUG_LOGS=false
NODE_ENV=production
PORT=3006
```

**❌ YA NO NECESITAS:**
- ~~GOOGLE_CLIENT_ID~~
- ~~GOOGLE_CLIENT_SECRET~~

---

### 5️⃣ Deploy en Coolify (5 min)

1. **Push a Git**
   ```bash
   git add .
   git commit -m "feat: auth simplificada con email/password"
   git push
   ```

2. **En Coolify:**
   - Nueva app → Dockerfile
   - Variables de entorno (arriba)
   - Dominio + SSL
   - Deploy

3. **Las tablas se crean automáticamente** 🎉

---

### 6️⃣ Usar la App

#### Primer Uso:

1. Ve a: `https://tu-dominio.com/register`
2. **Crear cuenta:**
   - Nombre: Tu nombre
   - Email: tu@email.com
   - Contraseña: mínimo 6 caracteres

3. **Login:**
   - Usar el email y contraseña que creaste

4. **Conectar Notion:**
   - Click "Conectar Notion"
   - Autorizar el acceso
   - ¡Listo! Ya puedes crear portales

---

## ✅ Ventajas de Esta Versión

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Setup OAuth** | Google + Notion | Solo Notion |
| **Tiempo config** | ~30 min | ~10 min |
| **Pasos** | 7 pasos | 6 pasos |
| **Variables env** | 10+ variables | 7 variables |
| **Registro** | Google account | Email propio |
| **Login** | Google OAuth | Email/Password |

---

## 🎯 Flujo de Usuario

### Nuevo Usuario:
1. **Registrarse** → `/register`
2. **Login** → `/login`
3. **Conectar Notion** → Autorizar OAuth
4. **Crear Portal** → Wizard 4 pasos
5. **Compartir** → URL con token

### Usuario Existente:
1. **Login** → Email + Password
2. **Gestionar portales** → Dashboard

---

## 🔒 Seguridad

✅ **Contraseñas hasheadas** con bcrypt  
✅ **JWT sessions** (no cookies de base de datos)  
✅ **Validación de emails**  
✅ **Mínimo 6 caracteres** en contraseña  
✅ **OAuth de Notion** sigue siendo seguro  

---

## 📝 Archivos Creados/Modificados

### Nuevos:
- `app/register/page.tsx` - Página de registro
- `app/api/auth/register/route.ts` - API de registro

### Modificados:
- `app/login/page.tsx` - Login con email/password
- `app/api/auth/[...nextauth]/route.ts` - Credentials provider
- `prisma/schema.prisma` - Campo `password` en User
- `package.json` - Dependencia `bcryptjs`
- `prisma/init-production.sql` - Campo password en SQL

### Eliminados:
- ~~app/auth/error/page.tsx~~ (ya no necesario)
- ~~Tablas OAuth~~ (Account, Session, VerificationToken)

---

## 🚀 Deploy Ahora

**Comandos rápidos:**

```bash
# 1. Instalar
npm install

# 2. Generar secret
openssl rand -base64 32

# 3. Push
git add .
git commit -m "feat: auth simplificada"
git push

# 4. Configurar en Coolify y Deploy
```

---

## ✅ Verificación Post-Deploy

```bash
# Health check
curl https://tu-dominio.com/api/health

# Ir al registro
open https://tu-dominio.com/register
```

**Crear cuenta → Login → Conectar Notion → Crear Portal** 🎉

---

## 🎉 ¡Mucho Más Fácil!

**No más:**
- ❌ Google Cloud Console
- ❌ OAuth Consent Screen
- ❌ Configurar redirect URIs en Google
- ❌ Gestionar múltiples OAuth providers

**Solo:**
- ✅ Email + Password
- ✅ Notion OAuth (solo uno)
- ✅ Deploy rápido

---

**Tiempo total: ~20 minutos** ⏱️

