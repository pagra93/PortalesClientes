import { PortalData, PORTAL_SECTIONS } from '@/lib/publisher/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';

interface Props {
  data: PortalData;
}

export function PortalOperational({ data }: Props) {
  return (
    <div
      className="min-h-screen bg-background"
      style={{ '--primary': data.branding.primaryColor } as any}
    >
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">{data.name}</h1>
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

          // Skip if section has no data or is not configured
          if (!sectionData || sectionData.items.length === 0) return null;

          return (
            <Card key={sectionDef.key}>
              <CardHeader>
                <CardTitle>{sectionDef.label} ({sectionData.totalCount})</CardTitle>
              </CardHeader>
              <CardContent>
                {sectionDef.key === 'history' ? (
                  // Render History as List
                  <div className="space-y-3">
                    {sectionData.items.map((item) => (
                      <div key={item.id} className="border-b pb-3 last:border-0">
                        {Object.entries(item).map(([key, value]) => {
                          if (key === 'id') return null;
                          return (
                            <div key={key} className="text-sm">
                              <span className="font-medium">{key}:</span>{' '}
                              {renderCell(value, 'text')}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Render everything else as Table
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {sectionData.columns.map((col) => (
                            <th key={col.key} className="text-left p-2 font-medium text-muted-foreground">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sectionData.items.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-muted/50">
                            {sectionData.columns.map((col) => (
                              <td key={col.key} className="p-2">
                                {renderCell(item[col.key], col.type)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </main>

      <footer className="border-t mt-12 py-6 text-center text-sm text-muted-foreground">
        Portal generado desde Notion
      </footer>
    </div>
  );
}

function renderCell(value: any, type: string) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (type === 'status' && typeof value === 'object' && value.label) {
    return (
      <Badge
        style={{
          backgroundColor: getColorForStatus(value.color),
        }}
      >
        {value.label}
      </Badge>
    );
  }

  if (type === 'date' && typeof value === 'object' && value.start) {
    return <span>{value.start}</span>;
  }

  if (type === 'array' && Array.isArray(value)) {
    return <span>{value.join(', ')}</span>;
  }

  if (type === 'number') {
    return <span>{value}</span>;
  }

  return <span>{String(value)}</span>;
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

