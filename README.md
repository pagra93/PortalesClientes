# Portales Notion - Client Portals desde Notion

Sistema completo para crear portales de cliente de solo lectura desde bases de datos de Notion, con actualización automática y controles de seguridad estrictos.

## 🎯 Características principales

- **Wizard de 4 pasos** para crear portales sin código
- **OAuth de Notion** para conexión segura
- **Allowlist estricta** de propiedades (solo se muestran campos autorizados)
- **Sanitización automática** de rich text y detección de PII
- **2 plantillas**: Ejecutiva (métricas y KPIs) y Operativa (tablas detalladas)
- **ISR de Next.js** para portales rápidos y actualizados
- **Sincronización automática** configurable (cada X minutos)
- **Seguridad por defecto**: tokens opacos, noindex, sin emails expuestos

## 🏗️ Arquitectura

```
┌─────────────────┐
│  Next.js App    │
│  (Dashboard)    │
└────────┬────────┘
         │
         ├─ Wizard (4 pasos)
         ├─ OAuth Notion
         └─ Config portales
                │
                v
         ┌──────────────┐
         │ Supabase PG  │
         │  (Prisma)    │
         └──────┬───────┘
                │
                v
         ┌──────────────┐
         │ Transform    │
         │  - Allowlist │
         │  - Sanitize  │
         │  - Mappings  │
         └──────┬───────┘
                │
                v
         ┌──────────────┐
         │ Portal ISR   │
         │ /p/[token]   │
         └──────────────┘
```

## 🚀 Setup y Deploy

### 📖 Documentación Completa

- **[DEPLOY-PRODUCCION.md](./DEPLOY-PRODUCCION.md)** → Guía paso a paso para desplegar a producción
- **[CHECKLIST-DEPLOY.md](./CHECKLIST-DEPLOY.md)** → Lista verificable de todos los pasos
- **[COMANDOS-RAPIDOS.md](./COMANDOS-RAPIDOS.md)** → Comandos esenciales para deploy rápido
- **[RESUMEN-CONFIGURACION.md](./RESUMEN-CONFIGURACION.md)** → Resumen ejecutivo de la configuración

### ⚡ Quick Start

#### Desarrollo Local (SQLite + Token Notion)

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar configuración de ejemplo
cp env.example .env

# 3. Configurar token de Notion (para desarrollo rápido)
# Editar .env:
DATABASE_URL="file:./dev.db"
NOTION_TOKEN="ntn_tu_token_aqui"  # Token interno de Notion

# 4. Inicializar base de datos
npm run db:push
npm run db:generate

# 5. Ejecutar
npm run dev
```

Visita http://localhost:3006/portals

#### Producción (PostgreSQL + OAuth)

Para producción, **NO uses `NOTION_TOKEN`**. Usa el flujo OAuth completo:

```bash
# 1. Configurar PostgreSQL
psql -U postgres -d postgres -f prisma/init-production.sql

# 2. Crear OAuth apps:
#    - Google OAuth: https://console.cloud.google.com/
#    - Notion OAuth: https://www.notion.so/my-integrations (tipo PUBLIC)

# 3. Configurar variables de entorno en tu servidor
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="[openssl rand -base64 32]"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NOTION_CLIENT_ID="..."
NOTION_CLIENT_SECRET="..."

