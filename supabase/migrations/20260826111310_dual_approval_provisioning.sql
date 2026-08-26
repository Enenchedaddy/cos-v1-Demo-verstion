-- Phase 6: staging-first, dual-approval user provisioning.
-- No Auth users, passwords, invitations, legacy business tables, or
-- Content & Social policies are modified by this migration.

begin;

insert into public.permissions (key, module, action, description, status)
values
  ('users.request', 'users', 'request', 'Create an employee provisioning request.', 'active'),
  ('users.approve', 'users', 'approve', 'Approve or reject a permitted provisioning request.', 'active'),
  ('users.enable', 'users', 'enable', 'Re-enable a disabled COS account.', 'active')
on conflict (key) do update
set
  module = excluded.module,
  action = excluded.action,
  description = excluded.description,
  status = 'active',
  updated_at = now();

update public.permissions
set status = 'active', updated_at = now()
where key in (
  'users.view', 'users.request', 'users.approve', 'users.invite',
  'users.update', 'users.disable', 'users.enable'
);

-- CEO retains review and business approval, but has no direct technical lifecycle authority.
delete from public.role_permissions role_permissions
using public.roles roles, public.permissions permissions
where role_permissions.role_id = roles.id
  and role_permissions.permission_id = permissions.id
  and roles.code = 'CEO'
  and permissions.key in (
    'users.request', 'users.invite', 'users.update',
    'users.disable', 'users.enable'
  );

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles roles
join public.permissions permissions
  on permissions.key in ('users.view', 'users.approve')
where roles.code = 'CEO'
on conflict do nothing;

-- Individual grants deliberately avoid giving all SOFTWARE_ENGINEER users
-- technical provisioning authority.
create table public.profile_permissions (
  profile_id uuid not null
    references public.profiles(id) on delete cascade,
  permission_id uuid not null
    references public.permissions(id) on delete restrict,
  granted_by_user_id uuid
    references auth.users(id) on delete set null,
  grant_reason text not null
    check (char_length(btrim(grant_reason)) between 1 and 240),
  created_at timestamptz not null default now(),
  primary key (profile_id, permission_id)
);

create index profile_permissions_permission_id_idx
  on public.profile_permissions(permission_id);

alter table public.profile_permissions enable row level security;
revoke all on public.profile_permissions from public, anon, authenticated;
grant select, insert, update, delete on public.profile_permissions to service_role;

-- Invited users cannot resolve a COS authorization snapshot until activation.
alter table public.profiles drop constraint profiles_status_check;
alter table public.profiles
  add constraint profiles_status_check
  check (status in ('invited', 'active', 'suspended', 'disabled'));

create table public.user_provisioning_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by_user_id uuid not null
    references auth.users(id) on delete restrict,
  requested_email text not null
    check (requested_email = lower(btrim(requested_email))),
  first_name text not null
    check (char_length(btrim(first_name)) between 1 and 80),
  last_name text not null
    check (char_length(btrim(last_name)) between 1 and 80),
  job_title text,
  department text,
  requested_role_id uuid not null
    references public.roles(id) on delete restrict,
  status text not null default 'PENDING'
    check (status in (
      'PENDING', 'CEO_APPROVED', 'READY_FOR_INVITATION',
      'INVITATION_SENT', 'ACCOUNT_ACTIVATED', 'CEO_REJECTED',
      'TECHNICAL_REJECTED', 'CANCELLED', 'DISABLED'
    )),
  ceo_approval_status text not null default 'pending'
    check (ceo_approval_status in ('pending', 'approved', 'rejected')),
  ceo_approved_by_user_id uuid references auth.users(id) on delete set null,
  ceo_approved_at timestamptz,
  ceo_rejection_reason text,
  technical_approval_status text not null default 'pending'
    check (technical_approval_status in ('pending', 'approved', 'rejected')),
  technical_approved_by_user_id uuid references auth.users(id) on delete set null,
  technical_approved_at timestamptz,
  technical_rejection_reason text,
  invitation_status text not null default 'not_sent'
    check (invitation_status in ('not_sent', 'sent', 'accepted')),
  invited_by_user_id uuid references auth.users(id) on delete set null,
  invited_at timestamptz,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'PENDING'
      and ceo_approval_status = 'pending'
      and technical_approval_status = 'pending'
      and invitation_status = 'not_sent'
      and auth_user_id is null)
    or
    (status = 'CEO_APPROVED'
      and ceo_approval_status = 'approved'
      and technical_approval_status = 'pending'
      and invitation_status = 'not_sent'
      and auth_user_id is null)
    or
    (status = 'READY_FOR_INVITATION'
      and ceo_approval_status = 'approved'
      and technical_approval_status = 'approved'
      and invitation_status = 'not_sent'
      and auth_user_id is null)
    or
    (status = 'INVITATION_SENT'
      and ceo_approval_status = 'approved'
      and technical_approval_status = 'approved'
      and invitation_status = 'sent'
      and auth_user_id is not null)
    or
    (status = 'ACCOUNT_ACTIVATED'
      and ceo_approval_status = 'approved'
      and technical_approval_status = 'approved'
      and invitation_status = 'accepted'
      and auth_user_id is not null)
    or
    (status = 'CEO_REJECTED'
      and ceo_approval_status = 'rejected'
      and technical_approval_status = 'pending'
      and invitation_status = 'not_sent'
      and auth_user_id is null)
    or
    (status = 'TECHNICAL_REJECTED'
      and ceo_approval_status = 'approved'
      and technical_approval_status = 'rejected'
      and invitation_status = 'not_sent'
      and auth_user_id is null)
    or
    (status = 'CANCELLED'
      and invitation_status = 'not_sent'
      and auth_user_id is null)
    or
    (status = 'DISABLED'
      and invitation_status = 'accepted'
      and auth_user_id is not null)
  )
);

