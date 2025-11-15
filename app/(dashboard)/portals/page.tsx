import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { initializeInternalToken } from '@/lib/notion/internal-token';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Settings, Plus } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export default async function PortalsPage() {
  const session = await requireAuth();

  // Auto-inicializar conexión con token interno si existe
  await initializeInternalToken(session.user.id);

  const portals = await db.portal.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { sources: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Portales</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los portales de cliente creados desde Notion
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/portals/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear Portal
          </Link>
        </Button>
      </div>

      {portals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">Aún no tienes portales creados</p>
            <Button asChild>
              <Link href="/portals/new">
                <Plus className="mr-2 h-4 w-4" />
                Crear mi primer portal
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {portals.map((portal) => (
            <Card key={portal.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{portal.name}</CardTitle>
                    <CardDescription className="mt-1 capitalize">
                      Plantilla: {portal.template}
                    </CardDescription>
                  </div>
                  <Badge variant={portal.status === 'published' ? 'default' : 'secondary'}>
                    {portal.status === 'published' ? 'Publicado' : 'Borrador'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Secciones:</span>
                  <span className="font-medium">{portal._count.sources}</span>
                </div>
                
                {portal.lastSyncAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Última sync:</span>
                    <span className="font-medium">
                      {formatRelativeTime(portal.lastSyncAt)}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/portals/${portal.id}/edit`}>
                      <Settings className="mr-1 h-3 w-3" />
                      Editar
                    </Link>
                  </Button>
                  
                  {portal.status === 'published' && (
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <a
                        href={`/p/${portal.publicToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Ver
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

