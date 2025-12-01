/**
 * Types para el sistema de publisher
 */

export type PortalSection =
  | 'tasks'
  | 'milestones'
  | 'history';

export const PORTAL_SECTIONS: { key: PortalSection; label: string }[] = [
  { key: 'tasks', label: 'Tareas' },
  { key: 'milestones', label: 'Hitos' },
  { key: 'history', label: 'Historial' },
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

