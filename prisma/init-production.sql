-- ============================================
-- Script de inicialización para PostgreSQL
-- Ejecutar en producción antes del primer deploy
-- ============================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- Tabla de portales
CREATE TABLE IF NOT EXISTS "Portal" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publicToken" TEXT UNIQUE NOT NULL,
    "template" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "syncFreqMin" INTEGER NOT NULL DEFAULT 15,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "branding" TEXT NOT NULL DEFAULT '{"logoUrl": null, "primaryColor": "#3b82f6"}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Portal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Portal_userId_idx" ON "Portal"("userId");
CREATE INDEX IF NOT EXISTS "Portal_publicToken_idx" ON "Portal"("publicToken");
CREATE INDEX IF NOT EXISTS "Portal_status_idx" ON "Portal"("status");

-- Tabla de fuentes de datos para portales
CREATE TABLE IF NOT EXISTS "PortalSource" (
    "id" TEXT PRIMARY KEY,
    "portalId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "notionDbId" TEXT NOT NULL,
    "filterJson" TEXT NOT NULL DEFAULT '{}',
    "allowlistJson" TEXT NOT NULL DEFAULT '[]',
    "mappingsJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PortalSource_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "Portal"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "PortalSource_portalId_idx" ON "PortalSource"("portalId");
CREATE INDEX IF NOT EXISTS "PortalSource_section_idx" ON "PortalSource"("section");

-- Tabla de conexiones con Notion
CREATE TABLE IF NOT EXISTS "NotionConnection" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "workspaceName" TEXT,
    "accessToken" TEXT NOT NULL,
    "botId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NotionConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "NotionConnection_userId_workspaceId_key" UNIQUE ("userId", "workspaceId")
);

CREATE INDEX IF NOT EXISTS "NotionConnection_userId_idx" ON "NotionConnection"("userId");

-- Tabla de logs de sincronización
CREATE TABLE IF NOT EXISTS "SyncLog" (
    "id" TEXT PRIMARY KEY,
    "portalId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "itemsCount" INTEGER NOT NULL DEFAULT 0,
    "errorMsg" TEXT,
    "duration" INTEGER
);

CREATE INDEX IF NOT EXISTS "SyncLog_portalId_idx" ON "SyncLog"("portalId");
CREATE INDEX IF NOT EXISTS "SyncLog_startedAt_idx" ON "SyncLog"("startedAt");
CREATE INDEX IF NOT EXISTS "SyncLog_status_idx" ON "SyncLog"("status");

-- Nota: No se necesitan tablas adicionales de NextAuth
-- porque usamos JWT sessions (no database sessions)

-- ============================================
-- Fin del script de inicialización
-- ============================================

-- Para ejecutar este script en tu servidor PostgreSQL:
-- psql -h tu-host -U postgres -d postgres -f init-production.sql

