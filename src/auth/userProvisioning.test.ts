import { describe, expect, it } from 'vitest';
import { PROVISIONING_ROLE_CODES, provisioningError } from './userProvisioning';

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

  it('maps invitation failures to safe messages without backend details', async () => {
    const error = await provisioningError({
      context: new Response(JSON.stringify({
        code: 'INVITATION_DELIVERY_FAILED',
        requestId: '00000000-0000-4000-8000-000000000001',
      })),
    });

    expect(error.message).toBe('Invitation could not be sent. The request was not changed. Reference: 00000000-0000-4000-8000-000000000001');
  });
});
