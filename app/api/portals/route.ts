import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateSecureToken } from '@/lib/utils';

/**
 * Crea un nuevo portal
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();

    const { name, template, branding, sources, syncFreqMin, status } = body;

    // Validaciones
    if (!name || !template || !sources || sources.length === 0) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Generar token seguro
    const publicToken = generateSecureToken();

    // Crear portal con sources
    const portal = await db.portal.create({
      data: {
        userId: session.user.id,
        name,
        template,
        branding: JSON.stringify(branding || { primaryColor: '#3b82f6' }),
        publicToken,
        syncFreqMin: syncFreqMin || 15,
        status: status || 'draft',
        sources: {
          create: sources.map((source: any) => ({
            section: source.section,
            notionDbId: source.notionDbId,
            filterJson: JSON.stringify(source.filterJson || {}),
            allowlistJson: JSON.stringify(source.allowlist.map((propName: string) => ({
              notionKey: propName,
              displayName: propName,
              type: 'text', // Se puede mejorar infiriendo el tipo
            }))),
            mappingsJson: JSON.stringify(source.mappings || {}),
          })),
        },
      },
      include: {
        sources: true,
      },
    });

    return NextResponse.json({ portal });

  } catch (error: any) {
    console.error('Error creando portal:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

