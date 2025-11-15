import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Callback de OAuth de Notion
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/portals?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/portals?error=no_code', request.url)
      );
    }

    // Intercambiar code por access token
    const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NOTION_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Error obteniendo token:', errorData);
      return NextResponse.redirect(
        new URL('/portals?error=token_exchange_failed', request.url)
      );
    }

    const tokenData = await tokenResponse.json();

    // Guardar conexión en BD
    await db.notionConnection.upsert({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: tokenData.workspace_id || 'default',
        },
      },
      create: {
        userId: session.user.id,
        workspaceId: tokenData.workspace_id,
        workspaceName: tokenData.workspace_name,
        accessToken: tokenData.access_token,
        botId: tokenData.bot_id,
      },
      update: {
        accessToken: tokenData.access_token,
        botId: tokenData.bot_id,
        workspaceName: tokenData.workspace_name,
      },
    });

    // Redirigir de vuelta al dashboard
    return NextResponse.redirect(
      new URL('/portals?connected=true', request.url)
    );
  } catch (error: any) {
    console.error('Error en callback de Notion:', error);
    return NextResponse.redirect(
      new URL(`/portals?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}

