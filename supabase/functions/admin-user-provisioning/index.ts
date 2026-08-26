import { createClient } from 'jsr:@supabase/supabase-js@2';

type RoleCode = 'CEO' | 'MANAGEMENT' | 'SALES' | 'MARKETING' | 'SOFTWARE_ENGINEER';
type Action = 'list_requests' | 'list_users' | 'create_request' | 'approve_ceo' | 'reject_ceo' | 'approve_technical' | 'reject_technical' | 'cancel_request' | 'send_invitation' | 'resend_invitation' | 'activate_invitation' | 'update_profile' | 'change_role' | 'disable_user' | 'enable_user';
type RequestRow = { id: string; requested_by_user_id: string; requested_email: string; first_name: string; last_name: string; requested_role_id: string; status: string; ceo_approval_status: string; technical_approval_status: string; invitation_status: string; auth_user_id: string | null };
type Authorization = { userId: string; email: string; roleCode: RoleCode; permissions: Set<string> };

const ROLES = new Set<RoleCode>(['CEO', 'MANAGEMENT', 'SALES', 'MARKETING', 'SOFTWARE_ENGINEER']);
const ACTIONS = new Set<Action>(['list_requests', 'list_users', 'create_request', 'approve_ceo', 'reject_ceo', 'approve_technical', 'reject_technical', 'cancel_request', 'send_invitation', 'resend_invitation', 'activate_invitation', 'update_profile', 'change_role', 'disable_user', 'enable_user']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: Record<string, unknown>, status = 200, headers: HeadersInit = {}) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
const cleanText = (value: unknown, name: string, required = false, max = 160) => {
  if (typeof value !== 'string') { if (required) throw new Error(`${name} is required.`); return null; }
  const result = value.trim();
  if (!result && required) throw new Error(`${name} is required.`);
  if (!result) return null;
  if (result.length > max) throw new Error(`${name} is too long.`);
  return result;
};
const cleanId = (value: unknown, name = 'Identifier') => {
  const id = cleanText(value, name, true, 36)!;
  if (!UUID.test(id)) throw new Error(`${name} is invalid.`);
  return id;
};
const cleanEmail = (value: unknown) => {
  const email = cleanText(value, 'Work email', true, 254)!.toLowerCase();
  if (!EMAIL.test(email)) throw new Error('Work email is invalid.');
  return email;
};
const cleanRole = (value: unknown) => {
  if (typeof value !== 'string' || !ROLES.has(value as RoleCode)) throw new Error('Role code is not approved.');
  return value as RoleCode;
};

function headersFor(request: Request): HeadersInit | null {
  const origin = request.headers.get('origin');
  const configuredOrigins = Deno.env.get('COS_ALLOWED_ORIGINS') ?? Deno.env.get('COS_APP_ORIGIN') ?? '';
  const allowedOrigins = configuredOrigins.split(',').map((value) => value.trim()).filter(Boolean);
  if (!origin || !allowedOrigins.includes(origin)) return null;
  return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin' };
}

async function authorization(caller: ReturnType<typeof createClient>): Promise<Authorization | null> {
  const { data: userData, error: userError } = await caller.auth.getUser();
  const user = userData.user;
  if (userError || !user?.email) return null;
  const { data, error } = await caller.rpc('get_my_authorization');
  const row = Array.isArray(data) && data.length === 1 && data[0] && typeof data[0] === 'object' ? data[0] as Record<string, unknown> : null;
  if (error || !row || row.user_id !== user.id || typeof row.role_code !== 'string' || !ROLES.has(row.role_code as RoleCode) || !Array.isArray(row.permissions) || !row.permissions.every((item) => typeof item === 'string')) return null;
  return { userId: user.id, email: user.email.toLowerCase(), roleCode: row.role_code as RoleCode, permissions: new Set(row.permissions as string[]) };
}

