import { describe, expect, it } from 'vitest';
import { isCeoApprovalAllowed, isInvitationAllowed } from './provisioningPolicy';

const ceo = { code: 'CEO' as const, name: 'Chief Executive Officer' };
const engineer = { code: 'SOFTWARE_ENGINEER' as const, name: 'Software Engineer' };
const sales = { code: 'SALES' as const, name: 'Sales' };

describe('controlled provisioning policy', () => {
  it('allows CEO approval without granting CEO invitation authority', () => {
    expect(isCeoApprovalAllowed(ceo, ['users.view', 'users.approve'], 'PENDING')).toBe(true);
    expect(isInvitationAllowed(ceo, ['users.view', 'users.approve'], 'READY_FOR_INVITATION', 'approved', 'approved')).toBe(false);
  });

  it('allows the technical administrator to send after CEO approval without a second approval', () => {
    expect(isInvitationAllowed(engineer, ['users.invite'], 'READY_FOR_INVITATION', 'approved', 'not_required')).toBe(true);
    expect(isInvitationAllowed(engineer, ['users.invite'], 'CEO_APPROVED', 'approved', 'pending')).toBe(true);
    expect(isInvitationAllowed(engineer, ['users.invite'], 'TECHNICAL_REJECTED', 'approved', 'rejected')).toBe(true);
  });

  it('does not grant Ahmed or business roles provisioning authority by role alone', () => {
    expect(isInvitationAllowed(engineer, [], 'READY_FOR_INVITATION', 'approved', 'not_required')).toBe(false);
    expect(isCeoApprovalAllowed(sales, ['users.approve'], 'PENDING')).toBe(false);
  });
});
