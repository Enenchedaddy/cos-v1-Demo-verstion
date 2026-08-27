-- Phase 7B: staging-only Content & Social memberships for build/test roles.
-- This is deliberately restricted to the existing DELabs staging scope. It does
-- not alter Content & Social RLS policies, expose browser writes to memberships,
-- or grant access in any production project.

create table public.cs_staging_role_membership_grants (
  profile_id uuid not null
    references public.profiles(id) on delete cascade,
  membership_id uuid not null
    references public.cs_memberships(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, membership_id)
);

alter table public.cs_staging_role_membership_grants enable row level security;
revoke all on public.cs_staging_role_membership_grants from public, anon, authenticated;
grant select, insert, update, delete on public.cs_staging_role_membership_grants to service_role;

create function private.sync_staging_content_social_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_role_code text;
  v_membership_id uuid;
begin
  select roles.code
    into v_role_code
  from public.roles
  where roles.id = new.role_id;

  if new.status = 'active'
    and v_role_code in ('CEO', 'MANAGEMENT', 'SOFTWARE_ENGINEER') then
    insert into public.cs_memberships (
      user_id,
      workspace_id,
      client_id,
      brand_id,
      role,
      display_name
    ) values (
      new.id,
      '10000000-0000-4000-8000-000000000001'::uuid,
      '20000000-0000-4000-8000-000000000001'::uuid,
      '30000000-0000-4000-8000-000000000001'::uuid,
      'CS_MANAGER',
      concat_ws(' ', new.first_name, new.last_name)
    )
    on conflict (user_id, workspace_id, client_id, brand_id) do nothing
    returning id into v_membership_id;

    if v_membership_id is not null then
      insert into public.cs_staging_role_membership_grants (profile_id, membership_id)
      values (new.id, v_membership_id)
      on conflict do nothing;
    end if;
  else
    delete from public.cs_memberships memberships
    using public.cs_staging_role_membership_grants grants
    where grants.profile_id = new.id
      and memberships.id = grants.membership_id;
  end if;

  return new;
end;
$function$;

revoke all on function private.sync_staging_content_social_membership()
  from public, anon, authenticated;

create trigger profiles_sync_staging_content_social_membership
after insert or update of role_id, status on public.profiles
for each row execute function private.sync_staging_content_social_membership();

with inserted_memberships as (
  insert into public.cs_memberships (
    user_id,
    workspace_id,
    client_id,
    brand_id,
    role,
    display_name
  )
  select
    profiles.id,
    '10000000-0000-4000-8000-000000000001'::uuid,
    '20000000-0000-4000-8000-000000000001'::uuid,
    '30000000-0000-4000-8000-000000000001'::uuid,
    'CS_MANAGER',
    concat_ws(' ', profiles.first_name, profiles.last_name)
  from public.profiles
  join public.roles on roles.id = profiles.role_id
  where profiles.status = 'active'
    and roles.code in ('CEO', 'MANAGEMENT', 'SOFTWARE_ENGINEER')
  on conflict (user_id, workspace_id, client_id, brand_id) do nothing
  returning id, user_id
)
insert into public.cs_staging_role_membership_grants (profile_id, membership_id)
select user_id, id
from inserted_memberships
on conflict do nothing;
