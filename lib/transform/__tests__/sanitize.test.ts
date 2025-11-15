import { describe, it, expect } from 'vitest';
import { sanitizeRichText, detectPII, stripPII } from '../sanitize';

describe('sanitize', () => {
  it('remueve todo HTML por defecto', () => {
    const dirty = '<script>alert("xss")</script><b>Bold</b> text';
    const clean = sanitizeRichText(dirty);
    
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('<b>');
    expect(clean).toBe('Bold text');
  });

  it('permite formateo básico si se habilita', () => {
    const text = '<b>Bold</b> and <i>italic</i>';
    const clean = sanitizeRichText(text, { allowBasicFormatting: true });
    
    expect(clean).toContain('<b>Bold</b>');
    expect(clean).toContain('<i>italic</i>');
  });

  it('bloquea links a Notion', () => {
    const text = '<a href="https://notion.so/page">Link</a>';
    const clean = sanitizeRichText(text, { allowLinks: true });
    
    expect(clean).not.toContain('notion.so');
    expect(clean).not.toContain('<a');
  });

  it('detecta emails', () => {
    const result = detectPII('Contacto: test@example.com');
    expect(result.hasPII).toBe(true);
    expect(result.reason).toContain('email');
  });

  it('detecta links a Notion', () => {
    const result = detectPII('Ver en https://notion.so/workspace/page');
    expect(result.hasPII).toBe(true);
    expect(result.reason).toContain('Notion');
  });

  it('remueve PII de objetos', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      note: 'Check notion.so for details',
    };

    const cleaned = stripPII(data);

    expect(cleaned.name).toBe('John Doe');
    expect(cleaned.email).toBe('[REDACTED]');
    expect(cleaned.note).toBe('[REDACTED]');
  });
});

