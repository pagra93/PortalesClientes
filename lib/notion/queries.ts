/**
 * Helpers para construir queries de Notion API
 */

export type NotionFilter = {
  property: string;
  [key: string]: any;
};

/**
 * Crea un filtro por propiedad select
 */
export function filterBySelect(property: string, value: string): NotionFilter {
  return {
    property,
    select: {
      equals: value,
    },
  };
}

/**
 * Crea un filtro por propiedad relation
 */
export function filterByRelation(property: string, relationId: string): NotionFilter {
  return {
    property,
    relation: {
      contains: relationId,
    },
  };
}

/**
 * Crea un filtro por checkbox
 */
export function filterByCheckbox(property: string, value: boolean): NotionFilter {
  return {
    property,
    checkbox: {
      equals: value,
    },
  };
}

/**
 * Combina múltiples filtros con AND
 */
export function andFilters(filters: NotionFilter[]): any {
  if (filters.length === 0) return undefined;
  if (filters.length === 1) return filters[0];
  
  return {
    and: filters,
  };
}

/**
 * Combina múltiples filtros con OR
 */
export function orFilters(filters: NotionFilter[]): any {
  if (filters.length === 0) return undefined;
  if (filters.length === 1) return filters[0];
  
  return {
    or: filters,
  };
}

/**
 * Crea un sort por propiedad
 */
export function sortBy(property: string, direction: 'ascending' | 'descending' = 'ascending') {
  return {
    property,
    direction,
  };
}

