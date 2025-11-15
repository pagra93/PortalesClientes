import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Agregar headers de seguridad a portales públicos
  if (request.nextUrl.pathname.startsWith('/p/')) {
    const response = NextResponse.next();
    
    // Prevenir indexación por buscadores
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    
    // Headers de seguridad adicionales
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'no-referrer');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/p/:path*',
};

