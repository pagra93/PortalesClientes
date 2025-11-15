/**
 * Renderizador de portales - Genera componentes React para los portales
 */

import { PortalData, PortalSection } from './types';

/**
 * Obtiene los datos de un portal para renderizar
 */
export async function getPortalData(publicToken: string): Promise<PortalData | null> {
  const { db } = await import('@/lib/db');
  const { NotionClient } = await import('@/lib/notion/client');
  const { transformWithAllowlist } = await import('@/lib/transform/allowlist');
  const { sanitizeObject } = await import('@/lib/transform/sanitize');
  const { applyMappings, parseMappingsConfig } = await import('@/lib/transform/mappings');

  const portal = await db.portal.findUnique({
    where: { publicToken },
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

  if (!portal || portal.status !== 'published') {
    return null;
  }

  const connection = portal.user.notionConnections[0];
  if (!connection) {
    return null;
  }

  const notionClient = new NotionClient(connection.accessToken);
  
  // Preparar estructura de datos
  const sections: Record<PortalSection, any> = {
    tasks: { items: [], columns: [], totalCount: 0 },
    milestones: { items: [], columns: [], totalCount: 0 },
    history: { items: [], columns: [], totalCount: 0 },
  };

  // Cargar cada sección
  for (const source of portal.sources) {
    const section = source.section as PortalSection;
    
    try {
      // Parse JSON strings (SQLite stores as string)
      const allowlist = typeof source.allowlistJson === 'string'
        ? JSON.parse(source.allowlistJson)
        : source.allowlistJson;
      const mappingsConfig = parseMappingsConfig(
        typeof source.mappingsJson === 'string'
          ? JSON.parse(source.mappingsJson)
          : source.mappingsJson
      );
      
      // Query Notion
      const filterJson = typeof source.filterJson === 'string'
        ? JSON.parse(source.filterJson)
        : source.filterJson;
      
      const items = await notionClient.queryDatabase(
        source.notionDbId,
        filterJson,
        undefined,
        200 // Límite para el portal
      );

      // Transformar
      const transformed = items.map(item => {
        const base = transformWithAllowlist(item, allowlist);
        const sanitized = sanitizeObject(base);
        const mapped = applyMappings(sanitized.properties, mappingsConfig);
        
        return {
          id: sanitized.id,
          ...mapped,
        };
      });

      // Generar columnas desde allowlist
      const columns = allowlist.map((prop: any) => ({
        key: prop.displayName,
        label: prop.displayName,
        type: inferColumnType(prop.type),
      }));

      sections[section] = {
        items: transformed,
        columns,
        totalCount: transformed.length,
      };

    } catch (error) {
      console.error(`Error cargando sección ${section}:`, error);
    }
  }

  return {
    id: portal.id,
    name: portal.name,
    template: portal.template as any,
    branding: typeof portal.branding === 'string' 
      ? JSON.parse(portal.branding) 
      : portal.branding,
    sections,
    lastSync: portal.lastSyncAt,
  };
}

/**
 * Infiere el tipo de columna desde el tipo de propiedad Notion
 */
function inferColumnType(notionType: string): 'text' | 'status' | 'date' | 'number' | 'array' {
  if (notionType === 'status' || notionType === 'select') return 'status';
  if (notionType === 'date') return 'date';
  if (notionType === 'number') return 'number';
  if (notionType === 'multi_select' || notionType === 'people') return 'array';
  return 'text';
}

