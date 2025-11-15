'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Step1Connect } from '@/components/PortalWizard/Step1Connect';
import { Step2Template } from '@/components/PortalWizard/Step2Template';
import { Step3Sources } from '@/components/PortalWizard/Step3Sources';
import { Step4Publish } from '@/components/PortalWizard/Step4Publish';

type WizardStep = 1 | 2 | 3 | 4;

export default function NewPortalPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(1);
  const [isConnected, setIsConnected] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | undefined>();
  const [wizardData, setWizardData] = useState<any>({});

  const handleConnect = () => {
    // Redirigir a OAuth
    window.location.href = '/api/notion/oauth';
  };

  const handleStep2 = (data: any) => {
    setWizardData((prev: any) => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleStep3 = (sources: any[]) => {
    setWizardData((prev: any) => ({ ...prev, sources }));
    setStep(4);
  };

  const handlePublish = async (syncFreq: number) => {
    setIsPublishing(true);

    try {
      // Crear portal en BD
      const response = await fetch('/api/portals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...wizardData,
          syncFreqMin: syncFreq,
          status: 'published',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al publicar portal');
      }

      const { portal } = await response.json();
      const url = `${window.location.origin}/p/${portal.publicToken}`;
      setPortalUrl(url);

      // Forzar primera sincronización
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalId: portal.id }),
      });

    } catch (error) {
      console.error('Error publicando portal:', error);
      alert('Error al publicar el portal. Inténtalo de nuevo.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Check conexión al cargar
  useState(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch('/api/notion/databases');
        if (res.ok) {
          setIsConnected(true);
        }
      } catch {
        // No conectado
      }
    };
    checkConnection();
  });

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Paso {step} de 4</p>
      </div>

      {/* Steps */}
      {step === 1 && (
        <Step1Connect
          isConnected={isConnected}
          onConnect={handleConnect}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2Template
          onNext={handleStep2}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <Step3Sources
          onNext={handleStep3}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <Step4Publish
          portalUrl={portalUrl}
          onPublish={handlePublish}
          onBack={() => setStep(3)}
          isPublishing={isPublishing}
        />
      )}
    </div>
  );
}

