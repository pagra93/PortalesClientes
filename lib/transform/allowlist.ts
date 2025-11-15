import { NotionDatabaseItem } from '../notion/client';

/**
 * Aplica allowlist estricto a propiedades de Notion
 * SOLO incluye campos explícitamente permitidos
 */

export type AllowedProperty = {
  notionKey: string;     // Nombre de la propiedad en Notion
  displayName: string;   // Nombre a mostrar en el portal
  type: string;          // Tipo de propiedad Notion
};

export type TransformedItem = {
  id: string;
  properties: Record<string, any>;
  url?: string;
};

/**
 * Transforma un item de Notion aplicando allowlist
 */
export function transformWithAllowlist(
  item: NotionDatabaseItem,
  allowlist: AllowedProperty[]
): TransformedItem {
  if (!('properties' in item)) {
    throw new Error('Item no tiene propiedades');
  }

  const transformed: TransformedItem = {
    id: item.id,
    properties: {},
    url: 'url' in item ? item.url : undefined,
  };

  // Solo procesar propiedades en la allowlist
  for (const allowed of allowlist) {
    const notionProp = item.properties[allowed.notionKey];
    
    if (!notionProp) {
      // Propiedad no existe en este item, usar null
      transformed.properties[allowed.displayName] = null;
      continue;
    }

    // Extraer valor según tipo
    transformed.properties[allowed.displayName] = extractPropertyValue(notionProp);
  }

  return transformed;
}

/**
 * Extrae el valor de una propiedad de Notion según su tipo
 * Retorna valores simples (strings, numbers, null) - NUNCA objetos complejos
 */
function extractPropertyValue(property: any): any {
  const type = property.type;

  switch (type) {
    case 'title':
      return property.title?.map((t: any) => t.plain_text).join('') || null;
    
    case 'rich_text':
      return property.rich_text?.map((t: any) => t.plain_text).join('') || null;
    
    case 'number':
      return property.number ?? null;
    
    case 'select':
      return property.select?.name ?? null;
    
    case 'multi_select':
      return property.multi_select?.map((s: any) => s.name) || [];
    
    case 'date':
      if (!property.date) return null;
      return {
        start: property.date.start,
        end: property.date.end || null,
      };
    
    case 'checkbox':
      return property.checkbox ?? false;
    
    case 'url':
      return property.url ?? null;
    
    case 'email':
      // NUNCA exponer emails reales
      return null;
    
    case 'phone_number':
      return property.phone_number ?? null;
    
    case 'status':
      return property.status?.name ?? null;
    
    case 'people':
      // Solo nombres, nunca emails
      return property.people?.map((p: any) => p.name || 'Usuario').filter(Boolean) || [];
    
    case 'files':
      // Solo URLs públicas de archivos
      return property.files?.map((f: any) => ({
        name: f.name,
        url: f.file?.url || f.external?.url,
      })) || [];
    
    case 'relation':
      // Solo IDs, no datos relacionados
      return property.relation?.map((r: any) => r.id) || [];
    
    case 'formula':
      return extractFormulaValue(property.formula);
    
    case 'rollup':
      return extractRollupValue(property.rollup);
    
    case 'created_time':
    case 'last_edited_time':
      return property[type] ?? null;
    
    case 'created_by':
    case 'last_edited_by':
      // Solo nombre, nunca email
      return property[type]?.name || 'Usuario';
    
    default:
      // Tipos desconocidos se omiten
      return null;
  }
}

/**
 * Extrae valor de una fórmula
 */
function extractFormulaValue(formula: any): any {
  if (!formula) return null;
  
  const type = formula.type;
  switch (type) {
    case 'string':
      return formula.string;
    case 'number':
      return formula.number;
    case 'boolean':
      return formula.boolean;
    case 'date':
      return formula.date?.start ?? null;
    default:
      return null;
  }
}

/**
 * Extrae valor de un rollup
 */
function extractRollupValue(rollup: any): any {
  if (!rollup) return null;
  
  const type = rollup.type;
  switch (type) {
    case 'number':
      return rollup.number;
    case 'date':
      return rollup.date?.start ?? null;
    case 'array':
      return rollup.array?.length || 0;
    default:
      return null;
  }
}

/**
 * Valida que una allowlist sea válida
 */
export function validateAllowlist(allowlist: any[]): allowlist is AllowedProperty[] {
  if (!Array.isArray(allowlist)) return false;
  
  return allowlist.every(item => 
    item &&
    typeof item.notionKey === 'string' &&
    typeof item.displayName === 'string' &&
    typeof item.type === 'string'
  );
}

