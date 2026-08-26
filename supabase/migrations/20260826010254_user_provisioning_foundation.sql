-- Phase 6: secure, staging-first administrator user provisioning foundation.
-- This migration deliberately does not create Auth users, alter legacy business
-- tables, change Content & Social policies, or grant browser access to RBAC data.

-- job_title already exists on public.profiles from the Phase 2 foundation.
-- Activate only the CEO user-management permissions approved for Phase 6.
update public.permissions
set
  status = 'active',
  updated_at = now()
where key in ('users.view', 'users.invite', 'users.update', 'users.disable');

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from public.roles as roles
join public.permissions as permissions
  on permissions.key in ('users.view', 'users.invite', 'users.update', 'users.disable')
where roles.code = 'CEO'
on conflict do nothing;

-- This is separate from the legacy audit_logs table. Events are authored by the
-- protected Edge Function; the browser has no direct table access.
create table public.user_provisioning_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  target_email text not null,
  event_type text not null check (
    event_type in (
      'invited',
      'bootstrap_created',
      'invitation_resent',
      'profile_updated',
      'role_changed',
      'disabled',
      'enabled',
      'operation_failed'
    )
  ),
  previous_role_id uuid references public.roles(id) on delete set null,
  new_role_id uuid references public.roles(id) on delete set null,
  request_id uuid not null default gen_random_uuid(),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index user_provisioning_audit_logs_target_user_id_idx
  on public.user_provisioning_audit_logs(target_user_id);
create index user_provisioning_audit_logs_actor_user_id_idx
  on public.user_provisioning_audit_logs(actor_user_id);
create index user_provisioning_audit_logs_target_email_created_at_idx
  on public.user_provisioning_audit_logs(target_email, created_at desc);
create index user_provisioning_audit_logs_created_at_idx
  on public.user_provisioning_audit_logs(created_at desc);

alter table public.user_provisioning_audit_logs enable row level security;

revoke all on public.user_provisioning_audit_logs from public, anon, authenticated;
grant select, insert on public.user_provisioning_audit_logs to service_role;

-- The first CEO cannot use the normal Edge Function because no authorized
-- requester exists yet. This one-time bootstrap is callable by service_role
-- only, succeeds only while no profiles exist, and never creates an Auth user.
create function public.bootstrap_first_ceo(
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
    raise exception 'The first CEO bootstrap is no longer available.';
  end if;

  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'The supplied Auth user does not exist.';
  end if;

  select id into v_role_id
  from public.roles
  where code = 'CEO';

  if v_role_id is null then
    raise exception 'The approved CEO role is unavailable.';
  end if;

  insert into public.profiles (
    id,
    first_name,
    last_name,
    job_title,
    department,
    role_id,
    status
  ) values (
    p_user_id,
    nullif(btrim(p_first_name), ''),
    nullif(btrim(p_last_name), ''),
    nullif(btrim(p_job_title), ''),
    nullif(btrim(p_department), ''),
    v_role_id,
    'active'
  );

  insert into public.user_provisioning_audit_logs (
    actor_user_id,
    target_user_id,
    target_email,
    event_type,
    new_role_id,
    request_id,
    metadata
  ) values (
    null,
    p_user_id,
    lower(btrim(p_target_email)),
    'bootstrap_created',
    v_role_id,
    p_request_id,
    jsonb_build_object('bootstrap', true)
  );
end;
$function$;

revoke all on function public.bootstrap_first_ceo(uuid, text, text, text, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.bootstrap_first_ceo(uuid, text, text, text, text, text, uuid)
  to service_role;
