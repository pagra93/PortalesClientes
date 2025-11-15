'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2 } from 'lucide-react';

interface Step2Props {
  onNext: (data: {
    name: string;
    template: 'executive' | 'operational';
    branding: { logoUrl?: string; primaryColor: string };
  }) => void;
  onBack: () => void;
}

export function Step2Template({ onNext, onBack }: Step2Props) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState<'executive' | 'operational'>('executive');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');

  const handleNext = () => {
    if (!name.trim()) return;
    
    onNext({
      name,
      template,
      branding: { primaryColor },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Paso 2: Configuración básica</h2>
        <p className="text-muted-foreground mt-1">
          Elige plantilla y personaliza el branding del portal
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del portal</CardTitle>
          <CardDescription>Nombre interno para identificar este portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="portal-name">Nombre del portal</Label>
            <Input
              id="portal-name"
              placeholder="Ej: Portal Cliente Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plantilla</CardTitle>
          <CardDescription>Selecciona el tipo de vista que mejor se adapte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            type="button"
            onClick={() => setTemplate('executive')}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              template === 'executive'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-3">
              {template === 'executive' && <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />}
              <div className="flex-1">
                <h3 className="font-semibold">Ejecutiva</h3>
                <p className="text-sm text-muted-foreground">
                  Vista simplificada con métricas clave, hitos y resumen de progreso
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTemplate('operational')}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              template === 'operational'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-3">
              {template === 'operational' && <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />}
              <div className="flex-1">
                <h3 className="font-semibold">Operativa</h3>
                <p className="text-sm text-muted-foreground">
                  Vista detallada con todas las tareas, historial de cambios y documentación
                </p>
              </div>
            </div>
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Personaliza los colores del portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="primary-color">Color primario</Label>
            <div className="flex gap-3">
              <Input
                id="primary-color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input value={primaryColor} readOnly className="flex-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Atrás
        </Button>
        <Button onClick={handleNext} disabled={!name.trim()} size="lg">
          Continuar →
        </Button>
      </div>
    </div>
  );
}

