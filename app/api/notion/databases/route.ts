import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createNotionClientForUser } from '@/lib/notion/client';

/**
 * Lista las bases de datos disponibles en Notion
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const notionClient = await createNotionClientForUser(session.user.id);

    if (!notionClient) {
      return NextResponse.json(
        { error: 'No hay conexión de Notion configurada' },
        { status: 400 }
      );
    }

    const response = await notionClient.searchDatabases();

    const databases = response.results.map((db: any) => ({
      id: db.id,
      title: db.title?.[0]?.plain_text || 'Sin título',
      url: db.url,
    }));

    return NextResponse.json({ databases });

  } catch (error: any) {
    console.error('Error listando databases:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

