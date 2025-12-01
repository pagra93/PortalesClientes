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
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div
            onClick={() => setTemplate('executive')}
            className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:border-primary/50 ${template === 'executive' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
          >
            <div className="aspect-video bg-slate-100 rounded-md mb-3 overflow-hidden border">
              {/* Miniatura Ejecutiva */}
              <div className="w-full h-full p-2 space-y-2 opacity-50">
                <div className="h-8 bg-white rounded shadow-sm w-full" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-16 bg-white rounded shadow-sm" />
                  <div className="h-16 bg-white rounded shadow-sm" />
                  <div className="h-16 bg-white rounded shadow-sm" />
                </div>
                <div className="h-20 bg-white rounded shadow-sm w-full" />
              </div>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">Ejecutiva</h3>
                <p className="text-sm text-muted-foreground">KPIs y resumen de alto nivel</p>
              </div>
              {template === 'executive' && <CheckCircle2 className="h-5 w-5 text-primary" />}
            </div>
          </div>

          <div
            onClick={() => setTemplate('operational')}
            className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:border-primary/50 ${template === 'operational' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
          >
            <div className="aspect-video bg-slate-100 rounded-md mb-3 overflow-hidden border">
              {/* Miniatura Operativa */}
              <div className="w-full h-full p-2 space-y-2 opacity-50">
                <div className="h-8 bg-white rounded shadow-sm w-full" />
                <div className="h-40 bg-white rounded shadow-sm w-full" />
              </div>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">Operativa</h3>
                <p className="text-sm text-muted-foreground">Listas detalladas y documentación</p>
              </div>
              {template === 'operational' && <CheckCircle2 className="h-5 w-5 text-primary" />}
            </div>
          </div>
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