# 4. Deploy con Docker o Coolify (ver DEPLOY-PRODUCCION.md)
```

**📚 Ver [DEPLOY-PRODUCCION.md](./DEPLOY-PRODUCCION.md) para instrucciones completas.**

## 📖 Guía de uso

### Crear un portal (Wizard)

#### Paso 1: Conectar Notion
- Click en "Conectar con Notion"
- Autoriza el acceso en Notion (selecciona las bases de datos a compartir)
- Redirige de vuelta al wizard

#### Paso 2: Configuración
- Nombre del portal (interno)
- Plantilla: **Ejecutiva** (resumen y KPIs) o **Operativa** (detalle completo)
- Color primario para branding

#### Paso 3: Fuentes de datos
- Asigna bases de datos de Notion a cada sección:
  - **Tasks**: tareas o issues
  - **Milestones**: hitos o entregables clave
  - **History**: log de cambios o historial
- **Allowlist**: selecciona SOLO las propiedades que serán visibles
  - El resto se oculta automáticamente
  - Emails y datos sensibles se filtran siempre

#### Paso 4: Publicar
- Configura frecuencia de sync (mínimo 5 min, recomendado 15-30 min)
- Click en "Publicar portal"
- Copia la URL generada con token privado

### Compartir el portal

La URL generada es del tipo:
```
https://tudominio.com/p/X8k2mP9nQ4rT6vL3wZ1yH5jC
```

- **Token opaco** de 32 caracteres (128 bits)
- **No indexable** por buscadores (noindex, nofollow)
- **Solo lectura**: no se puede editar desde el portal
- **Rotable**: puedes regenerar el token para revocar acceso

## 🔒 Seguridad

### Implementado por defecto

✅ **Token opaco** >= 128 bits (no UUID predecible)  
✅ **Headers de seguridad** (X-Robots-Tag, X-Frame-Options, etc.)  
✅ **Allowlist estricta**: solo campos autorizados  
✅ **Sanitización** de rich text con `sanitize-html`  
✅ **Filtrado de PII**: emails, links a Notion, notas internas  
✅ **Rate limiting** en Notion API (3 req/seg, backoff exponencial)  
✅ **Sin exposición de BD completa**: siempre aplica filtros  

### Buenas prácticas

- Usa **filtros por proyecto/cliente** en Notion
- Limita propiedades en allowlist al mínimo necesario
- Rota tokens si sospechas de fuga
- Revisa logs de sync periódicamente
- Configura sync frecuente solo si es necesario (consume API quota)

## 🛠️ Scripts disponibles

```bash
npm run dev           # Desarrollo local
npm run build         # Build para producción
npm run start         # Servidor producción
npm run lint          # ESLint
npm run format        # Prettier
npm run test          # Tests con Vitest

npm run db:push       # Crear/actualizar schema BD
npm run db:generate   # Generar cliente Prisma
npm run db:seed       # Seed datos iniciales

npm run sync:once     # Sync manual de todos los portales
```

## 📊 Sincronización

### Automática

Los portales se sincronizan cada X minutos (configurado en wizard).

**Implementación sugerida**:
- Cron job que llama a `GET /api/sync` con `Authorization: Bearer CRON_SECRET`
- O Next.js Cron (en Vercel)
- O servicio externo como cron-job.org

### Manual

Desde el dashboard, botón "Sincronizar ahora" en cada portal.

### Logs

Cada sync crea un registro en `SyncLog`:
- Status (ok/error)
- Items sincronizados
- Duración
- Mensaje de error si falla

## 🎨 Plantillas

### Ejecutiva
- Vista de alto nivel para stakeholders
- Métricas: progreso %, tareas activas, hitos
- Lista de hitos con fechas y estados
- Tareas recientes resumidas

### Operativa
- Vista detallada para equipos
- Tablas completas con todas las propiedades permitidas
- Secciones: Tasks, Milestones, History
- Filtrado y ordenamiento (futuro)

## 📦 Estructura del código

```
/Users/pablogranados/Desktop/Notion/
├── app/
│   ├── (dashboard)/          # Dashboard interno
│   │   └── portals/
│   │       ├── page.tsx      # Lista de portales
│   │       ├── new/          # Wizard
│   │       └── [id]/edit/    # Editar portal
│   ├── (public)/
│   │   └── p/[token]/        # Portal público (ISR)
│   └── api/
│       ├── notion/           # OAuth y queries Notion
│       ├── portals/          # CRUD portales
│       └── sync/             # Sincronización
├── lib/
│   ├── auth.ts               # Autenticación (placeholder)
│   ├── db.ts                 # Prisma client
│   ├── utils.ts              # Helpers generales
│   ├── notion/
│   │   ├── client.ts         # Wrapper Notion API + rate limiting
│   │   └── queries.ts        # Builders de filtros
│   ├── transform/
│   │   ├── allowlist.ts      # Aplica allowlist estricta
│   │   ├── sanitize.ts       # Sanitización de HTML y PII
│   │   └── mappings.ts       # Mapeo de valores (status, prioridad)
│   └── publisher/
│       ├── types.ts          # Tipos del portal
│       ├── sync.ts           # Lógica de sincronización
│       └── renderer.tsx      # Obtiene datos para renderizar
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── PortalWizard/         # Wizard 4 pasos
│   └── Portal/               # Templates Executive/Operational
├── prisma/
│   ├── schema.prisma         # Schema de BD
│   └── seed.cjs              # Seed inicial
└── scripts/
    └── syncPortals.ts        # Script sync manual/cron
