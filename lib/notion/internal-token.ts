/**
 * Helper para trabajar con tokens de integración interna de Notion
 * (en lugar de OAuth)
 */

import { db } from '@/lib/db';

/**
 * Inicializa la conexión de Notion usando un token de integración interna
 * Esto evita el flujo OAuth y permite acceso directo
 */
export async function initializeInternalToken(userId: string): Promise<boolean> {
  const token = process.env.NOTION_TOKEN;

  if (!token || (!token.startsWith('ntn_') && !token.startsWith('secret_'))) {
    console.log(`No hay NOTION_TOKEN configurado en .env o formato inválido. Token exists: ${!!token}, Starts with ntn_: ${token?.startsWith('ntn_')}, Starts with secret_: ${token?.startsWith('secret_')}, Length: ${token?.length}`);
    return false;
  }

  try {
    // Verificar si ya existe una conexión
    const existing = await db.notionConnection.findFirst({
      where: {
        userId,
        workspaceId: 'internal-token'
      },
    });

    if (existing) {
      // Actualizar el token si cambió
      if (existing.accessToken !== token) {
        await db.notionConnection.update({
          where: { id: existing.id },
          data: { accessToken: token },
        });
        console.log('✅ Token de Notion actualizado');
      }
      return true;
    }

    // Crear nueva conexión
    await db.notionConnection.create({
      data: {
        userId,
        workspaceId: 'internal-token',
        workspaceName: 'Workspace Notion',
        accessToken: token,
      },
    });

    console.log(`✅ Conexión de Notion creada con token interno. Token empieza por: ${token.substring(0, 10)}... Longitud: ${token.length}`);
    return true;
  } catch (error) {
    console.error('Error inicializando token de Notion:', error);
    return false;
  }
}

/**
 * Verifica si hay un token interno configurado
 */
export function hasInternalToken(): boolean {
  const token = process.env.NOTION_TOKEN;
  return !!(token && (token.startsWith('ntn_') || token.startsWith('secret_')));
}

