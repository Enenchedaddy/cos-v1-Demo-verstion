import { describe, expect, it } from 'vitest';
import { classifyPortalDataError } from './usePortalData';

describe('portal data error states', () => {
  it('identifies authorization failures', () => {
    expect(classifyPortalDataError(new Error('new row violates row-level security policy'))).toBe('unauthorized');
  });

  it('identifies service failures', () => {
    expect(classifyPortalDataError(new Error('Failed to fetch'))).toBe('unavailable');
  });

  it('keeps unknown failures explicit', () => {
    expect(classifyPortalDataError(new Error('invalid input syntax'))).toBe('error');
  });
});
