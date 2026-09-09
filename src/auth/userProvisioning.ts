import { supabase } from '../supabaseClient';

export const PROVISIONING_ROLE_CODES = ['CEO', 'MANAGEMENT', 'SALES', 'MARKETING', 'SOFTWARE_ENGINEER'] as const;
export type ProvisioningRoleCode = typeof PROVISIONING_ROLE_CODES[number];
export type ProvisioningAction =
  | 'list_requests' | 'list_users' | 'create_request' | 'approve_ceo'
  | 'reject_ceo'
  | 'cancel_request' | 'send_invitation' | 'resend_invitation'
  | 'activate_invitation' | 'update_profile' | 'change_role'
  | 'disable_user' | 'enable_user';

export interface ProvisioningRequest {
  id: string;
  requested_email: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  department: string | null;
  status: string;
  ceo_approval_status: 'pending' | 'approved' | 'rejected';
  ceo_approved_at: string | null;
  technical_approval_status: 'pending' | 'approved' | 'rejected' | 'not_required';
  technical_approved_at: string | null;
  invitation_status: 'not_sent' | 'sent' | 'accepted';
  invited_at: string | null;
  created_at: string;
  requested_role: { code: ProvisioningRoleCode; name: string } | null;
}

export interface ProvisionedUser {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  department: string | null;
  status: 'invited' | 'active' | 'suspended' | 'disabled';
  role: { code: ProvisioningRoleCode; name: string } | null;
  created_at: string;
}

interface ProvisioningResponse<T> { data: T; requestId: string }

type ProvisioningFailureCode = 'INVITATION_CONFIGURATION_INVALID' | 'INVITATION_DELIVERY_FAILED';

function failureMessage(code: unknown, requestId: string | null) {
  const reference = requestId ? ` Reference: ${requestId}` : '';
  if (code === 'INVITATION_CONFIGURATION_INVALID') {
    return `The invitation service needs configuration attention. The request was not changed.${reference}`;
  }
  if (code === 'INVITATION_DELIVERY_FAILED') {
    return `Invitation could not be sent. The request was not changed.${reference}`;
  }
  return requestId
    ? `The provisioning action was rejected. Reference: ${requestId}`
    : 'The user-provisioning service is unavailable or rejected this request.';
}

export async function provisioningError(error: unknown) {
  const context = error && typeof error === 'object' ? (error as { context?: unknown }).context : null;
  if (!context || typeof context !== 'object' || !('clone' in context) || typeof context.clone !== 'function') {
    return new Error('The user-provisioning service is unavailable or rejected this request.');
  }

  try {
    const body = await (context as Response).clone().json() as { requestId?: unknown; code?: unknown };
    const requestId = typeof body.requestId === 'string' ? body.requestId : null;
    const code: ProvisioningFailureCode | null = body.code === 'INVITATION_CONFIGURATION_INVALID' || body.code === 'INVITATION_DELIVERY_FAILED'
      ? body.code
      : null;
    return new Error(failureMessage(code, requestId));
  } catch {
    return new Error('The user-provisioning service is unavailable or rejected this request.');
  }
}

export async function invokeProvisioning<T>(action: ProvisioningAction, input: Record<string, unknown> = {}): Promise<ProvisioningResponse<T>> {
  const { data, error } = await supabase.functions.invoke<ProvisioningResponse<T>>('admin-user-provisioning', { body: { action, ...input } });
  if (error) throw await provisioningError(error);
  if (!data || !('data' in data)) throw new Error('The user-provisioning service returned an invalid response.');
  return data;
}

export const listProvisioningRequests = () => invokeProvisioning<ProvisioningRequest[]>('list_requests');
export const listProvisionedUsers = () => invokeProvisioning<ProvisionedUser[]>('list_users');
export const activateOwnInvitation = () => invokeProvisioning<{ activated: boolean }>('activate_invitation');
