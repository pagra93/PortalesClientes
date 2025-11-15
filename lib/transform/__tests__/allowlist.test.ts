import { describe, it, expect } from 'vitest';
import { transformWithAllowlist, validateAllowlist } from '../allowlist';

describe('allowlist', () => {
  it('solo incluye propiedades permitidas', () => {
    const mockItem = {
      id: 'test-123',
      properties: {
        Name: { type: 'title', title: [{ plain_text: 'Test Task' }] },
        Status: { type: 'select', select: { name: 'In Progress' } },
        Email: { type: 'email', email: 'secret@example.com' },
      },
    } as any;

    const allowlist = [
      { notionKey: 'Name', displayName: 'Nombre', type: 'title' },
      { notionKey: 'Status', displayName: 'Estado', type: 'select' },
    ];

    const result = transformWithAllowlist(mockItem, allowlist);

    expect(result.properties).toHaveProperty('Nombre');
    expect(result.properties).toHaveProperty('Estado');
    expect(result.properties).not.toHaveProperty('Email');
  });

  it('filtra emails automáticamente', () => {
    const mockItem = {
      id: 'test-123',
      properties: {
        ContactEmail: { type: 'email', email: 'secret@example.com' },
      },
    } as any;

    const allowlist = [
      { notionKey: 'ContactEmail', displayName: 'Email', type: 'email' },
    ];

    const result = transformWithAllowlist(mockItem, allowlist);

    // Los emails siempre retornan null por seguridad
    expect(result.properties.Email).toBeNull();
  });

  it('valida allowlist correcta', () => {
    const valid = [
      { notionKey: 'Name', displayName: 'Nombre', type: 'title' },
    ];

    expect(validateAllowlist(valid)).toBe(true);
  });

  it('rechaza allowlist inválida', () => {
    const invalid = [
      { notionKey: 'Name' }, // Falta displayName y type
    ];

    expect(validateAllowlist(invalid)).toBe(false);
  });
});

