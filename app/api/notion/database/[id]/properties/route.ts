import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createNotionClientForUser } from '@/lib/notion/client';

/**
 * Obtiene las propiedades de una base de datos de Notion
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const notionClient = await createNotionClientForUser(session.user.id);

    if (!notionClient) {
      return NextResponse.json(
        { error: 'No hay conexión de Notion configurada' },
        { status: 400 }
      );
    }

    const database = await notionClient.getDatabase(params.id);

    const properties = Object.entries(database.properties).map(([name, prop]: [string, any]) => ({
      name,
      type: prop.type,
      id: prop.id,
    }));

    return NextResponse.json({ properties });

  } catch (error: any) {
    console.error('Error obteniendo propiedades:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

