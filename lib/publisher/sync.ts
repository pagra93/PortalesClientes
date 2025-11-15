/**
 * Sincronización de portales con Notion
 */

import { db } from '@/lib/db';
import { NotionClient } from '@/lib/notion/client';
import { transformWithAllowlist, validateAllowlist } from '@/lib/transform/allowlist';
import { sanitizeObject } from '@/lib/transform/sanitize';
import { applyMappings, parseMappingsConfig } from '@/lib/transform/mappings';
import { revalidateTag } from 'next/cache';

export type SyncResult = {
  success: boolean;
  itemsCount: number;
  duration: number;
  error?: string;
};

/**
 * Sincroniza un portal completo
 */
export async function syncPortal(portalId: string): Promise<SyncResult> {
  const startTime = Date.now();
  let syncLog;

  try {
    // Crear log de sync
    syncLog = await db.syncLog.create({
      data: {
        portalId,
        status: 'running',
      },
    });

    // Obtener portal y fuentes
    const portal = await db.portal.findUnique({
      where: { id: portalId },
      include: {
        sources: true,
        user: {
          include: {
            notionConnections: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!portal) {
      throw new Error('Portal no encontrado');
    }

    const connection = portal.user.notionConnections[0];
    if (!connection) {
      throw new Error('No hay conexión de Notion para este usuario');
    }

    const notionClient = new NotionClient(connection.accessToken);
    let totalItems = 0;

    // Sincronizar cada fuente
    for (const source of portal.sources) {
      const items = await syncPortalSource(notionClient, source);
      totalItems += items;
    }

    // Actualizar portal
    await db.portal.update({
      where: { id: portalId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'ok',
      },
    });

    const duration = Date.now() - startTime;

    // Actualizar log
    await db.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'ok',
        itemsCount: totalItems,
        completedAt: new Date(),
        duration,
      },
    });

    // Revalidar cache del portal
    revalidateTag(`portal:${portalId}`);

    return {
      success: true,
      itemsCount: totalItems,
      duration,
    };

  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorMsg = error.message || 'Error desconocido';

    if (syncLog) {
      await db.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'error',
          errorMsg,
          completedAt: new Date(),
          duration,
        },
      });
    }

    await db.portal.update({
      where: { id: portalId },
      data: {
        lastSyncStatus: 'error',
      },
    });

    return {
      success: false,
      itemsCount: 0,
      duration,
      error: errorMsg,
    };
  }
}

/**
 * Sincroniza una fuente individual (tasks, milestones, history)
 * Los datos se almacenan en caché de Next.js para ISR
 */
async function syncPortalSource(
  notionClient: NotionClient,
  source: any
): Promise<number> {
  // Parse configs (from JSON strings in SQLite)
  const filterJson = typeof source.filterJson === 'string' 
    ? JSON.parse(source.filterJson) 
    : source.filterJson;
  const allowlist = typeof source.allowlistJson === 'string'
    ? JSON.parse(source.allowlistJson)
    : source.allowlistJson;
  const mappingsConfig = parseMappingsConfig(
    typeof source.mappingsJson === 'string' 
      ? JSON.parse(source.mappingsJson)
      : source.mappingsJson
  );

  // Validar allowlist
  if (!validateAllowlist(allowlist)) {
    throw new Error(`Allowlist inválida para source ${source.id}`);
  }

  // Query Notion
  const items = await notionClient.queryDatabase(
    source.notionDbId,
    filterJson,
    undefined,
    1000 // Max items
  );

  // Transformar cada item
  const transformed = items.map(item => {
    const base = transformWithAllowlist(item, allowlist);
    const sanitized = sanitizeObject(base);
    const mapped = applyMappings(sanitized.properties, mappingsConfig);
    
    return {
      id: sanitized.id,
      properties: mapped,
    };
  });

  // Aquí podrías almacenar en cache o BD si lo necesitas
  // Por ahora confiamos en ISR de Next.js

  return transformed.length;
}

/**
 * Sincroniza todos los portales publicados
 */
export async function syncAllPublishedPortals(): Promise<void> {
  const portals = await db.portal.findMany({
    where: { status: 'published' },
    select: { id: true, name: true },
  });

  console.log(`Sincronizando ${portals.length} portales...`);

  for (const portal of portals) {
    try {
      const result = await syncPortal(portal.id);
      console.log(
        `✓ Portal ${portal.name}: ${result.itemsCount} items en ${result.duration}ms`
      );
    } catch (error: any) {
      console.error(`✗ Portal ${portal.name}: ${error.message}`);
    }
  }
}

