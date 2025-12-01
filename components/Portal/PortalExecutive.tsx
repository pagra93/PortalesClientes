import { PortalData } from '@/lib/publisher/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';
import { PortalTable } from './PortalTable';
import { Edit, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  data: PortalData;
  isEditing?: boolean;
  onConfigureSection?: (sectionKey: string) => void;
}

export function PortalExecutive({ data, isEditing, onConfigureSection }: Props) {
  const tasksSection = data.sections.tasks;
  const milestonesSection = data.sections.milestones;

  // Calcular métricas simples (Best effort)
  const totalTasks = tasksSection?.totalCount || 0;
  const completedTasks = tasksSection?.items.filter((t) => {
    // Try to find a status property
    const status = Object.values(t).find((v: any) => v?.type === 'status' || v?.label);
    if (status && typeof status === 'object' && 'label' in status) {
      return (status as any).label.toLowerCase().includes('complet') || (status as any).label.toLowerCase().includes('done');
    }
    return false;
  }).length || 0;

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative"
      style={{ '--primary': data.branding.primaryColor } as any}
    >
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{data.name}</h1>
              {data.lastSync && (
                <p className="text-sm text-muted-foreground mt-1">
                  Última actualización: {formatRelativeTime(data.lastSync)}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progreso general
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progress}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedTasks} de {totalTasks} tareas completadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tareas activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTasks - completedTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">En progreso o pendientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hitos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{milestonesSection?.totalCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total definidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Hitos */}
        <div className="relative group min-h-[200px] rounded-lg">
          <EditOverlay sectionKey="milestones" hasData={!!(milestonesSection && milestonesSection.items.length > 0)} />
          {milestonesSection && milestonesSection.items.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800">Hitos Clave</h2>
              <PortalTable columns={milestonesSection.columns} items={milestonesSection.items} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-12">
              <p className="text-slate-400 font-medium">Sección de Hitos (Vacía)</p>
            </div>
          )}
        </div>

        {/* Tareas recientes */}
        <div className="relative group min-h-[200px] rounded-lg">
          <EditOverlay sectionKey="tasks" hasData={!!(tasksSection && tasksSection.items.length > 0)} />
          {tasksSection && tasksSection.items.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800">Tareas del Proyecto</h2>
              <PortalTable columns={tasksSection.columns} items={tasksSection.items} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-12">
              <p className="text-slate-400 font-medium">Sección de Tareas (Vacía)</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t mt-12 py-8 bg-white text-center text-sm text-muted-foreground">
        <p>Portal generado con Notion Portals</p>
      </footer>
    </div>
  );
}

