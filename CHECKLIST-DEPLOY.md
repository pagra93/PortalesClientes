# ✅ Checklist de Deploy a Producción

Usa este checklist para asegurarte de que todo está configurado antes del deploy.

---

## 📦 Pre-Deploy (Preparación)

### 1. Base de Datos PostgreSQL

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos creada (ej: `postgres`)
- [ ] Script SQL ejecutado: `prisma/init-production.sql`
- [ ] Conexión verificada desde el servidor

**Comando para ejecutar SQL:**
```bash
psql -U postgres -d postgres -f prisma/init-production.sql
```

---

### 2. Google OAuth

- [ ] Proyecto creado en Google Cloud Console
- [ ] OAuth Consent Screen configurado
- [ ] Credenciales OAuth 2.0 creadas (Web Application)
- [ ] Redirect URI agregada: `https://tu-dominio.com/api/auth/callback/google`
- [ ] `GOOGLE_CLIENT_ID` copiado
- [ ] `GOOGLE_CLIENT_SECRET` copiado

**URL:** https://console.cloud.google.com/

---

### 3. Notion OAuth

- [ ] Integration creada en Notion
- [ ] Tipo: **Public** (no Internal)
- [ ] Permisos: Read content, Read user info
- [ ] Redirect URI agregada: `https://tu-dominio.com/api/notion/callback`
- [ ] `NOTION_CLIENT_ID` copiado
- [ ] `NOTION_CLIENT_SECRET` copiado

**URL:** https://www.notion.so/my-integrations

---

### 4. Variables de Entorno

- [ ] `DATABASE_URL` - Conexión a PostgreSQL
- [ ] `NEXTAUTH_URL` - URL de producción (https://...)
- [ ] `NEXTAUTH_SECRET` - Generado con `openssl rand -base64 32`
- [ ] `GOOGLE_CLIENT_ID` - De Google Cloud
- [ ] `GOOGLE_CLIENT_SECRET` - De Google Cloud
- [ ] `NOTION_CLIENT_ID` - De Notion
- [ ] `NOTION_CLIENT_SECRET` - De Notion
- [ ] `NOTION_REDIRECT_URI` - URL completa del callback
- [ ] `CRON_SECRET` - Generado con `openssl rand -hex 32`
- [ ] `ENABLE_DEBUG_LOGS=false` - Desactivar logs en producción
- [ ] `NODE_ENV=production` - Modo producción

---

### 5. Código y Dependencias

- [ ] Código actualizado en el repositorio
- [ ] `package.json` incluye `next-auth` y `@auth/prisma-adapter`
- [ ] `Dockerfile` creado
- [ ] `.dockerignore` creado
- [ ] Schema de Prisma configurado para PostgreSQL

---

## 🚀 Deploy

### 6. Configuración del Servidor (Coolify/Docker)

- [ ] Repositorio conectado
- [ ] Branch seleccionada (main/master)
- [ ] Dockerfile detectado
- [ ] Variables de entorno configuradas
- [ ] Dominio configurado
- [ ] SSL/HTTPS activado
- [ ] Puerto 3006 mapeado correctamente

---

### 7. Build y Deploy

- [ ] Build exitoso (sin errores)
- [ ] Contenedor corriendo
- [ ] Logs no muestran errores críticos
- [ ] Health check pasando (`/api/health`)

**Verificar logs:**
```bash
docker logs -f <container-name>
```

---

## ✅ Post-Deploy (Verificación)

### 8. Pruebas de Funcionalidad

- [ ] ✅ Aplicación accesible en `https://tu-dominio.com`
- [ ] ✅ Página de login carga correctamente
- [ ] ✅ Login con Google funciona
- [ ] ✅ Usuario creado en base de datos
- [ ] ✅ Sesión persiste después de login
- [ ] ✅ Botón "Conectar Notion" redirige correctamente
- [ ] ✅ OAuth de Notion funciona
- [ ] ✅ Token de Notion guardado en BD
- [ ] ✅ Listado de bases de datos de Notion funciona
- [ ] ✅ Creación de portal funciona
- [ ] ✅ Portal público accesible con token

**Queries de verificación:**
```sql
-- Ver usuarios registrados
SELECT * FROM "User";

-- Ver conexiones de Notion
SELECT * FROM "NotionConnection";

-- Ver portales creados
SELECT * FROM "Portal";
```

---

### 9. Seguridad

- [ ] HTTPS configurado y funcionando
- [ ] Certificado SSL válido
- [ ] Variables de entorno NO están en el código
- [ ] `.env` en `.gitignore`
- [ ] Debug logs desactivados
- [ ] Secrets son únicos y seguros (>32 caracteres)
- [ ] Headers de seguridad configurados

---

### 10. Monitoreo

- [ ] Health check endpoint respondiendo (`/api/health`)
- [ ] Logs configurados
- [ ] Alertas configuradas (opcional)
- [ ] Backups de base de datos programados

---

## 🔄 Configuración Opcional

### 11. Sincronización Automática (Cron)

Si quieres sincronización automática de portales:

**Opción A: Cron en el servidor**
```bash
# Cada 15 minutos
*/15 * * * * curl -X POST https://tu-dominio.com/api/sync \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

**Opción B: GitHub Actions**
- [ ] Archivo `.github/workflows/sync-portals.yml` creado
- [ ] Secret `CRON_SECRET` configurado en GitHub
- [ ] Workflow probado manualmente

---

## 🐛 Troubleshooting

### Si algo no funciona:

1. **Revisar logs del contenedor:**
   ```bash
   docker logs -f <container-name>
   ```

2. **Verificar variables de entorno:**
   ```bash
   docker exec <container-name> env | grep NEXTAUTH
   ```

3. **Probar conexión a BD:**
   ```bash
   docker exec <container-name> npx prisma db pull
   ```

4. **Verificar health check:**
   ```bash
   curl https://tu-dominio.com/api/health
   ```

---

## 📋 Comandos Útiles

```bash
# Ver logs en tiempo real
docker logs -f <container-name>

# Entrar al contenedor
docker exec -it <container-name> sh

# Regenerar Prisma client
docker exec <container-name> npx prisma generate

# Ver tablas de la BD
psql -U postgres -d postgres -c "\dt"

# Restart del contenedor
docker restart <container-name>

# Rebuild forzado
docker-compose up --build --force-recreate
```

---

## 🎉 Cuando todo esté ✅

¡Felicidades! Tu aplicación está funcionando en producción.

**Próximos pasos:**
1. Crea tu primer portal de prueba
2. Comparte una base de datos de Notion
3. Genera el portal público
4. Comparte el enlace con tus clientes

---

## 📞 Contacto y Soporte

Si encuentras algún problema que no puedas resolver:

1. Revisa los logs del servidor
2. Verifica las configuraciones de OAuth
3. Asegúrate de que las URIs coincidan exactamente
4. Verifica que los secrets estén configurados correctamente

**Archivos de referencia:**
- `DEPLOY-PRODUCCION.md` - Guía completa paso a paso
- `prisma/init-production.sql` - Script de inicialización de BD
- `Dockerfile` - Configuración del contenedor
- `package.json` - Dependencias necesarias

