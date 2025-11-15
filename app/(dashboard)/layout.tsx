import Link from 'next/link';
import { Home, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/portals" className="font-bold text-xl">
              Portales Notion
            </Link>
            <nav className="flex gap-4">
              <Link href="/portals" className="text-sm text-muted-foreground hover:text-foreground">
                Mis Portales
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/portals/new">
                <Plus className="mr-1 h-4 w-4" />
                Nuevo Portal
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

