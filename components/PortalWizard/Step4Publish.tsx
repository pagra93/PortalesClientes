'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

interface Step4Props {
  portalUrl?: string;
  onPublish: (syncFreq: number) => void;
  onBack: () => void;
  isPublishing?: boolean;
}

export function Step4Publish({ portalUrl, onPublish, onBack, isPublishing }: Step4Props) {
  const [syncFreq, setSyncFreq] = useState(15);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (portalUrl) {
      navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePublish = () => {
    onPublish(syncFreq);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Paso 4: Publicar</h2>
        <p className="text-muted-foreground mt-1">
          Configura la frecuencia de sincronización y publica tu portal
        </p>
      </div>

      {!portalUrl ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Sincronización automática</CardTitle>
              <CardDescription>
                El portal se actualizará automáticamente desde Notion cada X minutos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="sync-freq">Frecuencia (minutos)</Label>
                <Input
                  id="sync-freq"
                  type="number"
                  min="5"
                  max="1440"
                  value={syncFreq}
                  onChange={(e) => setSyncFreq(parseInt(e.target.value) || 15)}
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 15-30 minutos. Mínimo: 5 min. Máximo: 1440 min (24h)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-900">⚠️ Seguridad y privacidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-yellow-800">
              <p>• El portal será accesible mediante una URL con token privado</p>
              <p>• Los buscadores NO indexarán el contenido (noindex, nofollow)</p>
              <p>• Solo se mostrarán los campos que explícitamente permitiste</p>
              <p>• Emails y datos sensibles son filtrados automáticamente</p>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              ← Atrás
            </Button>
            <Button onClick={handlePublish} size="lg" disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                'Publicar portal'
              )}
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle className="text-green-900">¡Portal publicado!</CardTitle>
                  <CardDescription className="text-green-700">
                    Tu portal está listo y accesible
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>URL del portal</CardTitle>
              <CardDescription>Comparte este link con tus clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={portalUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button asChild variant="outline" className="w-full">
                <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir portal
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos pasos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• El portal se sincronizará automáticamente cada {syncFreq} minutos</p>
              <p>• Puedes forzar una sincronización manual desde el dashboard</p>
              <p>• Edita la configuración en cualquier momento</p>
              <p>• Rota el token si necesitas revocar acceso al link actual</p>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button asChild size="lg">
              <a href="/portals">Ir al dashboard</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

