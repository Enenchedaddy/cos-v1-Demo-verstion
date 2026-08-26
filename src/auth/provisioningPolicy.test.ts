import { describe, expect, it } from 'vitest';
import { isCeoApprovalAllowed, isInvitationAllowed, isTechnicalApprovalAllowed } from './provisioningPolicy';

const ceo = { code: 'CEO' as const, name: 'Chief Executive Officer' };
const engineer = { code: 'SOFTWARE_ENGINEER' as const, name: 'Software Engineer' };
const sales = { code: 'SALES' as const, name: 'Sales' };

describe('dual-approval provisioning policy', () => {
  it('allows CEO approval but never CEO invitation', () => {
    expect(isCeoApprovalAllowed(ceo, ['users.view', 'users.approve'], 'PENDING')).toBe(true);
    expect(isInvitationAllowed(ceo, ['users.view', 'users.approve'], 'READY_FOR_INVITATION', 'approved', 'approved')).toBe(false);
  });

  it('requires CEO approval before technical approval', () => {
    expect(isTechnicalApprovalAllowed(engineer, ['users.approve', 'users.invite'], 'PENDING')).toBe(false);
    expect(isTechnicalApprovalAllowed(engineer, ['users.approve', 'users.invite'], 'CEO_APPROVED')).toBe(true);
  });

  it('allows invitation only after both approvals', () => {
    expect(isInvitationAllowed(engineer, ['users.invite'], 'READY_FOR_INVITATION', 'approved', 'approved')).toBe(true);
    expect(isInvitationAllowed(engineer, ['users.invite'], 'READY_FOR_INVITATION', 'approved', 'pending')).toBe(false);
  });

  it('does not grant Ahmed or business roles provisioning authority by role alone', () => {
    expect(isTechnicalApprovalAllowed(engineer, [], 'CEO_APPROVED')).toBe(false);
    expect(isCeoApprovalAllowed(sales, ['users.approve'], 'PENDING')).toBe(false);
  });
});
