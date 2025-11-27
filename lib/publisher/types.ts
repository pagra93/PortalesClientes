/**
 * Types para el sistema de publisher
 */

export type PortalSection = 
  | 'introduction'
  | 'contract'
  | 'invoices'
  | 'tasks'
  | 'client_details'
  | 'project_resources'
  | 'meetings'
  | 'account_access'
  | 'feedback'
  | 'milestones' // Keeping for backward compatibility if needed, though not in user list
  | 'history';   // Keeping for backward compatibility

export const PORTAL_SECTIONS: { key: PortalSection; label: string }[] = [
  { key: 'introduction', label: 'Introducción' },
  { key: 'contract', label: 'Contrato' },
  { key: 'invoices', label: 'Facturas' },
  { key: 'tasks', label: 'Tareas' },
  { key: 'client_details', label: 'Detalles del Cliente' },
  { key: 'project_resources', label: 'Recursos del Proyecto' },
  { key: 'meetings', label: 'Reuniones' },
  { key: 'account_access', label: 'Accesos a Cuentas' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'milestones', label: 'Hitos (Legacy)' },
  { key: 'history', label: 'Historial (Legacy)' },
];


export type PortalTemplate = 'executive' | 'operational';

export type PortalData = {
  id: string;
  name: string;
  template: PortalTemplate;
  branding: {
    logoUrl?: string;
    primaryColor: string;
  };
  sections: Record<PortalSection, SectionData>;
  lastSync: Date | null;
};

export type SectionData = {
  items: any[];
  columns: ColumnDef[];
  totalCount: number;
};

export type ColumnDef = {
  key: string;
  label: string;
  type: 'text' | 'status' | 'date' | 'number' | 'array';
  width?: string;
};

