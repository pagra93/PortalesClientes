/**
 * Mapeos de valores para hacer más legible el portal
 * Por ejemplo: status "in_progress" → "En Progreso"
 */

export type StatusMapping = Record<string, { label: string; color: string }>;
export type PersonMapping = Record<string, string>; // ID → Nombre público

export const DEFAULT_STATUS_MAPPING: StatusMapping = {
  'not_started': { label: 'No iniciado', color: 'gray' },
  'in_progress': { label: 'En progreso', color: 'blue' },
  'completed': { label: 'Completado', color: 'green' },
  'blocked': { label: 'Bloqueado', color: 'red' },
  'cancelled': { label: 'Cancelado', color: 'gray' },
};

export const DEFAULT_PRIORITY_MAPPING: Record<string, { label: string; color: string }> = {
  'low': { label: 'Baja', color: 'gray' },
  'medium': { label: 'Media', color: 'yellow' },
  'high': { label: 'Alta', color: 'orange' },
  'urgent': { label: 'Urgente', color: 'red' },
};

/**
 * Aplica mapeo de status
 */
export function mapStatus(value: string | null, mapping?: StatusMapping): { 
  label: string; 
  color: string;
} | null {
  if (!value) return null;

  const map = mapping || DEFAULT_STATUS_MAPPING;
  const normalized = value.toLowerCase().replace(/\s+/g, '_');
  
  return map[normalized] || { label: value, color: 'gray' };
}

/**
 * Aplica mapeo de prioridad
 */
export function mapPriority(value: string | null): { 
  label: string; 
  color: string;
} | null {
  if (!value) return null;

  const normalized = value.toLowerCase().replace(/\s+/g, '_');
  return DEFAULT_PRIORITY_MAPPING[normalized] || { label: value, color: 'gray' };
}

/**
 * Aplica mapeos a un item transformado
 */
export function applyMappings(
  item: Record<string, any>,
  mappings: {
    statusFields?: string[];
    priorityFields?: string[];
    statusMapping?: StatusMapping;
  }
): Record<string, any> {
  const result = { ...item };

  // Mapear campos de status
  if (mappings.statusFields) {
    for (const field of mappings.statusFields) {
      if (result[field]) {
        result[field] = mapStatus(result[field], mappings.statusMapping);
      }
    }
  }

  // Mapear campos de prioridad
  if (mappings.priorityFields) {
    for (const field of mappings.priorityFields) {
      if (result[field]) {
        result[field] = mapPriority(result[field]);
      }
    }
  }

  return result;
}

/**
 * Parsea config de mappings desde JSON
 */
export function parseMappingsConfig(json: any): {
  statusFields?: string[];
  priorityFields?: string[];
  statusMapping?: StatusMapping;
} {
  if (!json || typeof json !== 'object') {
    return {};
  }

  return {
    statusFields: Array.isArray(json.statusFields) ? json.statusFields : undefined,
    priorityFields: Array.isArray(json.priorityFields) ? json.priorityFields : undefined,
    statusMapping: json.statusMapping || undefined,
  };
}