function requirePermission(actor: Authorization, permission: string) {
  if (!actor.permissions.has(permission)) throw new Error('You are not authorized to perform this action.');
}
function requireCeo(actor: Authorization) {
  requirePermission(actor, 'users.approve');
  if (actor.roleCode !== 'CEO') throw new Error('CEO approval is required.');
}
function requireTechnical(actor: Authorization, permission: 'users.approve' | 'users.invite') {
  requirePermission(actor, permission);
  requirePermission(actor, 'users.invite');
  if (actor.roleCode !== 'SOFTWARE_ENGINEER') throw new Error('Technical provisioning authority is required.');
}
function requireNotSelf(actor: Authorization, target: RequestRow) {
  if (target.requested_by_user_id === actor.userId || target.requested_email === actor.email) throw new Error('You cannot approve, invite, or administratively change your own account.');
}

async function requestById(service: ReturnType<typeof createClient>, id: string) {
  const { data, error } = await service.from('user_provisioning_requests').select('id, requested_by_user_id, requested_email, first_name, last_name, requested_role_id, status, ceo_approval_status, technical_approval_status, invitation_status, auth_user_id').eq('id', id).single();
  if (error || !data) throw new Error('Provisioning request was not found.');
  return data as RequestRow;
}
async function roleByCode(service: ReturnType<typeof createClient>, code: RoleCode) {
  const { data, error } = await service.from('roles').select('id, code').eq('code', code).single();
  if (error || !data) throw new Error('Approved role lookup failed.');
  return data as { id: string; code: RoleCode };
}
async function audit(service: ReturnType<typeof createClient>, actor: string | null, email: string, eventType: string, correlationId: string, provisioningRequestId?: string, targetUserId?: string | null, newRoleId?: string | null) {
  const { error } = await service.from('user_provisioning_audit_logs').insert({ actor_user_id: actor, target_user_id: targetUserId ?? null, target_email: email, event_type: eventType, provisioning_request_id: provisioningRequestId ?? null, new_role_id: newRoleId ?? null, request_id: correlationId, metadata: {} });
  if (error) throw error;
}

