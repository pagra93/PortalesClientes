'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

export function ConnectionStatus() {
  const [checking, setChecking] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const res = await fetch('/api/notion/databases');
      setConnected(res.ok);
    } catch {
      setConnected(false);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <div>
          <p className="font-medium">Verificando conexión...</p>
          <p className="text-sm text-muted-foreground">Comprobando acceso a Notion</p>
        </div>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle2 className="h-6 w-6 text-green-600" />
        <div className="flex-1">
          <p className="font-medium text-green-900">✅ Conectado a Notion</p>
          <p className="text-sm text-green-700">
            Tu integración tiene acceso a las bases de datos compartidas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex-1">
        <p className="font-medium text-yellow-900">⚠️ Sin acceso aún</p>
        <p className="text-sm text-yellow-700">
          Asegúrate de compartir bases de datos con tu integración en Notion
        </p>
      </div>
    </div>
  );
}

