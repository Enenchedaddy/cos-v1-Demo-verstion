-- Phase 4: authenticated caller authorization snapshot.
-- Deliberately exposes no role or permission administration capabilities.

create function public.get_my_authorization()
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
    profiles.id as user_id,
    profiles.first_name,
    profiles.last_name,
    profiles.job_title,
    profiles.department,
    roles.code as role_code,
    roles.name as role_name,
    coalesce(
      array_agg(permissions.key order by permissions.key)
        filter (where permissions.status = 'active'),
      '{}'::text[]
    ) as permissions
  from public.profiles
  join public.roles
    on roles.id = profiles.role_id
  left join public.role_permissions
    on role_permissions.role_id = roles.id
  left join public.permissions
    on permissions.id = role_permissions.permission_id
  where profiles.id = (select auth.uid())
    and profiles.status = 'active'
  group by
    profiles.id,
    profiles.first_name,
    profiles.last_name,
    profiles.job_title,
    profiles.department,
    roles.code,
    roles.name;
$function$;

revoke all on function public.get_my_authorization()
  from public, anon, authenticated, service_role;

grant execute on function public.get_my_authorization()
  to authenticated;
