'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { PORTAL_SECTIONS, PortalSection, PortalData } from '@/lib/publisher/types';
import { PortalExecutive } from '@/components/Portal/PortalExecutive';
import { PortalOperational } from '@/components/Portal/PortalOperational';

// --- Interfaces ---
interface Database {
  id: string;
  title: string;
}

interface Property {
  name: string;
  type: string;
  id: string;
  options?: { id: string; name: string; color: string }[];
}

interface SourceConfig {
  section: PortalSection;
  notionDbId: string;
  allowlist: string[];
  filterJson?: any;
}

interface Step3Props {
  wizardData: any;
  initialSources?: any[]; // Add this prop
  onNext: (sources: SourceConfig[]) => void;
  onBack: () => void;
}

export function Step3Sources({ wizardData, initialSources, onNext, onBack }: Step3Props) {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [loading, setLoading] = useState(true);

  // Configuration State
  const [sources, setSources] = useState<Record<string, SourceConfig>>({});
  const [propertiesCache, setPropertiesCache] = useState<Record<string, Property[]>>({});

  // UI State
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Temporary state for the modal
  const [tempDbId, setTempDbId] = useState('');
  const [tempProps, setTempProps] = useState<string[]>([]);
  const [tempFilter, setTempFilter] = useState<{ property: string; value: string }>({ property: '', value: '' });

  useEffect(() => {
    loadDatabases();
  }, []);

  // Load initial sources if editing
  useEffect(() => {
    if (initialSources && initialSources.length > 0 && databases.length > 0) {
      const loadedSources: Record<string, SourceConfig> = {};

      initialSources.forEach(s => {
        // Parse JSONs if they come from DB
        const allowlist = typeof s.allowlistJson === 'string'
          ? JSON.parse(s.allowlistJson).map((p: any) => p.notionKey || p.displayName) // Adapt based on storage format
          : s.allowlist || [];

        const filterJson = typeof s.filterJson === 'string'
          ? JSON.parse(s.filterJson)
          : s.filterJson || {};

        loadedSources[s.section] = {
          section: s.section as PortalSection,
          notionDbId: s.notionDbId,
          allowlist,
          filterJson
        };

        // Pre-load properties for these databases
        loadProperties(s.notionDbId);
      });

      setSources(loadedSources);
    }
  }, [initialSources, databases]);

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

  const loadProperties = async (dbId: string) => {
    if (propertiesCache[dbId]) return propertiesCache[dbId];
    try {
      const res = await fetch(`/api/notion/database/${dbId}/properties`);
      const data = await res.json();
      setPropertiesCache(prev => ({ ...prev, [dbId]: data.properties || [] }));
      return data.properties || [];
    } catch (error) {
      console.error('Error loading properties:', error);
      return [];
    }
  };

  const handleConfigureSection = (sectionKey: string) => {
    setActiveSection(sectionKey);
    const currentConfig = sources[sectionKey];

    if (currentConfig) {
      setTempDbId(currentConfig.notionDbId);
      setTempProps(currentConfig.allowlist);
      // Restore filter if possible (simplified)
      setTempFilter({ property: '', value: '' });
      loadProperties(currentConfig.notionDbId);
    } else {
      setTempDbId('');
      setTempProps([]);
      setTempFilter({ property: '', value: '' });
    }

    setIsConfigOpen(true);
  };

  const handleDbSelect = async (dbId: string) => {
    setTempDbId(dbId);
    setTempProps([]);
    setTempFilter({ property: '', value: '' });
    await loadProperties(dbId);
  };

  const toggleProperty = (propName: string) => {
    setTempProps(prev =>
      prev.includes(propName)
        ? prev.filter(p => p !== propName)
        : [...prev, propName]
    );
  };

  const saveConfiguration = () => {
    if (!activeSection || !tempDbId) return;

    let filterJson = {};
    const dbProps = propertiesCache[tempDbId] || [];

    if (tempFilter.property && tempFilter.value) {
      const prop = dbProps.find((p) => p.name === tempFilter.property);
      if (prop) {
        if (['select', 'status', 'multi_select'].includes(prop.type)) {
          filterJson = { property: tempFilter.property, [prop.type]: { equals: tempFilter.value } };
        } else {
          filterJson = { property: tempFilter.property, rich_text: { equals: tempFilter.value } };
        }
      }
    }

    setSources(prev => ({
      ...prev,
      [activeSection]: {
        section: activeSection as PortalSection,
        notionDbId: tempDbId,
        allowlist: tempProps,
        filterJson
      }
    }));

    setIsConfigOpen(false);
  };

  const handleNext = () => {
    const configList = Object.values(sources);
    if (configList.length === 0) {
      alert('Debes configurar al menos una sección');
      return;
    }
    onNext(configList);
  };

  // Generate preview data
  const previewData: PortalData = {
    id: 'preview',
    name: wizardData.name || 'Portal Preview',
    template: wizardData.template,
    branding: wizardData.branding || { primaryColor: '#3b82f6' },
    lastSync: null,
    sections: {
      tasks: sources['tasks'] ? {
        items: [{ id: '1', Tarea: 'Ejemplo Tarea', Estado: { label: 'En Progreso', color: 'blue' } }],
        columns: sources['tasks'].allowlist.map(k => ({ key: k, label: k, type: 'text' })),
        totalCount: 1
      } : { items: [], columns: [], totalCount: 0 },
      milestones: sources['milestones'] ? {
        items: [{ id: '1', Nombre: 'Hito Ejemplo', Fecha: { start: '2024-01-01' } }],
        columns: sources['milestones'].allowlist.map(k => ({ key: k, label: k, type: 'text' })),
        totalCount: 1
      } : { items: [], columns: [], totalCount: 0 },
      history: { items: [], columns: [], totalCount: 0 }
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Diseña tu portal</h2>
          <p className="text-muted-foreground">
            Haz clic en las secciones para conectar tus datos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Atrás</Button>
          <Button onClick={handleNext}>Publicar Portal</Button>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden shadow-lg bg-slate-50 relative min-h-[600px]">
        {wizardData.template === 'executive' ? (
          <PortalExecutive data={previewData} isEditing={true} onConfigureSection={handleConfigureSection} />
        ) : (
          <PortalOperational data={previewData} isEditing={true} onConfigureSection={handleConfigureSection} />
        )}
      </div>

      {/* Configuration Modal */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurar Sección: {PORTAL_SECTIONS.find(s => s.key === activeSection)?.label}</DialogTitle>
            <DialogDescription>Conecta una base de datos de Notion y selecciona qué mostrar.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Base de datos</Label>
              <Select value={tempDbId} onValueChange={handleDbSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una base de datos" />
                </SelectTrigger>
                <SelectContent>
                  {databases.map(db => (
                    <SelectItem key={db.id} value={db.id}>{db.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tempDbId && propertiesCache[tempDbId] && (
              <>
                <div className="space-y-2">
                  <Label>Propiedades visibles</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-[150px] overflow-y-auto">
                    {propertiesCache[tempDbId].map(prop => (
                      <Badge
                        key={prop.id}
                        variant={tempProps.includes(prop.name) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleProperty(prop.name)}
                      >
                        {prop.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Filtrar por propiedad</Label>
                    <Select
                      value={tempFilter.property}
                      onValueChange={(val) => setTempFilter(prev => ({ ...prev, property: val }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Sin filtro --</SelectItem>
                        {propertiesCache[tempDbId]
                          .filter(p => ['select', 'status', 'multi_select'].includes(p.type))
                          .map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                  </div>

                  {tempFilter.property && tempFilter.property !== 'none' && (
                    <div className="space-y-2">
                      <Label>Valor del filtro</Label>
                      <Select
                        value={tempFilter.value}
                        onValueChange={(val) => setTempFilter(prev => ({ ...prev, value: val }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecciona valor" /></SelectTrigger>
                        <SelectContent>
                          {propertiesCache[tempDbId]
                            .find(p => p.name === tempFilter.property)
                            ?.options?.map(opt => (
                              <SelectItem key={opt.id} value={opt.name}>{opt.name}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigOpen(false)}>Cancelar</Button>
            <Button onClick={saveConfiguration} disabled={!tempDbId || tempProps.length === 0}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
