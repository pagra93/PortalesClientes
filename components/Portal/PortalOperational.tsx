import { PortalData, PORTAL_SECTIONS } from '@/lib/publisher/types';
import { formatRelativeTime } from '@/lib/utils';
import { PortalTable } from './PortalTable';
import { Edit, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  data: PortalData;
  isEditing?: boolean;
  onConfigureSection?: (sectionKey: string) => void;
}

export function PortalOperational({ data, isEditing, onConfigureSection }: Props) {
  const EditOverlay = ({ sectionKey, hasData }: { sectionKey: string; hasData: boolean }) => {
    if (!isEditing) return null;
    return (
      <div
        className={cn(
          "absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-slate-900/10 hover:border-primary z-20",
          !hasData && "bg-slate-50 border-slate-300"
        )}
        onClick={() => onConfigureSection?.(sectionKey)}
      >
        <div className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2 text-sm font-medium text-primary">
          {hasData ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {hasData ? 'Editar configuración' : 'Conectar base de datos'}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-slate-50 relative"
      style={{ '--primary': data.branding.primaryColor } as any}
    >
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">{data.name}</h1>
          {data.lastSync && (
            <p className="text-sm text-muted-foreground mt-1">
              Última actualización: {formatRelativeTime(data.lastSync)}
            </p>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {PORTAL_SECTIONS.map((sectionDef) => {
          const sectionData = data.sections[sectionDef.key];
          const hasData = !!(sectionData && sectionData.items.length > 0);

          // In view mode, skip empty sections. In edit mode, show them.
          if (!isEditing && !hasData) return null;

          return (
            <div key={sectionDef.key} className="relative group min-h-[150px] rounded-lg">
              <EditOverlay sectionKey={sectionDef.key} hasData={hasData} />

              {hasData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">
                      {sectionDef.label}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({sectionData.totalCount})
                      </span>
                    </h2>
                  </div>
                  <PortalTable columns={sectionData.columns} items={sectionData.items} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-12">
                  <p className="text-slate-400 font-medium">Sección de {sectionDef.label} (Vacía)</p>
                </div>
              )}
            </div>
          );
        })}
      </main>

      <footer className="border-t mt-12 py-8 bg-white text-center text-sm text-muted-foreground">
        <p>Portal generado con Notion Portals</p>
      </footer>
    </div>
  );
}

