do $migration$
declare
  v_profile_id uuid;
  v_target_email text;
  v_match_count integer;
  v_granted_count integer;
  v_permission_keys constant text[] := array[
    'dashboard.view',
    'management.view',
    'customers.view',
    'reports.view',
    'sales.view',
    'sales.create',
    'sales.update',
    'marketing.view',
    'marketing.create',
    'marketing.update',
    'users.view',
    'users.request',
    'users.approve',
    'users.invite',
    'users.update',
    'users.disable',
    'users.enable',
    'system.manage'
  ];
begin
  select count(*)
  into v_match_count
  from public.profiles profiles
  join public.roles roles on roles.id = profiles.role_id
  where lower(btrim(profiles.first_name)) = 'akanni'
    and lower(btrim(profiles.last_name)) = 'ahmad'
    and profiles.status = 'active'
    and roles.code = 'SOFTWARE_ENGINEER';

  if v_match_count <> 1 then
    raise exception
      'Expected exactly one active SOFTWARE_ENGINEER profile named Akanni Ahmad; found %.',
      v_match_count;
  end if;

  select profiles.id, lower(auth_users.email)
  into strict v_profile_id, v_target_email
  from public.profiles profiles
  join public.roles roles on roles.id = profiles.role_id
  join auth.users auth_users on auth_users.id = profiles.id
  where lower(btrim(profiles.first_name)) = 'akanni'
    and lower(btrim(profiles.last_name)) = 'ahmad'
    and profiles.status = 'active'
    and roles.code = 'SOFTWARE_ENGINEER';

  if v_target_email is null or btrim(v_target_email) = '' then
    raise exception 'Akanni Ahmad does not have a usable Supabase Auth email.';
  end if;

  if exists (
    select 1
    from public.permissions permissions
    left join public.profile_permissions profile_permissions
      on profile_permissions.permission_id = permissions.id
    left join public.role_permissions role_permissions
      on role_permissions.permission_id = permissions.id
    where permissions.key = 'system.manage'
      and (
        profile_permissions.profile_id is not null
        or role_permissions.role_id is not null
      )
  ) then
    raise exception
      'system.manage already has an assignment; refusing to activate it implicitly for another principal.';
  end if;

  update public.permissions
  set
    status = 'active',
    description = 'Individually granted system-administration capability. Never inherited by the SOFTWARE_ENGINEER role.',
    updated_at = now()
  where key = 'system.manage'
    and status = 'needs_decision';

  if not exists (
    select 1
    from public.permissions
    where key = 'system.manage'
      and status = 'active'
  ) then
    raise exception 'system.manage could not be activated.';
  end if;

  if (
    select count(*)
    from public.permissions permissions
    where permissions.key = any(v_permission_keys)
      and permissions.status = 'active'
  ) <> cardinality(v_permission_keys) then
    raise exception 'One or more approved permissions are missing or inactive.';
  end if;

  insert into public.profile_permissions (
    profile_id,
    permission_id,
    granted_by_user_id,
    grant_reason
  )
  select
    v_profile_id,
    permissions.id,
    null,
    'Project administrator explicitly approved expanded individual access, including user management and system administration.'
  from public.permissions permissions
  where permissions.key = any(v_permission_keys)
    and permissions.status = 'active'
  on conflict (profile_id, permission_id) do update
  set
    granted_by_user_id = excluded.granted_by_user_id,
    grant_reason = excluded.grant_reason;

  select count(*)
  into v_granted_count
  from public.profile_permissions profile_permissions
  join public.permissions permissions
    on permissions.id = profile_permissions.permission_id
  where profile_permissions.profile_id = v_profile_id
    and permissions.key = any(v_permission_keys);

  if v_granted_count <> cardinality(v_permission_keys) then
    raise exception
      'Expected % approved individual grants for Akanni Ahmad; found %.',
      cardinality(v_permission_keys),
      v_granted_count;
  end if;

  if not exists (
    select 1
    from public.cs_memberships memberships
    where memberships.user_id = v_profile_id
      and memberships.role = 'CS_MANAGER'
  ) then
    raise exception
      'Akanni Ahmad must retain separate CS_MANAGER membership for Content & Social access.';
  end if;

  insert into public.user_provisioning_audit_logs (
    actor_user_id,
    target_user_id,
    target_email,
    event_type,
    metadata
  ) values (
    null,
    v_profile_id,
    v_target_email,
    'permission_granted',
    jsonb_build_object(
      'source', 'approved_migration',
      'permission_keys', to_jsonb(v_permission_keys),
      'permission_count', cardinality(v_permission_keys),
      'scope', 'individual_profile_only',
      'content_social_authority', 'existing_cs_manager_membership',
      'content_social_global_permissions_changed', false,
      'ceo_approval_boundary_changed', false
    )
  );
end;
$migration$;