```

## 🧪 Testing

```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
```

Tests críticos a implementar:
- `lib/transform/allowlist.test.ts`: verificar que solo pasan campos permitidos
- `lib/transform/sanitize.test.ts`: verificar filtrado de PII y HTML
- `lib/notion/client.test.ts`: rate limiting y paginación

## 🚢 Deployment

### Opciones de Deploy

1. **Coolify** (Docker) - Recomendado para auto-hosting
   - Usa el `Dockerfile` incluido
   - Configuración automática con PostgreSQL
   - Ver [DEPLOY-PRODUCCION.md](./DEPLOY-PRODUCCION.md)

2. **Vercel** - Recomendado para facilidad
   - Push a GitHub
   - Conecta repo en Vercel
   - Configura variables de entorno
   - Deploy automático

3. **Docker manual**
   ```bash
   docker build -t portales-notion .
   docker run -p 3006:3006 --env-file .env portales-notion
   ```

### Archivos de Producción Incluidos

- `Dockerfile` - Build optimizado multi-stage
- `docker-compose.production.yml` - Opcional para Docker Compose
- `.dockerignore` - Optimización de build
- `prisma/init-production.sql` - Script de inicialización de PostgreSQL

### Configuración

⚠️ **Importante en producción**:
- ✅ Usa PostgreSQL (no SQLite)
- ✅ Usa OAuth de Notion (no `NOTION_TOKEN`)
- ✅ Configura Google OAuth para login
- ✅ `NEXTAUTH_SECRET` seguro (>32 caracteres)
- ✅ `CRON_SECRET` para proteger endpoint `/api/sync`
- ✅ `ENABLE_DEBUG_LOGS=false`
- ✅ HTTPS obligatorio

**📚 Ver [CHECKLIST-DEPLOY.md](./CHECKLIST-DEPLOY.md) para lista completa.**

## 📈 KPIs sugeridos

- **Time-to-first-portal**: < 10 minutos
- **0 fugas de datos** (emails, PII expuesta)
- **p95 sync duration**: < 3 minutos
- **% syncs exitosos**: > 99%

## 🔮 Mejoras futuras (v2)

- [ ] NextAuth.js completo (Google, Magic Link)
- [ ] Editor visual de allowlist con preview
- [ ] Filtros avanzados por proyecto/cliente
- [ ] Snapshots estáticos en R2/S3 (opcional)
- [ ] Analytics: vistas, accesos por token
- [ ] Rotación automática de tokens
- [ ] Webhooks de Notion (sync en tiempo real)
- [ ] Multi-idioma (i18n)
- [ ] Dark mode en portales
- [ ] Exportar portal a PDF

## 📄 Licencia

MIT License - Uso libre para proyectos comerciales y personales.

## 🤝 Contribuciones

Pull requests bienvenidos! Para cambios grandes, abre un issue primero.

## 📧 Soporte

- Issues: GitHub Issues
- Docs: este README
- PRD: ver archivo de contexto inicial

---

**Hecho con ❤️ para agencias que usan Notion**

