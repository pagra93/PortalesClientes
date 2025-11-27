import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createNotionClientForUser } from '@/lib/notion/client';

/**
 * Lista las bases de datos disponibles en Notion
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

