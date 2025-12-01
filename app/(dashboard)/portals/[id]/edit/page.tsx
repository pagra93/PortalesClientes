'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Step3Sources } from '@/components/PortalWizard/Step3Sources';
import { Loader2 } from 'lucide-react';

export default function EditPortalPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [portal, setPortal] = useState<any>(null);

    useEffect(() => {
        loadPortal();
    }, []);

    const loadPortal = async () => {
        try {
            // In a real app, we would have a specific endpoint for getting portal details for editing
            // For now, we'll fetch the list and find the one we need, or assume we can get it via an API
            // Let's assume we have an endpoint GET /api/portals/[id]
            const res = await fetch(`/api/portals/${params.id}`);
            if (!res.ok) throw new Error('Portal not found');

            const data = await res.json();
            setPortal(data.portal);
        } catch (error) {
            console.error('Error loading portal:', error);
            alert('Error cargando el portal');
            router.push('/portals');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (sources: any[]) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/portals/${params.id}`, {
                method: 'PATCH', // Assuming PATCH for updates
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sources: sources.map((s) => ({
                        section: s.section,
                        notionDbId: s.notionDbId,
                        filterJson: s.filterJson,
                        allowlistJson: JSON.stringify(s.allowlist.map((propName: string) => ({
                            notionKey: propName,
                            displayName: propName,
                            type: 'text',
                        }))),
                        mappingsJson: JSON.stringify({}),
                    })),
                }),
            });

            if (!res.ok) throw new Error('Failed to update portal');

            // Trigger sync to update content
            await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ portalId: params.id }),
            });

            router.push('/portals');
            router.refresh();
        } catch (error) {
            console.error('Error updating portal:', error);
            alert('Error guardando los cambios');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!portal) return null;

    // Transform portal data to match wizard format
    const wizardData = {
        name: portal.name,
        template: portal.template,
        branding: typeof portal.branding === 'string' ? JSON.parse(portal.branding) : portal.branding,
    };

    return (
        <div className="container mx-auto py-8 max-w-5xl">
            <Step3Sources
                wizardData={wizardData}
                onNext={handleSave}
                onBack={() => router.push('/portals')}
            />
        </div>
    );
}
