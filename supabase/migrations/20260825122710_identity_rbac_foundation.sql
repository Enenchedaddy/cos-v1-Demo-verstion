-- Phase 2: global identity, profiles, roles, and permissions foundation.
-- This migration intentionally does not alter legacy business data or
-- Content & Social authorization, create Auth users, or grant browser access.

create function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (
    code in ('CEO', 'MANAGEMENT', 'SALES', 'MARKETING', 'SOFTWARE_ENGINEER')
  ),
  name text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  module text not null,
  action text not null,
  description text not null,
  status text not null default 'active'
    check (status in ('active', 'needs_decision')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module, action)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  role_id uuid not null references public.roles(id) on delete restrict,
  job_title text,
  department text,
  status text not null default 'active'
    check (status in ('active', 'suspended', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create index profiles_role_id_idx on public.profiles(role_id);
create index role_permissions_permission_id_idx on public.role_permissions(permission_id);

create trigger roles_set_updated_at
before update on public.roles
for each row execute function private.set_updated_at();

create trigger permissions_set_updated_at
before update on public.permissions
for each row execute function private.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.profiles enable row level security;
alter table public.role_permissions enable row level security;

revoke all on public.roles from anon, authenticated;
revoke all on public.permissions from anon, authenticated;
revoke all on public.profiles from anon, authenticated;
revoke all on public.role_permissions from anon, authenticated;

insert into public.roles (code, name, description)
values
  ('CEO', 'Chief Executive Officer', 'Company-wide access governed by assigned permissions.'),
  ('MANAGEMENT', 'Management', 'Management and explicitly approved cross-workspace access.'),
  ('SALES', 'Sales', 'Sales & Marketing workspace access for sales responsibilities.'),
  ('MARKETING', 'Marketing', 'Sales & Marketing workspace access for marketing responsibilities.'),
  ('SOFTWARE_ENGINEER', 'Software Engineer', 'Engineering and system access explicitly granted through permissions.')
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

insert into public.permissions (key, module, action, description, status)
values
  ('workspace.view', 'workspace', 'view', 'Access the authenticated COS workspace shell.', 'active'),
  ('dashboard.view', 'dashboard', 'view', 'View operational dashboards and overviews.', 'active'),
  ('management.view', 'management', 'view', 'View the Management workspace.', 'active'),
  ('customers.view', 'customers', 'view', 'View customer information where data policies allow.', 'active'),
  ('reports.view', 'reports', 'view', 'View approved reporting and analytics.', 'active'),
  ('sales.view', 'sales', 'view', 'View Sales functionality and approved sales data.', 'active'),
  ('sales.create', 'sales', 'create', 'Create Sales records where workflow policies allow.', 'active'),
  ('sales.update', 'sales', 'update', 'Update Sales records where workflow policies allow.', 'active'),
  ('marketing.view', 'marketing', 'view', 'View Marketing functionality and approved marketing data.', 'active'),
  ('marketing.create', 'marketing', 'create', 'Create Marketing records where workflow policies allow.', 'active'),
  ('marketing.update', 'marketing', 'update', 'Update Marketing records where workflow policies allow.', 'active'),
  ('system.view', 'system', 'view', 'View approved system information.', 'active'),
  ('content_social.view', 'content_social', 'view', 'Pending Content & Social authorization design approval.', 'needs_decision'),
  ('content_social.create', 'content_social', 'create', 'Pending Content & Social authorization design approval.', 'needs_decision'),
  ('content_social.update', 'content_social', 'update', 'Pending Content & Social authorization design approval.', 'needs_decision'),
  ('users.view', 'users', 'view', 'Pending user-management workflow approval.', 'needs_decision'),
  ('users.invite', 'users', 'invite', 'Pending user-management workflow approval.', 'needs_decision'),
  ('users.update', 'users', 'update', 'Pending user-management workflow approval.', 'needs_decision'),
  ('users.disable', 'users', 'disable', 'Pending user-management workflow approval.', 'needs_decision'),
  ('system.manage', 'system', 'manage', 'Pending system-administration approval.', 'needs_decision')
on conflict (key) do update
set
  module = excluded.module,
  action = excluded.action,
  description = excluded.description,
  status = excluded.status,
  updated_at = now();

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from (
  values
    ('CEO', 'workspace.view'),
    ('CEO', 'dashboard.view'),
    ('CEO', 'management.view'),
    ('CEO', 'customers.view'),
    ('CEO', 'reports.view'),
    ('CEO', 'sales.view'),
    ('CEO', 'sales.create'),
    ('CEO', 'sales.update'),
    ('CEO', 'marketing.view'),
    ('CEO', 'marketing.create'),
    ('CEO', 'marketing.update'),
    ('CEO', 'system.view'),
    ('MANAGEMENT', 'workspace.view'),
    ('MANAGEMENT', 'dashboard.view'),
    ('MANAGEMENT', 'management.view'),
    ('MANAGEMENT', 'customers.view'),
    ('MANAGEMENT', 'reports.view'),
    ('MANAGEMENT', 'sales.view'),
    ('MANAGEMENT', 'marketing.view'),
    ('SALES', 'workspace.view'),
    ('SALES', 'sales.view'),
    ('SALES', 'sales.create'),
    ('SALES', 'sales.update'),
    ('MARKETING', 'workspace.view'),
    ('MARKETING', 'marketing.view'),
    ('MARKETING', 'marketing.create'),
    ('MARKETING', 'marketing.update'),
    ('SOFTWARE_ENGINEER', 'workspace.view'),
    ('SOFTWARE_ENGINEER', 'system.view')
) as mapping(role_code, permission_key)
join public.roles as roles on roles.code = mapping.role_code
join public.permissions as permissions on permissions.key = mapping.permission_key
on conflict do nothing;
