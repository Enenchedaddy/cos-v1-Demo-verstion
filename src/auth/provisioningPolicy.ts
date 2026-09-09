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

export function isInvitationAllowed(role: AuthorizationRole | null, permissions: readonly string[], status: string, ceoApproval: string, technicalApproval: string) {
  if (role?.code !== 'SOFTWARE_ENGINEER' || !permissions.includes('users.invite') || ceoApproval !== 'approved') return false;
  return (status === 'READY_FOR_INVITATION' && ['approved', 'not_required'].includes(technicalApproval))
    || (status === 'CEO_APPROVED' && technicalApproval === 'pending')
    || (status === 'TECHNICAL_REJECTED' && technicalApproval === 'rejected');
}
