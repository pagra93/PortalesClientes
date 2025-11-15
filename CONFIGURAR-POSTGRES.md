# 🐘 Configurar PostgreSQL de Coolify

Por ahora, el proyecto está usando **SQLite local** porque la URL interna de Coolify no es accesible desde tu localhost.

## 📋 Opciones para usar PostgreSQL:

### **Opción 1: Exponer PostgreSQL públicamente (RECOMENDADO para desarrollo)**

En Coolify, necesitas exponer el puerto PostgreSQL:

1. Ve a tu servicio PostgreSQL en Coolify
2. En "Network" o "Configuration", busca **"Ports"** o **"Port Mapping"**
3. Veo que tienes `3000:5432` - ese `3000` es el puerto externo
4. Necesitas la **IP pública** de tu servidor Coolify

**Luego actualiza .env:**

```bash
# Reemplaza xxx.xxx.xxx.xxx con la IP de tu servidor
DATABASE_URL="postgres://postgres:mFupTlOITqS2yvgldAkXnNDpn4EEsGZLAqYvkgw1OmCqbkOq492H3T16X1v@xxx.xxx.xxx.xxx:3000/postgres"
```

---

### **Opción 2: Usar túnel SSH (más seguro)**

```bash
# En una terminal aparte, crea un túnel:
ssh -L 5433:localhost:3000 tu-servidor-coolify

# Luego en .env:
DATABASE_URL="postgres://postgres:mFupTlOITqS2yvgldAkXnNDpn4EEsGZLAqYvkgw1OmCqbkOq492H3T16X1v@localhost:5433/postgres"
```

---

### **Opción 3: Mantener SQLite local (MÁS FÁCIL para MVP)**

Por ahora, **SQLite funciona perfectamente** para desarrollo local:

```bash
DATABASE_URL="file:./dev.db"
```

**Ventajas:**
- ✅ No necesitas configurar nada
- ✅ Funciona sin conexión
- ✅ Fácil de resetear: `rm dev.db`
- ✅ Perfecto para desarrollo

**Cuándo cambiar a PostgreSQL:**
- Cuando despliegues a producción
- Si necesitas queries avanzadas
- Si vas a tener múltiples instancias

---

## 🚀 Pasos para cambiar a PostgreSQL (cuando quieras):

1. **Obtén la IP pública de tu servidor Coolify**
   ```bash
   # Desde tu servidor:
   curl ifconfig.me
   ```

2. **Actualiza `.env`** con la IP:
   ```bash
   DATABASE_URL="postgres://postgres:mFupTlOITqS2yvgldAkXnNDpn4EEsGZLAqYvkgw1OmCqbkOq492H3T16X1v@TU_IP_AQUI:3000/postgres"
   ```

3. **Actualiza `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"  // Cambiar de sqlite a postgresql
     url      = env("DATABASE_URL")
   }
   ```

4. **Cambia los tipos de datos:**
   - `String` → `Json` (campos: branding, filterJson, allowlistJson, mappingsJson)
   - `String?` → `String? @db.Text` (campo: errorMsg)

5. **Regenera Prisma y crea tablas:**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

6. **Reinicia el servidor:**
   ```bash
   killall node
   npm run dev
   ```

---

## 💡 Recomendación:

**Por ahora, deja SQLite** y enfócate en:
1. ✅ Compartir bases de datos de Notion
2. ✅ Crear tu primer portal
3. ✅ Probar que todo funciona

Cuando vayas a desplegar a producción, ahí sí cambia a PostgreSQL.

---

## 🆘 ¿Necesitas ayuda?

Si quieres configurar PostgreSQL ahora, dime:
1. ¿Cuál es la IP pública de tu servidor Coolify?
2. ¿O prefieres seguir con SQLite por ahora?

