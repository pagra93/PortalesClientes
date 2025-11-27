import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * Inicia el flujo OAuth de Notion
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.NOTION_CLIENT_ID;
    const redirectUri = process.env.NOTION_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: 'Configuración de Notion OAuth incompleta' },
        { status: 500 }
      );
    }

    const authUrl = new URL('https://api.notion.com/v1/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('owner', 'user');

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