Deno.serve(async (request) => {
  const headers = headersFor(request);
  if (!headers) return json({ error: 'Origin is not allowed.' }, 403);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, headers);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const bearer = request.headers.get('Authorization');
  if (!supabaseUrl || !anonKey || !serviceKey || !bearer) return json({ error: 'Provisioning service is unavailable.' }, 503, headers);
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return json({ error: 'Request body must be valid JSON.' }, 400, headers); }
  if (!body || typeof body.action !== 'string' || !ACTIONS.has(body.action as Action)) return json({ error: 'Unsupported provisioning action.' }, 400, headers);
  const action = body.action as Action;
  const caller = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: bearer } }, auth: { persistSession: false, autoRefreshToken: false } });
  const actor = await authorization(caller);
  const { data: authenticatedData, error: authenticatedError } = await caller.auth.getUser();
  const authenticatedUser = authenticatedData.user;
  const service = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const correlationId = crypto.randomUUID();
  try {
    if (action === 'activate_invitation') {
      if (authenticatedError || !authenticatedUser?.email) return json({ error: 'Authentication is required.' }, 401, headers);
      const { data: profile, error: profileError } = await service.from('profiles').select('id, status').eq('id', authenticatedUser.id).maybeSingle();
      if (profileError) throw profileError;
      if (!profile || profile.status === 'active') return json({ data: { activated: false }, requestId: correlationId }, 200, headers);
      if (profile.status !== 'invited') throw new Error('This account is not eligible for activation.');
      const { data: row, error } = await service.from('user_provisioning_requests').select('id, requested_email').eq('auth_user_id', authenticatedUser.id).eq('status', 'INVITATION_SENT').eq('invitation_status', 'sent').maybeSingle();
      if (error) throw error;
      const { error: profileUpdate } = await service.from('profiles').update({ status: 'active' }).eq('id', authenticatedUser.id);
      if (profileUpdate) throw profileUpdate;
      if (row) {
        const { error: requestUpdate } = await service.from('user_provisioning_requests').update({ status: 'ACCOUNT_ACTIVATED', invitation_status: 'accepted' }).eq('id', row.id);
        if (requestUpdate) throw requestUpdate;
      } else {
        const { data: bootstrapAudit, error: bootstrapAuditError } = await service
          .from('user_provisioning_audit_logs')
          .select('id')
          .eq('target_user_id', authenticatedUser.id)
          .in('event_type', ['bootstrap_provisioning_admin', 'bootstrap_initial_ceo'])
          .limit(1);
        if (bootstrapAuditError || !bootstrapAudit?.length) throw new Error('An eligible invitation was not found.');
      }
      await audit(service, authenticatedUser.id, authenticatedUser.email.toLowerCase(), 'account_activated', correlationId, row?.id, authenticatedUser.id);
      return json({ data: { activated: true }, requestId: correlationId }, 200, headers);
    }
    if (!actor) return json({ error: 'Authentication and active authorization are required.' }, 401, headers);

    if (action === 'list_requests') {
      requirePermission(actor, 'users.view');
      const { data, error } = await service.from('user_provisioning_requests').select('id, requested_email, first_name, last_name, job_title, department, status, ceo_approval_status, ceo_approved_at, technical_approval_status, technical_approved_at, invitation_status, invited_at, created_at, requested_role:roles(code, name)').order('created_at', { ascending: false });
      if (error) throw error;
      return json({ data: data ?? [], requestId: correlationId }, 200, headers);
    }
    if (action === 'list_users') {
      requirePermission(actor, 'users.view');
      const { data, error } = await service.from('profiles').select('id, first_name, last_name, job_title, department, status, role:roles(code, name), created_at').order('created_at', { ascending: false });
      if (error) throw error;
      return json({ data: data ?? [], requestId: correlationId }, 200, headers);
    }
    if (action === 'create_request') {
      requirePermission(actor, 'users.request');
      const email = cleanEmail(body.email);
      if (email === actor.email) throw new Error('You cannot create a provisioning request for yourself.');
      const role = await roleByCode(service, cleanRole(body.roleCode));
      const { data, error } = await service.from('user_provisioning_requests').insert({ requested_by_user_id: actor.userId, requested_email: email, first_name: cleanText(body.firstName, 'First name', true, 80), last_name: cleanText(body.lastName, 'Last name', true, 80), job_title: cleanText(body.jobTitle, 'Job title'), department: cleanText(body.department, 'Department', false, 120), requested_role_id: role.id }).select('id').single();
      if (error || !data) throw error ?? new Error('Request could not be created.');
      await audit(service, actor.userId, email, 'request_created', correlationId, data.id, null, role.id);
      return json({ data, requestId: correlationId }, 201, headers);
    }
    if (action === 'update_profile' || action === 'change_role' || action === 'disable_user' || action === 'enable_user') {
      const userId = cleanId(body.userId, 'User ID');
      if (userId === actor.userId) throw new Error('You cannot administratively change your own role or account status.');
      const { data: targetUserData, error: targetUserError } = await service.auth.admin.getUserById(userId);
      if (targetUserError || !targetUserData.user?.email) throw new Error('The target user was not found.');
      const targetEmail = targetUserData.user.email.toLowerCase();
      if (action === 'update_profile') {
        requirePermission(actor, 'users.update');
        const { error } = await service.from('profiles').update({ first_name: cleanText(body.firstName, 'First name', true, 80), last_name: cleanText(body.lastName, 'Last name', true, 80), job_title: cleanText(body.jobTitle, 'Job title'), department: cleanText(body.department, 'Department', false, 120) }).eq('id', userId);
        if (error) throw error;
        await audit(service, actor.userId, targetEmail, 'profile_updated', correlationId, undefined, userId);
        return json({ data: { id: userId }, requestId: correlationId }, 200, headers);
      }
      if (action === 'change_role') {
        requirePermission(actor, 'users.update');
        const role = await roleByCode(service, cleanRole(body.roleCode));
        const { error } = await service.from('profiles').update({ role_id: role.id }).eq('id', userId);
        if (error) throw error;
        await audit(service, actor.userId, targetEmail, 'role_changed', correlationId, undefined, userId, role.id);
        return json({ data: { id: userId, roleCode: role.code }, requestId: correlationId }, 200, headers);
      }
      requirePermission(actor, action === 'disable_user' ? 'users.disable' : 'users.enable');
      const nextStatus = action === 'disable_user' ? 'disabled' : 'active';
      const { error: profileError } = await service.from('profiles').update({ status: nextStatus }).eq('id', userId);
      if (profileError) throw profileError;
      const { error: authError } = await service.auth.admin.updateUserById(userId, { ban_duration: action === 'disable_user' ? '876000h' : 'none' });
      if (authError) throw authError;
      await audit(service, actor.userId, targetEmail, action === 'disable_user' ? 'disabled' : 'enabled', correlationId, undefined, userId);
      return json({ data: { id: userId, status: nextStatus }, requestId: correlationId }, 200, headers);
    }
    const id = cleanId(body.requestId, 'Provisioning request ID');
    const target = await requestById(service, id);
    if (action === 'approve_ceo' || action === 'reject_ceo') {
      requireCeo(actor); requireNotSelf(actor, target);
      if (target.status !== 'PENDING') throw new Error('This request is not awaiting CEO approval.');
      const rejected = action === 'reject_ceo';
      const { error } = await service.from('user_provisioning_requests').update({ status: rejected ? 'CEO_REJECTED' : 'CEO_APPROVED', ceo_approval_status: rejected ? 'rejected' : 'approved', ceo_approved_by_user_id: actor.userId, ceo_approved_at: new Date().toISOString(), ceo_rejection_reason: rejected ? cleanText(body.reason, 'Rejection reason', true, 400) : null }).eq('id', id);
      if (error) throw error;
      await audit(service, actor.userId, target.requested_email, rejected ? 'ceo_rejected' : 'ceo_approved', correlationId, id, null, target.requested_role_id);
      return json({ data: { id }, requestId: correlationId }, 200, headers);
    }
    if (action === 'approve_technical' || action === 'reject_technical') {
      requireTechnical(actor, 'users.approve'); requireNotSelf(actor, target);
      if (target.status !== 'CEO_APPROVED' || target.ceo_approval_status !== 'approved') throw new Error('CEO approval is required before technical approval.');
      const rejected = action === 'reject_technical';
      const { error } = await service.from('user_provisioning_requests').update({ status: rejected ? 'TECHNICAL_REJECTED' : 'READY_FOR_INVITATION', technical_approval_status: rejected ? 'rejected' : 'approved', technical_approved_by_user_id: actor.userId, technical_approved_at: new Date().toISOString(), technical_rejection_reason: rejected ? cleanText(body.reason, 'Rejection reason', true, 400) : null }).eq('id', id);
      if (error) throw error;
      await audit(service, actor.userId, target.requested_email, rejected ? 'technical_rejected' : 'technical_approved', correlationId, id, null, target.requested_role_id);
      return json({ data: { id }, requestId: correlationId }, 200, headers);
    }
    if (action === 'cancel_request') {
      requirePermission(actor, 'users.request');
      if (target.requested_by_user_id !== actor.userId || !['PENDING', 'CEO_APPROVED', 'READY_FOR_INVITATION'].includes(target.status)) throw new Error('This request cannot be cancelled.');
      const { error } = await service.from('user_provisioning_requests').update({ status: 'CANCELLED' }).eq('id', id);
      if (error) throw error;
      await audit(service, actor.userId, target.requested_email, 'request_cancelled', correlationId, id);
      return json({ data: { id }, requestId: correlationId }, 200, headers);
    }
    if (action === 'send_invitation' || action === 'resend_invitation') {
      requireTechnical(actor, 'users.invite'); requireNotSelf(actor, target);
      const initial = action === 'send_invitation';
      if (initial && (target.status !== 'READY_FOR_INVITATION' || target.ceo_approval_status !== 'approved' || target.technical_approval_status !== 'approved' || target.invitation_status !== 'not_sent')) throw new Error('Both approvals and READY_FOR_INVITATION are required before sending an invitation.');
      if (!initial && (target.status !== 'INVITATION_SENT' || !target.auth_user_id)) throw new Error('This request has no pending invitation.');
      const { data: invitation, error: invitationError } = await service.auth.admin.inviteUserByEmail(target.requested_email, { redirectTo: new URL('/auth/complete', Deno.env.get('COS_APP_ORIGIN')!).toString() });
      if (invitationError || !invitation.user) throw invitationError ?? new Error('Invitation could not be sent.');
      if (initial) {
        const { error: profileError } = await service.from('profiles').insert({ id: invitation.user.id, first_name: target.first_name, last_name: target.last_name, role_id: target.requested_role_id, status: 'invited' });
        if (profileError) throw profileError;
        const { error: requestError } = await service.from('user_provisioning_requests').update({ status: 'INVITATION_SENT', invitation_status: 'sent', auth_user_id: invitation.user.id, invited_by_user_id: actor.userId, invited_at: new Date().toISOString() }).eq('id', id);
        if (requestError) throw requestError;
      }
      await audit(service, actor.userId, target.requested_email, initial ? 'invitation_sent' : 'invitation_resent', correlationId, id, invitation.user.id, target.requested_role_id);
      return json({ data: { id }, requestId: correlationId }, 200, headers);
    }
    const userId = cleanId(body.userId, 'User ID');
    if (userId === actor.userId) throw new Error('You cannot administratively change your own role or account status.');
    if (action === 'update_profile') {
      requirePermission(actor, 'users.update');
      const { error } = await service.from('profiles').update({ first_name: cleanText(body.firstName, 'First name', true, 80), last_name: cleanText(body.lastName, 'Last name', true, 80), job_title: cleanText(body.jobTitle, 'Job title'), department: cleanText(body.department, 'Department', false, 120) }).eq('id', userId);
      if (error) throw error;
      return json({ data: { id: userId }, requestId: correlationId }, 200, headers);
    }
    if (action === 'change_role') {
      requirePermission(actor, 'users.update');
      const role = await roleByCode(service, cleanRole(body.roleCode));
      const { error } = await service.from('profiles').update({ role_id: role.id }).eq('id', userId);
      if (error) throw error;
      return json({ data: { id: userId, roleCode: role.code }, requestId: correlationId }, 200, headers);
    }
    if (action === 'disable_user' || action === 'enable_user') {
      requirePermission(actor, action === 'disable_user' ? 'users.disable' : 'users.enable');
      const nextStatus = action === 'disable_user' ? 'disabled' : 'active';
      const { error: profileError } = await service.from('profiles').update({ status: nextStatus }).eq('id', userId);
      if (profileError) throw profileError;
      const { error: authError } = await service.auth.admin.updateUserById(userId, { ban_duration: action === 'disable_user' ? '876000h' : 'none' });
      if (authError) throw authError;
      return json({ data: { id: userId, status: nextStatus }, requestId: correlationId }, 200, headers);
    }
    throw new Error('Unsupported provisioning action.');
  } catch (error) {
    console.error('admin-user-provisioning failed', { category: error instanceof Error ? error.name : 'unknown', correlationId });
    return json({ error: 'The requested provisioning action could not be completed.', requestId: correlationId }, 400, headers);
  }
});
