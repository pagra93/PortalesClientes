import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const portal = await db.portal.findUnique({
            where: {
                id: params.id,
                userId: session.user.id
            },
            include: {
                sources: true
            }
        });

        if (!portal) {
            return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
        }

        return NextResponse.json({ portal });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { sources } = body;

        // Verify ownership
        const existingPortal = await db.portal.findUnique({
            where: {
                id: params.id,
                userId: session.user.id
            }
        });

        if (!existingPortal) {
            return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
        }

        // Update sources: Delete existing and create new ones (simplest approach for now)
        // Transaction to ensure atomicity
        await db.$transaction(async (tx) => {
            // Delete old sources
            await tx.portalSource.deleteMany({
                where: { portalId: params.id }
            });

            // Create new sources
            if (sources && sources.length > 0) {
                await tx.portalSource.createMany({
                    data: sources.map((s: any) => ({
                        portalId: params.id,
                        section: s.section,
                        notionDbId: s.notionDbId,
                        filterJson: JSON.stringify(s.filterJson || {}),
                        allowlistJson: s.allowlistJson,
                        mappingsJson: s.mappingsJson || '{}',
                    }))
                });
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error updating portal:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
