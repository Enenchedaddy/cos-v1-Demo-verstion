import { describe, expect, it } from 'vitest';
import { PROVISIONING_ROLE_CODES } from './userProvisioning';

describe('controlled user provisioning contract', () => {
  it('permits only the five approved global role codes', () => {
    expect(PROVISIONING_ROLE_CODES).toEqual([
      'CEO',
      'MANAGEMENT',
      'SALES',
      'MARKETING',
      'SOFTWARE_ENGINEER',
    ]);
    expect(PROVISIONING_ROLE_CODES).not.toContain('ADMIN');
    expect(PROVISIONING_ROLE_CODES).not.toContain('SOFTWARE_LEAD');
    expect(PROVISIONING_ROLE_CODES).not.toContain('FRONTEND_ENGINEER');
  });
});
