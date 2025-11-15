import { notFound } from 'next/navigation';
import { getPortalData } from '@/lib/publisher/renderer';
import { PortalExecutive } from '@/components/Portal/PortalExecutive';
import { PortalOperational } from '@/components/Portal/PortalOperational';

export const revalidate = 300; // 5 minutos de ISR por defecto

// Metadatos para SEO (noindex)
export async function generateMetadata({ params }: { params: { token: string } }) {
  const portalData = await getPortalData(params.token);

  if (!portalData) {
    return {
      title: 'Portal no encontrado',
      robots: 'noindex,nofollow',
    };
  }

  return {
    title: portalData.name,
    robots: 'noindex,nofollow',
  };
}

export default async function PortalPage({ params }: { params: { token: string } }) {
  const portalData = await getPortalData(params.token);

  if (!portalData) {
    notFound();
  }

  return (
    <>
      {/* Headers de seguridad adicionales */}
      <meta name="robots" content="noindex,nofollow" />
      
      {portalData.template === 'executive' ? (
        <PortalExecutive data={portalData} />
      ) : (
        <PortalOperational data={portalData} />
      )}
    </>
  );
}

