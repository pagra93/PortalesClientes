import { PortalData } from '@/lib/publisher/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';

interface Props {
  data: PortalData;
}

export function PortalExecutive({ data }: Props) {
  const tasksSection = data.sections.tasks;
  const milestonesSection = data.sections.milestones;

  // Calcular métricas simples
  const totalTasks = tasksSection?.totalCount || 0;
  const completedTasks = tasksSection?.items.filter(
    (t) => t.Estado?.label?.toLowerCase().includes('complet')
  ).length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"
      style={{ '--primary': data.branding.primaryColor } as any}
    >
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">{data.name}</h1>
          {data.lastSync && (
            <p className="text-sm text-muted-foreground mt-1">
              Última actualización: {formatRelativeTime(data.lastSync)}
            </p>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
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
                {completedTasks} de {totalTasks} tareas
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
        {milestonesSection && milestonesSection.items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Hitos clave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestonesSection.items.slice(0, 5).map((milestone) => (
                  <div key={milestone.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <h3 className="font-medium">{milestone.Nombre || milestone.Título || 'Sin título'}</h3>
                      {milestone.Fecha && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {milestone.Fecha.start}
                        </p>
                      )}
                    </div>
                    {milestone.Estado && (
                      <Badge
                        style={{
                          backgroundColor: getColorForStatus(milestone.Estado.color),
                        }}
                      >
                        {milestone.Estado.label}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tareas recientes */}
        {tasksSection && tasksSection.items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tareas recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasksSection.items.slice(0, 10).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {task.Nombre || task.Título || task.Tarea || 'Sin título'}
                      </p>
                    </div>
                    {task.Estado && (
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: getColorForStatus(task.Estado.color),
                          color: getColorForStatus(task.Estado.color),
                        }}
                      >
                        {task.Estado.label}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="border-t mt-12 py-6 text-center text-sm text-muted-foreground">
        Portal generado desde Notion
      </footer>
    </div>
  );
}

function getColorForStatus(color: string): string {
  const colorMap: Record<string, string> = {
    gray: '#6b7280',
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    orange: '#f97316',
  };
  return colorMap[color] || colorMap.gray;
}

