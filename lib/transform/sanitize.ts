import sanitizeHtml from 'sanitize-html';

/**
 * Sanitiza rich text de Notion
 * Por defecto, remueve TODO el HTML - solo texto plano
 */

export type SanitizeOptions = {
  allowBasicFormatting?: boolean; // Permitir <b>, <i>, <u>
  allowLinks?: boolean;           // Permitir <a> (sin href a Notion)
};

const DEFAULT_OPTIONS: SanitizeOptions = {
  allowBasicFormatting: false,
  allowLinks: false,
};

/**
 * Sanitiza un string con rich text
 */
export function sanitizeRichText(text: string, options: SanitizeOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Configuración ultra restrictiva por defecto
  let allowedTags: string[] = [];
  let allowedAttributes: Record<string, string[]> = {};

  if (opts.allowBasicFormatting) {
    allowedTags = ['b', 'i', 'u', 'strong', 'em', 'br'];
  }

  if (opts.allowLinks) {
    allowedTags.push('a');
    allowedAttributes = {
      a: ['href', 'target', 'rel'],
    };
  }

  const sanitized = sanitizeHtml(text, {
    allowedTags,
    allowedAttributes,
    disallowedTagsMode: 'discard',
    transformTags: {
      // Asegurar que los links no apunten a Notion
      'a': (tagName, attribs) => {
        const href = attribs.href || '';
        
        // Bloquear links a Notion
        if (href.includes('notion.so') || href.includes('notion.site')) {
          return {
            tagName: 'span',
            attribs: {},
          };
        }

        // Forzar rel="noopener noreferrer" en links externos
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        };
      },
    },
  });

  return sanitized.trim();
}

/**
 * Sanitiza un objeto completo recursivamente
 */
export function sanitizeObject(obj: any, options: SanitizeOptions = {}): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeRichText(obj, options);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // No sanitizar URLs de archivos ni fechas
      if (key === 'url' || key === 'start' || key === 'end') {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeObject(value, options);
      }
    }
    
    return sanitized;
  }

  return obj;
}

/**
 * Valida que un texto no contenga PII obvio
 */
export function detectPII(text: string): { hasPII: boolean; reason?: string } {
  if (!text || typeof text !== 'string') {
    return { hasPII: false };
  }

  // Detección de emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (emailRegex.test(text)) {
    return { hasPII: true, reason: 'Contiene email' };
  }

  // Detección de URLs a Notion
  if (text.includes('notion.so') || text.includes('notion.site')) {
    return { hasPII: true, reason: 'Contiene link a Notion' };
  }

  return { hasPII: false };
}

/**
 * Remueve PII de un objeto de propiedades transformadas
 */
export function stripPII(data: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      const check = detectPII(value);
      cleaned[key] = check.hasPII ? '[REDACTED]' : value;
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map(item => {
        if (typeof item === 'string') {
          const check = detectPII(item);
          return check.hasPII ? '[REDACTED]' : item;
        }
        return item;
      });
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

