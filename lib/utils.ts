import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Genera un token opaco seguro de 128 bits (32 caracteres hex)
 */
export function generateSecureToken(): string {
  const { nanoid } = require('nanoid');
  // Genera un ID de 32 caracteres URL-safe
  return nanoid(32);
}

/**
 * Formatea una fecha relativa (ej: "hace 2 horas")
 */
export function formatRelativeTime(date: Date): string {
  const { formatDistanceToNow } = require('date-fns');
  const { es } = require('date-fns/locale');
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
}

/**
 * Trunca texto con ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

