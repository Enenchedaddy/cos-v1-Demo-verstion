/** Staging-only, one-time bootstrap for the first technical provisioning administrator. */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(name + ' is required.');
  return value;
};
const supabaseUrl = required('SUPABASE_URL');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || required('SUPABASE_KEY');
const expectedRef = required('COS_EXPECTED_STAGING_PROJECT_REF');
if (new URL(supabaseUrl).hostname.split('.')[0] !== expectedRef) throw new Error('Staging project reference does not match. Refusing bootstrap.');
if (process.env.COS_BOOTSTRAP_STAGING_CONFIRMATION !== 'CREATE_INITIAL_STAGING_PROVISIONING_ADMIN') throw new Error('Explicit staging confirmation is required.');
const email = required('COS_BOOTSTRAP_ADMIN_EMAIL').toLowerCase();
const firstName = required('COS_BOOTSTRAP_ADMIN_FIRST_NAME');
const lastName = required('COS_BOOTSTRAP_ADMIN_LAST_NAME');
const jobTitle = required('COS_BOOTSTRAP_ADMIN_JOB_TITLE');
const department = required('COS_BOOTSTRAP_ADMIN_DEPARTMENT');
const origin = required('COS_APP_ORIGIN');
const service = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { count, error: countError } = await service.from('profiles').select('*', { count: 'exact', head: true });
if (countError || count !== 0) throw new Error('A COS profile already exists. Refusing one-time technical administrator bootstrap.');
const { data: invitation, error: inviteError } = await service.auth.admin.inviteUserByEmail(email, { redirectTo: new URL('/auth/complete', origin).toString() });
if (inviteError || !invitation.user) throw new Error('The technical administrator invitation could not be created. Do not retry blindly.');
const requestId = crypto.randomUUID();
const { error: bootstrapError } = await service.rpc('bootstrap_initial_provisioning_admin', {
  p_user_id: invitation.user.id, p_first_name: firstName, p_last_name: lastName,
  p_job_title: jobTitle, p_department: department, p_target_email: email, p_request_id: requestId,
});
if (bootstrapError) throw new Error('Invitation exists but profile bootstrap failed. Do not retry blindly; correlation ' + requestId + '.');
console.log('Initial technical administrator invitation created. Correlation: ' + requestId);