create unique index user_provisioning_requests_open_email_idx
  on public.user_provisioning_requests(requested_email)
  where status in ('PENDING', 'CEO_APPROVED', 'READY_FOR_INVITATION', 'INVITATION_SENT');
create index user_provisioning_requests_status_created_at_idx
  on public.user_provisioning_requests(status, created_at desc);
create index user_provisioning_requests_requested_by_user_id_idx
  on public.user_provisioning_requests(requested_by_user_id);
create index user_provisioning_requests_auth_user_id_idx
  on public.user_provisioning_requests(auth_user_id);

create trigger user_provisioning_requests_set_updated_at
before update on public.user_provisioning_requests
for each row execute function private.set_updated_at();

alter table public.user_provisioning_requests enable row level security;
revoke all on public.user_provisioning_requests from public, anon, authenticated;
grant select, insert, update, delete on public.user_provisioning_requests to service_role;

alter table public.user_provisioning_audit_logs
  add column provisioning_request_id uuid
    references public.user_provisioning_requests(id) on delete restrict;
create index user_provisioning_audit_logs_provisioning_request_id_idx
  on public.user_provisioning_audit_logs(provisioning_request_id);

alter table public.user_provisioning_audit_logs
  drop constraint user_provisioning_audit_logs_event_type_check;
alter table public.user_provisioning_audit_logs
  add constraint user_provisioning_audit_logs_event_type_check
  check (event_type in (
    'request_created', 'ceo_approved', 'ceo_rejected',
    'technical_approved', 'technical_rejected', 'request_cancelled',
    'role_assigned', 'invited', 'invitation_sent', 'invitation_resent',
    'account_activated', 'bootstrap_created',
    'bootstrap_provisioning_admin', 'bootstrap_initial_ceo',
    'profile_updated', 'role_changed', 'disabled', 'enabled',
    'permission_granted', 'permission_revoked', 'operation_failed'
  ));

create or replace function public.get_my_authorization()
returns table (
  user_id uuid,
  first_name text,
  last_name text,
  job_title text,
  department text,
  role_code text,
  role_name text,
  permissions text[]
)
language sql
stable
security definer
set search_path = ''
as $function$
  select
    profiles.id,
    profiles.first_name,
    profiles.last_name,
    profiles.job_title,
    profiles.department,
    roles.code,
    roles.name,
    coalesce(
      array_agg(permissions.key order by permissions.key)
        filter (where permissions.status = 'active'),
      '{}'::text[]
    )
  from public.profiles
  join public.roles on roles.id = profiles.role_id
  left join lateral (
    select role_permissions.permission_id
    from public.role_permissions
    where role_permissions.role_id = roles.id
    union
    select profile_permissions.permission_id
    from public.profile_permissions
    where profile_permissions.profile_id = profiles.id
  ) effective_permissions on true
  left join public.permissions
    on permissions.id = effective_permissions.permission_id
  where profiles.id = (select auth.uid())
    and profiles.status = 'active'
  group by
    profiles.id, profiles.first_name, profiles.last_name,
    profiles.job_title, profiles.department, roles.code, roles.name;
$function$;

revoke all on function public.get_my_authorization()
  from public, anon, authenticated, service_role;
grant execute on function public.get_my_authorization() to authenticated;

