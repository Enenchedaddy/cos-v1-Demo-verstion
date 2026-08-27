-- Phase 6 follow-up: role-based workspace visibility.
-- Staging-only until explicitly approved for remote application.
-- This changes the authorization snapshot contract only; it does not alter
-- profiles, roles, permissions, RLS, Content & Social, or provisioning data.

drop function if exists public.get_my_authorization();

create function public.get_my_authorization()
returns table (
  user_id uuid,
  first_name text,
  last_name text,
  job_title text,
  department text,
  role_code text,
  role_name text,
  permissions text[],
  allowed_workspaces text[]
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
    ),
    case roles.code
      when 'CEO' then array['sales-marketing', 'management']::text[]
      when 'MANAGEMENT' then array['sales-marketing', 'management']::text[]
      when 'SOFTWARE_ENGINEER' then array['sales-marketing', 'management']::text[]
      when 'SALES' then array['sales-marketing']::text[]
      when 'MARKETING' then array['sales-marketing']::text[]
      else '{}'::text[]
    end
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
