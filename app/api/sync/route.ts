import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { syncPortal } from '@/lib/publisher/sync';
import { db } from '@/lib/db';

/**
 * API para sincronizar portales manualmente
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { portalId } = body;

    if (!portalId) {
      return NextResponse.json(
        { error: 'Portal ID requerido' },
        { status: 400 }
      );
    }

    // Verificar que el portal pertenece al usuario
    const portal = await db.portal.findUnique({
      where: { id: portalId },
      select: { userId: true, name: true },
    });

    if (!portal) {
      return NextResponse.json(
        { error: 'Portal no encontrado' },
        { status: 404 }
      );
    }

    if (portal.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Ejecutar sync
    const result = await syncPortal(portalId);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          duration: result.duration,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      itemsCount: result.itemsCount,
      duration: result.duration,
    });

  } catch (error: any) {
    console.error('Error en sync:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para sincronizar todos los portales (cron job)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar cron secret (si se configura)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { syncAllPublishedPortals } = await import('@/lib/publisher/sync');
    await syncAllPublishedPortals();

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error en sync masivo:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