-- The old CEO-first bootstrap would violate the approved order.
drop function if exists public.bootstrap_first_ceo(uuid, text, text, text, text, text, uuid);

create function public.bootstrap_initial_provisioning_admin(
  p_user_id uuid,
  p_first_name text,
  p_last_name text,
  p_job_title text,
  p_department text,
  p_target_email text,
  p_request_id uuid default gen_random_uuid()
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_role_id uuid;
begin
  if exists (select 1 from public.profiles) then
    raise exception 'Initial technical administrator bootstrap is no longer available.';
  end if;
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'The supplied Auth user does not exist.';
  end if;
  select id into v_role_id from public.roles where code = 'SOFTWARE_ENGINEER';
  if v_role_id is null then
    raise exception 'The approved SOFTWARE_ENGINEER role is unavailable.';
  end if;

  insert into public.profiles (
    id, first_name, last_name, job_title, department, role_id, status
  ) values (
    p_user_id,
    nullif(btrim(p_first_name), ''),
    nullif(btrim(p_last_name), ''),
    nullif(btrim(p_job_title), ''),
    nullif(btrim(p_department), ''),
    v_role_id,
    'invited'
  );

  insert into public.profile_permissions (
    profile_id, permission_id, granted_by_user_id, grant_reason
  )
  select p_user_id, permissions.id, null,
    'Initial technical provisioning administrator bootstrap'
  from public.permissions permissions
  where permissions.key in (
    'users.view', 'users.request', 'users.approve', 'users.invite',
    'users.update', 'users.disable', 'users.enable'
  ) and permissions.status = 'active';

  if (
    select count(*)
    from public.profile_permissions profile_permissions
    join public.permissions permissions on permissions.id = profile_permissions.permission_id
    where profile_permissions.profile_id = p_user_id
      and permissions.key like 'users.%'
  ) <> 7 then
    raise exception 'Required technical provisioning permissions are unavailable.';
  end if;

  insert into public.user_provisioning_audit_logs (
    target_user_id, target_email, event_type, request_id, metadata
  ) values (
    p_user_id, lower(btrim(p_target_email)),
    'bootstrap_provisioning_admin', p_request_id,
    jsonb_build_object('bootstrap', true)
  );
end;
$function$;

revoke all on function public.bootstrap_initial_provisioning_admin(uuid, text, text, text, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.bootstrap_initial_provisioning_admin(uuid, text, text, text, text, text, uuid)
  to service_role;

create function public.bootstrap_initial_ceo(
  p_user_id uuid,
  p_first_name text,
  p_last_name text,
  p_job_title text,
  p_department text,
  p_target_email text,
  p_request_id uuid default gen_random_uuid()
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_role_id uuid;
begin
  if exists (
    select 1 from public.profiles profiles
    join public.roles roles on roles.id = profiles.role_id
    where roles.code = 'CEO'
  ) then
    raise exception 'Initial CEO bootstrap is no longer available.';
  end if;
  if not exists (
    select 1 from public.profiles profiles
    join public.roles roles on roles.id = profiles.role_id
    join public.profile_permissions profile_permissions
      on profile_permissions.profile_id = profiles.id
    join public.permissions permissions
      on permissions.id = profile_permissions.permission_id
    where roles.code = 'SOFTWARE_ENGINEER'
      and profiles.status = 'active'
      and permissions.key = 'users.invite'
  ) then
    raise exception 'An active technical provisioning administrator is required.';
  end if;
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'The supplied Auth user does not exist.';
  end if;
  select id into v_role_id from public.roles where code = 'CEO';
  if v_role_id is null then
    raise exception 'The approved CEO role is unavailable.';
  end if;

  insert into public.profiles (
    id, first_name, last_name, job_title, department, role_id, status
  ) values (
    p_user_id,
    nullif(btrim(p_first_name), ''),
    nullif(btrim(p_last_name), ''),
    nullif(btrim(p_job_title), ''),
    nullif(btrim(p_department), ''),
    v_role_id,
    'invited'
  );

  insert into public.user_provisioning_audit_logs (
    target_user_id, target_email, event_type, new_role_id, request_id, metadata
  ) values (
    p_user_id, lower(btrim(p_target_email)), 'bootstrap_initial_ceo',
    v_role_id, p_request_id, jsonb_build_object('bootstrap', true)
  );
end;
$function$;

revoke all on function public.bootstrap_initial_ceo(uuid, text, text, text, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.bootstrap_initial_ceo(uuid, text, text, text, text, text, uuid)
  to service_role;

commit;
