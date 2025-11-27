'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { PORTAL_SECTIONS, PortalSection } from '@/lib/publisher/types';

interface Database {
  id: string;
  title: string;
}

interface Property {
  name: string;
  type: string;
  id: string;
}

interface SourceConfig {
  section: PortalSection;
  notionDbId: string;
  allowlist: string[];
}

interface Step3Props {
  onNext: (sources: SourceConfig[]) => void;
  onBack: () => void;
}

export function Step3Sources({ onNext, onBack }: Step3Props) {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize state dynamically based on PORTAL_SECTIONS
  const [selectedDbs, setSelectedDbs] = useState<Record<string, string>>(() =>
    PORTAL_SECTIONS.reduce((acc, curr) => ({ ...acc, [curr.key]: '' }), {})
  );

  const [properties, setProperties] = useState<Record<string, Property[]>>({});

  const [selectedProps, setSelectedProps] = useState<Record<string, string[]>>(() =>
    PORTAL_SECTIONS.reduce((acc, curr) => ({ ...acc, [curr.key]: [] }), {})
  );

  useEffect(() => {
    loadDatabases();
  }, []);

  const loadDatabases = async () => {
    try {
      const res = await fetch('/api/notion/databases');
      const data = await res.json();
      setDatabases(data.databases || []);
    } catch (error) {
      console.error('Error loading databases:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async (dbId: string, section: string) => {
    try {
      const res = await fetch(`/api/notion/database/${dbId}/properties`);
      const data = await res.json();
      setProperties((prev) => ({ ...prev, [section]: data.properties || [] }));
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const handleDbSelect = (section: string, dbId: string) => {
    setSelectedDbs((prev) => ({ ...prev, [section]: dbId }));
    setSelectedProps((prev) => ({ ...prev, [section]: [] }));
    loadProperties(dbId, section);
  };

  const toggleProperty = (section: string, propName: string) => {
    setSelectedProps((prev) => {
      const current = prev[section] || [];
      const updated = current.includes(propName)
        ? current.filter((p) => p !== propName)
        : [...current, propName];
      return { ...prev, [section]: updated };
    });
  };

  const handleNext = () => {
    const sources: SourceConfig[] = [];

    for (const section of PORTAL_SECTIONS) {
      const key = section.key;
      if (selectedDbs[key] && selectedProps[key]?.length > 0) {
        sources.push({
          section: key,
          notionDbId: selectedDbs[key],
          allowlist: selectedProps[key],
        });
      }
    }

    if (sources.length === 0) {
      alert('Debes configurar al menos una sección');
      return;
    }

    onNext(sources);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Paso 3: Fuentes de datos</h2>
        <p className="text-muted-foreground mt-1">
          Asigna bases de datos a cada sección y selecciona qué campos mostrar
        </p>
      </div>

      <div className="grid gap-6">
        {PORTAL_SECTIONS.map((section) => (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle>{section.label}</CardTitle>
              <CardDescription>
                Base de datos y propiedades para la sección de {section.label}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Base de datos de Notion</Label>
                <Select
                  value={selectedDbs[section.key]}
                  onValueChange={(val) => handleDbSelect(section.key, val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una base de datos" />
                  </SelectTrigger>
                  <SelectContent>
                    {databases.map((db) => (
                      <SelectItem key={db.id} value={db.id}>
                        {db.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDbs[section.key] && properties[section.key] && (
                <div className="space-y-2">
                  <Label>Propiedades permitidas (allowlist)</Label>
                  <p className="text-xs text-muted-foreground">
                    Solo las propiedades seleccionadas serán visibles en el portal
                  </p>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
                    {properties[section.key].map((prop) => (
                      <Badge
                        key={prop.name}
                        variant={selectedProps[section.key]?.includes(prop.name) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleProperty(section.key, prop.name)}
                      >
                        {prop.name} ({prop.type})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Atrás
        </Button>
        <Button onClick={handleNext} size="lg">
          Continuar →
        </Button>
      </div>
    </div>
  );
}

