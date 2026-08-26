import { supabase } from '../supabaseClient';

export const PROVISIONING_ROLE_CODES = ['CEO', 'MANAGEMENT', 'SALES', 'MARKETING', 'SOFTWARE_ENGINEER'] as const;
export type ProvisioningRoleCode = typeof PROVISIONING_ROLE_CODES[number];
export type ProvisioningAction =
  | 'list_requests' | 'list_users' | 'create_request' | 'approve_ceo'
  | 'reject_ceo' | 'approve_technical' | 'reject_technical'
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
  technical_approval_status: 'pending' | 'approved' | 'rejected';
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

export async function invokeProvisioning<T>(action: ProvisioningAction, input: Record<string, unknown> = {}): Promise<ProvisioningResponse<T>> {
  const { data, error } = await supabase.functions.invoke<ProvisioningResponse<T>>('admin-user-provisioning', { body: { action, ...input } });
  if (error || !data || !('data' in data)) throw new Error('The user-provisioning service is unavailable or rejected this request.');
  return data;
}

export const listProvisioningRequests = () => invokeProvisioning<ProvisioningRequest[]>('list_requests');
export const listProvisionedUsers = () => invokeProvisioning<ProvisionedUser[]>('list_users');
export const activateOwnInvitation = () => invokeProvisioning<{ activated: boolean }>('activate_invitation');
