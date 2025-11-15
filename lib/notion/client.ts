import { Client } from '@notionhq/client';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

export type NotionDatabaseItem = QueryDatabaseResponse['results'][0];

/**
 * Cliente wrapper para Notion API con rate limiting y paginación
 */
export class NotionClient {
  private client: Client;
  private lastRequestTime: number = 0;
  private minRequestInterval: number;

  constructor(accessToken: string) {
    this.client = new Client({ auth: accessToken });
    
    // Rate limiting: máx 3 req/seg por defecto
    const maxRPS = parseInt(process.env.NOTION_MAX_REQUESTS_PER_SECOND || '3', 10);
    this.minRequestInterval = 1000 / maxRPS;
  }

  /**
   * Aplica rate limiting con backoff exponencial
   */
  private async rateLimit(attempt: number = 0): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Query database con paginación automática y rate limiting
   * Retorna hasta maxItems elementos (default 1000)
   */
  async queryDatabase(
    databaseId: string,
    filters?: any,
    sorts?: any,
    maxItems: number = 1000
  ): Promise<NotionDatabaseItem[]> {
    const allResults: NotionDatabaseItem[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;
    let attempt = 0;

    while (hasMore && allResults.length < maxItems) {
      try {
        await this.rateLimit(attempt);

        const response = await this.client.databases.query({
          database_id: databaseId,
          filter: filters,
          sorts: sorts,
          start_cursor: startCursor,
          page_size: Math.min(100, maxItems - allResults.length), // Notion max 100 per request
        });

        allResults.push(...response.results);
        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;
        attempt = 0; // Reset attempt counter on success

      } catch (error: any) {
        // Manejo de rate limit con backoff exponencial
        if (error.code === 'rate_limited') {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.warn(`Rate limited, esperando ${backoffDelay}ms antes de reintentar...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          attempt++;
          
          if (attempt > 5) {
            throw new Error('Máximo de reintentos alcanzado por rate limiting');
          }
          continue;
        }

        // Otros errores se propagan
        throw error;
      }
    }

    return allResults;
  }

  /**
   * Obtiene información de la base de datos
   */
  async getDatabase(databaseId: string) {
    await this.rateLimit();
    return this.client.databases.retrieve({ database_id: databaseId });
  }

  /**
   * Busca bases de datos en el workspace
   */
  async searchDatabases(query?: string) {
    await this.rateLimit();
    return this.client.search({
      filter: { property: 'object', value: 'database' },
      query,
    });
  }

  /**
   * Verifica la conexión
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.rateLimit();
      await this.client.users.me({});
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Factory para crear cliente desde conexión de usuario
 */
export async function createNotionClientForUser(userId: string): Promise<NotionClient | null> {
  const { db } = await import('@/lib/db');
  
  const connection = await db.notionConnection.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!connection) {
    return null;
  }

  return new NotionClient(connection.accessToken);
}

