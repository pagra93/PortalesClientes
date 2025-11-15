/**
 * Capa de autenticación con NextAuth
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export type Session = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
};

/**
 * Obtiene la sesión del usuario autenticado
 */
export async function getSession(): Promise<Session | null> {
  // En desarrollo, si no hay NextAuth configurado, usar mock
  if (process.env.NODE_ENV === 'development' && !process.env.GOOGLE_CLIENT_ID) {
    return {
      user: {
        id: 'dev-user-1',
        email: 'dev@example.com',
        name: 'Dev User',
        image: null,
      },
    };
  }

  // En producción, usar NextAuth
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  return {
    user: {
      id: (session.user as any).id || 'unknown',
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
  };
}

/**
 * Middleware para proteger rutas
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('No autenticado');
  }

  return session;
}

