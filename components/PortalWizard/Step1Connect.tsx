'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionStatus } from './ConnectionStatus';

interface Step1Props {
  isConnected: boolean;
  onConnect: () => void;
  onNext: () => void;
}

export function Step1Connect({ isConnected, onConnect, onNext }: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Paso 1: Verificar Conexión</h2>
        <p className="text-muted-foreground mt-1">
          Tu integración de Notion ya está configurada
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado de la conexión</CardTitle>
          <CardDescription>
            Verifica que tu integración tiene acceso a las bases de datos de Notion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConnectionStatus />

          {!isConnected && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-blue-900 mb-2">💡 ¿No ves tus bases de datos?</p>
              <ol className="text-blue-800 space-y-1 list-decimal list-inside">
                <li>Ve a tu página de Notion que quieras conectar</li>
                <li>Click en los 3 puntos (•••) → "Connections" o "Conexiones"</li>
                <li>Busca y selecciona "Portal web clientes"</li>
                <li>Confirma para compartir la página</li>
                <li>Recarga esta página</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          Continuar →
        </Button>
      </div>
    </div>
  );
}

