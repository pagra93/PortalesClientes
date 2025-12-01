import { Badge } from '@/components/ui/badge';

interface Column {
    key: string;
    label: string;
    type: 'text' | 'status' | 'date' | 'number' | 'array';
}

interface Props {
    columns: Column[];
    items: any[];
}

export function PortalTable({ columns, items }: Props) {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-slate-50 text-muted-foreground">
                No hay datos disponibles en esta sección
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className="px-4 py-3 whitespace-nowrap">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                {columns.map((col) => (
                                    <td key={`${item.id}-${col.key}`} className="px-4 py-3 align-top">
                                        <CellContent value={item[col.key]} type={col.type} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function CellContent({ value, type }: { value: any; type: string }) {
    if (value === null || value === undefined || value === '') {
        return <span className="text-slate-300">-</span>;
    }

    if (type === 'status') {
        // Handle Notion status/select objects
        const label = value.label || value.name || value;
        const color = value.color || 'default';

        return (
            <Badge
                variant="outline"
                className="font-normal"
                style={{
                    borderColor: getColor(color),
                    color: getColor(color),
                    backgroundColor: getColor(color) + '10', // 10% opacity
                }}
            >
                {label}
            </Badge>
        );
    }

    if (type === 'date') {
        if (typeof value === 'object' && value.start) {
            return <span className="whitespace-nowrap">{value.start}</span>;
        }
        return <span className="whitespace-nowrap">{String(value)}</span>;
    }

    if (type === 'array') {
        if (Array.isArray(value)) {
            if (value.length === 0) return <span className="text-slate-300">-</span>;
            return (
                <div className="flex gap-1 flex-wrap">
                    {value.map((v: any, i) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-600 hover:bg-slate-200">
                            {v.name || v.title || String(v)}
                        </Badge>
                    ))}
                </div>
            );
        }
    }

    // Default text
    return <span className="text-slate-700">{String(value)}</span>;
}

function getColor(color: string): string {
    const colorMap: Record<string, string> = {
        default: '#64748b',
        gray: '#6b7280',
        brown: '#a16207',
        orange: '#f97316',
        yellow: '#eab308',
        green: '#10b981',
        blue: '#3b82f6',
        purple: '#a855f7',
        pink: '#ec4899',
        red: '#ef4444',
    };
    return colorMap[color] || colorMap.default;
}
