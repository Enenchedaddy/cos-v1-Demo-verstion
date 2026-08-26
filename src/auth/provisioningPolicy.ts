import type { AuthorizationRole } from './authorization';

export type ProvisioningRequestState =
  | 'PENDING'
  | 'CEO_APPROVED'
  | 'READY_FOR_INVITATION'
  | 'INVITATION_SENT'
  | 'ACCOUNT_ACTIVATED'
  | 'CEO_REJECTED'
  | 'TECHNICAL_REJECTED'
  | 'CANCELLED'
  | 'DISABLED';

export function isCeoApprovalAllowed(role: AuthorizationRole | null, permissions: readonly string[], status: string) {
  return role?.code === 'CEO' && permissions.includes('users.approve') && status === 'PENDING';
}

export function isTechnicalApprovalAllowed(role: AuthorizationRole | null, permissions: readonly string[], status: string) {
  return role?.code === 'SOFTWARE_ENGINEER'
    && permissions.includes('users.approve')
    && permissions.includes('users.invite')
    && status === 'CEO_APPROVED';
}

export function isInvitationAllowed(role: AuthorizationRole | null, permissions: readonly string[], status: string, ceoApproval: string, technicalApproval: string) {
  return role?.code === 'SOFTWARE_ENGINEER'
    && permissions.includes('users.invite')
    && status === 'READY_FOR_INVITATION'
    && ceoApproval === 'approved'
    && technicalApproval === 'approved';
}
