-- Additive Content & Social publisher. No company fixtures, role assignments, global
-- permissions, production configuration, or scheduler activation are included.

-- Existing predicates accidentally resolved unqualified columns to the membership.
alter policy cs_workspaces_member_select on public.cs_workspaces using (
  exists (select 1 from public.cs_memberships m where m.user_id = (select auth.uid()) and m.workspace_id = cs_workspaces.id)
);
alter policy cs_clients_member_select on public.cs_clients using (
  exists (select 1 from public.cs_memberships m where m.user_id = (select auth.uid())
    and m.workspace_id = cs_clients.workspace_id and (m.client_id is null or m.client_id = cs_clients.id))
);
alter table public.cs_brands add constraint cs_brands_company_scope_fk
  foreign key (workspace_id, client_id) references public.cs_clients(workspace_id, id) not valid;
alter table public.cs_brands validate constraint cs_brands_company_scope_fk;

create function private.cs_publisher_role(p_actor uuid, p_workspace uuid, p_company uuid, p_brand uuid, p_roles text[])
returns boolean language sql stable security definer set search_path = '' as $$
  select p_actor is not null
    and exists (select 1 from public.profiles p where p.id = p_actor and p.status = 'active')
    and exists (select 1 from public.cs_memberships m where m.user_id = p_actor
      and m.workspace_id = p_workspace and (m.client_id is null or m.client_id = p_company)
      and (m.brand_id is null or m.brand_id = p_brand) and (p_roles is null or m.role = any(p_roles)));
$$;
revoke all on function private.cs_publisher_role(uuid, uuid, uuid, uuid, text[]) from public, anon, authenticated;

create function private.cs_publisher_access(p_workspace uuid, p_company uuid, p_brand uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null and private.cs_publisher_role((select auth.uid()), p_workspace, p_company, p_brand, null);
$$;
revoke all on function private.cs_publisher_access(uuid, uuid, uuid) from public, anon;
grant execute on function private.cs_publisher_access(uuid, uuid, uuid) to authenticated;

-- Retain the existing responsibility-matrix policies. This additional restrictive
-- gate prevents a suspended/deleted COS profile from using an unexpired JWT to
-- access publisher content through legacy REST endpoints.
do $$ declare relation text; begin
  foreach relation in array array['cs_content_items','cs_platform_variants','cs_content_versions','cs_approval_requests','cs_schedules','cs_publish_records'] loop
    execute format('create policy cs_publisher_active_member_guard on public.%I as restrictive for all to authenticated using (private.cs_publisher_access(workspace_id, client_id, brand_id)) with check (private.cs_publisher_access(workspace_id, client_id, brand_id))', relation);
  end loop;
end; $$;

create function private.cs_company_directory()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare actor uuid := (select auth.uid()); result jsonb;
begin
  if actor is null or not exists (select 1 from public.profiles where id = actor and status = 'active') then
    raise exception 'Active COS membership required' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'workspaces', (select coalesce(jsonb_agg(to_jsonb(w) order by w.name, w.id), '[]') from public.cs_workspaces w
      where exists (select 1 from public.cs_memberships m where m.user_id = actor and m.workspace_id = w.id)),
    'companies', (select coalesce(jsonb_agg(to_jsonb(c) order by c.name, c.id), '[]') from public.cs_clients c
      where exists (select 1 from public.cs_memberships m where m.user_id = actor and m.workspace_id = c.workspace_id and (m.client_id is null or m.client_id = c.id))),
    'brands', (select coalesce(jsonb_agg(to_jsonb(b) order by b.name, b.id), '[]') from public.cs_brands b
      where private.cs_publisher_role(actor, b.workspace_id, b.client_id, b.id, null)),
    'memberships', (select coalesce(jsonb_agg(jsonb_build_object('workspace_id', m.workspace_id, 'client_id', m.client_id, 'brand_id', m.brand_id, 'role', m.role)), '[]')
      from public.cs_memberships m where m.user_id = actor)
  ) into result;
  return result;
end;
$$;
revoke all on function private.cs_company_directory() from public, anon;
grant execute on function private.cs_company_directory() to authenticated;
create function public.cs_company_directory() returns jsonb language sql security invoker set search_path = '' as $$ select private.cs_company_directory(); $$;
revoke all on function public.cs_company_directory() from public, anon;
grant execute on function public.cs_company_directory() to authenticated;

create table public.cs_social_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null, client_id uuid not null, brand_id uuid not null,
  provider text not null default 'INSTAGRAM' check (provider = 'INSTAGRAM'),
  provider_account_id text not null check (provider_account_id ~ '^[0-9]+$'),
  username text not null,
  status text not null check (status in ('CONNECTED','DISCONNECTED','RECONNECT_REQUIRED')),
  token_expires_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  foreign key (workspace_id, client_id, brand_id) references public.cs_brands(workspace_id, client_id, id),
  unique (workspace_id, provider, provider_account_id),
  unique (workspace_id, client_id, brand_id, id)
);
create index cs_social_accounts_brand_idx on public.cs_social_accounts(brand_id);
create index cs_social_accounts_creator_idx on public.cs_social_accounts(created_by);

create table public.cs_publisher_media (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null, client_id uuid not null, brand_id uuid not null,
  storage_path text not null unique, sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  width integer not null check (width between 320 and 1440), height integer not null check (height > 0),
  byte_size integer not null check (byte_size between 1 and 8388608),
  created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
  foreign key (workspace_id, client_id, brand_id) references public.cs_brands(workspace_id, client_id, id),
  unique (workspace_id, client_id, brand_id, id),
  check (width::numeric / height between 0.8 and 1.91)
);
create index cs_publisher_media_brand_idx on public.cs_publisher_media(brand_id);
create index cs_publisher_media_creator_idx on public.cs_publisher_media(created_by);
alter table public.cs_content_versions add column publisher_media_id uuid;
alter table public.cs_content_versions add constraint cs_versions_publisher_media_scope_fk
  foreign key (workspace_id, client_id, brand_id, publisher_media_id) references public.cs_publisher_media(workspace_id, client_id, brand_id, id);
create index cs_versions_publisher_media_idx on public.cs_content_versions(publisher_media_id) where publisher_media_id is not null;
alter table public.cs_schedules add column social_account_id uuid;
alter table public.cs_schedules add constraint cs_schedules_social_account_scope_fk
  foreign key (workspace_id, client_id, brand_id, social_account_id) references public.cs_social_accounts(workspace_id, client_id, brand_id, id);
create index cs_schedules_social_account_idx on public.cs_schedules(social_account_id) where social_account_id is not null;

create table public.cs_publisher_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null, client_id uuid not null, brand_id uuid not null,
  schedule_id uuid not null unique references public.cs_schedules(id),
  account_id uuid not null, content_item_id uuid not null references public.cs_content_items(id),
  variant_id uuid not null references public.cs_platform_variants(id), version_id uuid not null references public.cs_content_versions(id),
  requested_by uuid not null references auth.users(id), request_id uuid not null,
  planned_at timestamptz not null, timezone text not null,
  status text not null default 'QUEUED' check (status in ('QUEUED','PROCESSING','PUBLISHED','FAILED','CANCELLED','NEEDS_REVIEW')),
  attempts integer not null default 0, next_attempt_at timestamptz not null,
  last_error text, external_url text, external_id text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (workspace_id, client_id, brand_id, account_id) references public.cs_social_accounts(workspace_id, client_id, brand_id, id),
  unique (requested_by, request_id)
);
create unique index cs_publisher_one_delivery_idx on public.cs_publisher_jobs(account_id, version_id) where status <> 'CANCELLED';
create index cs_publisher_due_idx on public.cs_publisher_jobs(next_attempt_at, id) where status in ('QUEUED','PROCESSING');
create index cs_publisher_jobs_scope_idx on public.cs_publisher_jobs(workspace_id, client_id, brand_id, created_at desc);
create index cs_publisher_jobs_content_idx on public.cs_publisher_jobs(content_item_id);
create index cs_publisher_jobs_variant_idx on public.cs_publisher_jobs(variant_id);
create index cs_publisher_jobs_version_idx on public.cs_publisher_jobs(version_id);

create table private.cs_publisher_credentials (
  account_id uuid primary key references public.cs_social_accounts(id),
  secret_id uuid not null references vault.secrets(id)
);
create index cs_publisher_credentials_secret_idx on private.cs_publisher_credentials(secret_id);
create table private.cs_publisher_oauth (
  state_hash text primary key check (state_hash ~ '^[a-f0-9]{64}$'),
  actor_id uuid not null references auth.users(id), brand_id uuid not null references public.cs_brands(id),
  expires_at timestamptz not null, consumed_at timestamptz, completed_at timestamptz
);
create index cs_publisher_oauth_actor_idx on private.cs_publisher_oauth(actor_id);
create index cs_publisher_oauth_brand_idx on private.cs_publisher_oauth(brand_id);
create table private.cs_publisher_runtime (
  job_id uuid primary key references public.cs_publisher_jobs(id),
  lease_id uuid, lease_expires_at timestamptz, container_id text,
  publish_started boolean not null default false, provider_media_id text
  , retry_attempts integer not null default 0
);
create table public.cs_publisher_attempts (
  id uuid primary key default gen_random_uuid(), job_id uuid not null references public.cs_publisher_jobs(id),
  occurred_at timestamptz not null default now(), status text not null, message text
);
create index cs_publisher_attempts_job_idx on public.cs_publisher_attempts(job_id, occurred_at desc);

alter table public.cs_social_accounts enable row level security;
alter table public.cs_publisher_media enable row level security;
alter table public.cs_publisher_jobs enable row level security;
alter table public.cs_publisher_attempts enable row level security;
alter table private.cs_publisher_credentials enable row level security;
alter table private.cs_publisher_oauth enable row level security;
alter table private.cs_publisher_runtime enable row level security;
revoke all on public.cs_social_accounts, public.cs_publisher_media, public.cs_publisher_jobs, public.cs_publisher_attempts from public, anon, authenticated;
revoke all on private.cs_publisher_credentials, private.cs_publisher_oauth, private.cs_publisher_runtime from public, anon, authenticated;
grant select on public.cs_social_accounts, public.cs_publisher_media, public.cs_publisher_jobs, public.cs_publisher_attempts to authenticated;
create policy cs_social_accounts_read on public.cs_social_accounts for select to authenticated using (private.cs_publisher_access(workspace_id, client_id, brand_id));
create policy cs_publisher_media_read on public.cs_publisher_media for select to authenticated using (private.cs_publisher_access(workspace_id, client_id, brand_id));
create policy cs_publisher_jobs_read on public.cs_publisher_jobs for select to authenticated using (private.cs_publisher_access(workspace_id, client_id, brand_id));
create policy cs_publisher_attempts_read on public.cs_publisher_attempts for select to authenticated using (exists (select 1 from public.cs_publisher_jobs j where j.id = cs_publisher_attempts.job_id));

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('cs-publisher', 'cs-publisher', false, 8388608, array['image/jpeg']) on conflict (id) do nothing;
do $$ begin
  if exists(select 1 from storage.buckets where id = 'cs-publisher' and public) then
    raise exception 'The cs-publisher bucket must be private; review the existing bucket before activation';
  end if;
end; $$;
-- No browser insert/update/delete policies: upload bytes and validation are server-only.
create policy cs_publisher_image_read on storage.objects for select to authenticated using (
  bucket_id = 'cs-publisher' and exists (select 1 from public.cs_publisher_media m
    where m.storage_path = storage.objects.name and private.cs_publisher_access(m.workspace_id, m.client_id, m.brand_id))
);

create function private.cs_publisher_audit(p_workspace uuid, p_company uuid, p_brand uuid, p_actor uuid, p_action text, p_target uuid)
returns void language sql security definer set search_path = '' as $$
  insert into public.cs_audit_events(id, workspace_id, client_id, brand_id, actor_type, actor_id, actor_name, action, target_type, target_id, result, summary, request_id)
  values (gen_random_uuid(), p_workspace, p_company, p_brand, case when p_actor is null then 'SYSTEM' else 'USER' end,
    coalesce(p_actor::text, 'publisher-worker'), 'Social Publisher', p_action, 'SocialPublisher', p_target::text,
    'SUCCESS', p_action, gen_random_uuid()::text);
$$;
revoke all on function private.cs_publisher_audit(uuid, uuid, uuid, uuid, text, uuid) from public, anon, authenticated;

-- This check is repeated at queue time, claim time, and immediately before dispatch.
create function private.cs_publisher_version_valid(p_version uuid, p_account uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.cs_content_versions v
    join public.cs_platform_variants pv on pv.id = v.variant_id and pv.content_item_id = v.content_item_id
    join public.cs_content_items i on i.id = v.content_item_id
    join public.cs_briefs b on b.id = i.brief_id
    join public.cs_social_accounts a on a.id = p_account
    join public.cs_publisher_media m on m.id = v.publisher_media_id
    where v.id = p_version and pv.current_version_id = v.id and i.current_version_id = v.id
      and v.deleted_at is null and pv.deleted_at is null and i.deleted_at is null and i.archived_at is null
      and b.status = 'APPROVED' and b.deleted_at is null and i.lifecycle_state in ('INTERNAL_REVIEW','CLIENT_APPROVAL','SCHEDULED')
      and pv.channel = 'Instagram' and pv.format = 'Static' and char_length(v.copy) between 1 and 2200
      and (v.workspace_id, v.client_id, v.brand_id) = (a.workspace_id, a.client_id, a.brand_id)
      and (pv.workspace_id, pv.client_id, pv.brand_id) = (v.workspace_id, v.client_id, v.brand_id)
      and (i.workspace_id, i.client_id, i.brand_id) = (v.workspace_id, v.client_id, v.brand_id)
      and (b.workspace_id, b.client_id, b.brand_id) = (v.workspace_id, v.client_id, v.brand_id)
      and exists (select 1 from public.cs_approval_requests ar where ar.content_item_id = i.id
        and ar.workspace_id = v.workspace_id and ar.client_id = v.client_id and ar.brand_id = v.brand_id
        and ar.status = 'APPROVED' and ar.deleted_at is null
        and exists (select 1 from jsonb_array_elements(ar.targets) t where t->>'version_id' = v.id::text and t->>'variant_id' = pv.id::text))
  );
$$;
revoke all on function private.cs_publisher_version_valid(uuid, uuid) from public, anon, authenticated;

create function private.cs_publisher_command(p_action text, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid()); b public.cs_brands%rowtype; a public.cs_social_accounts%rowtype;
  brief public.cs_briefs%rowtype; item public.cs_content_items%rowtype; variant public.cs_platform_variants%rowtype;
  version public.cs_content_versions%rowtype; approval public.cs_approval_requests%rowtype; job public.cs_publisher_jobs%rowtype;
  media public.cs_publisher_media%rowtype; workspace uuid; company uuid; result_id uuid := gen_random_uuid();
  item_id uuid := gen_random_uuid(); variant_id uuid := gen_random_uuid(); version_id uuid := gen_random_uuid();
  schedule_id uuid := gen_random_uuid(); caption text; local_name text; planned timestamptz; zone text; version_number integer; secret uuid;
begin
  if actor is null or not exists (select 1 from public.profiles where id = actor and status = 'active') then
    raise exception 'Active COS account required' using errcode = '42501';
  end if;
  if p_action in ('company.create', 'brand.create') then
    workspace := (p_payload->>'workspace_id')::uuid;
    company := case when p_action = 'brand.create' then (p_payload->>'client_id')::uuid else null end;
    if not private.cs_publisher_role(actor, workspace, company, null, array['CS_MANAGER','MODULE_ADMIN']) then
      raise exception 'Onboarding requires a manager or module administrator at the parent scope' using errcode = '42501';
    end if;
    local_name := trim(p_payload->>'name');
    if local_name is null or char_length(local_name) not between 1 and 160 then raise exception 'Enter a name of 1–160 characters'; end if;
    if p_action = 'company.create' then
      insert into public.cs_clients(id, workspace_id, name) values(result_id, workspace, local_name);
    else
      zone := p_payload->>'timezone';
      if zone is null or not exists(select 1 from pg_timezone_names where name = zone) then raise exception 'Choose a valid IANA timezone'; end if;
      insert into public.cs_brands(id, workspace_id, client_id, name, timezone) values(result_id, workspace, company, local_name, zone);
      perform private.cs_publisher_audit(workspace, company, result_id, actor, p_action, result_id);
    end if;
    return to_jsonb(result_id);
  end if;

  if p_action = 'oauth.begin' then
    select * into b from public.cs_brands where id = (p_payload->>'brand_id')::uuid;
    if b.id is null or not private.cs_publisher_role(actor, b.workspace_id, b.client_id, b.id, array['CS_MANAGER','MODULE_ADMIN']) then
      raise exception 'Connection management is not authorized for this brand' using errcode = '42501';
    end if;
    insert into private.cs_publisher_oauth(state_hash, actor_id, brand_id, expires_at)
      values (p_payload->>'state_hash', actor, b.id, now() + interval '10 minutes');
    return jsonb_build_object('ok', true);
  end if;

  if p_action = 'account.disconnect' then
    select * into a from public.cs_social_accounts where id = (p_payload->>'account_id')::uuid for update;
    if a.id is null or not private.cs_publisher_role(actor, a.workspace_id, a.client_id, a.brand_id, array['CS_MANAGER','MODULE_ADMIN']) then
      raise exception 'Connection management is not authorized' using errcode = '42501';
    end if;
    if exists(select 1 from public.cs_publisher_jobs where account_id = a.id and status = 'PROCESSING') then raise exception 'An active delivery is in progress. Try again after it completes.'; end if;
    update public.cs_social_accounts set status = 'DISCONNECTED', updated_at = now() where id = a.id;
    delete from private.cs_publisher_credentials where account_id = a.id returning secret_id into secret;
    delete from vault.secrets where id = secret;
    perform private.cs_publisher_audit(a.workspace_id, a.client_id, a.brand_id, actor, p_action, a.id);
    return jsonb_build_object('ok', true);
  end if;

  if p_action = 'post.create' then
    if p_payload->>'rights_confirmed' is distinct from 'true' then raise exception 'Confirm the brand has permission to publish this image'; end if;
    select * into a from public.cs_social_accounts where id = (p_payload->>'account_id')::uuid;
    select * into brief from public.cs_briefs where id = (p_payload->>'brief_id')::uuid for share;
    select * into media from public.cs_publisher_media where id = (p_payload->>'media_id')::uuid;
    if a.id is null or not private.cs_publisher_role(actor, a.workspace_id, a.client_id, a.brand_id, array['CS_MANAGER','PLANNER']) then
      raise exception 'Creating posts is not authorized' using errcode = '42501';
    end if;
    if a.status <> 'CONNECTED' or brief.id is null or brief.status <> 'APPROVED' or brief.deleted_at is not null
      or not brief.channels @> '["Instagram"]' or not brief.formats @> '["Static"]'
      or (brief.workspace_id, brief.client_id, brief.brand_id) <> (a.workspace_id, a.client_id, a.brand_id)
      or media.id is null or (media.workspace_id, media.client_id, media.brand_id) <> (a.workspace_id, a.client_id, a.brand_id)
      or not exists(select 1 from storage.objects where bucket_id = 'cs-publisher' and name = media.storage_path) then
      raise exception 'A connected account, approved Instagram/Static brief and uploaded image in the same brand are required';
    end if;
    caption := trim(p_payload->>'caption');
    if caption is null or char_length(caption) not between 1 and 2200 then raise exception 'Enter a caption of 1–2200 characters'; end if;
    insert into public.cs_content_items(id, workspace_id, client_id, brand_id, content_number, title, brief_id, owner,
      lifecycle_state, priority, due_date, primary_channel, format, current_version_id, created_at, created_by, updated_at, updated_by, revision)
      values(item_id, a.workspace_id, a.client_id, a.brand_id, 'CNT-' || item_id::text, brief.title, brief.id, brief.owner,
        'INTERNAL_REVIEW', 'MEDIUM', brief.due_date, 'Instagram', 'Static', version_id, now(), actor, now(), actor, 1);
    insert into public.cs_platform_variants(id, workspace_id, client_id, brand_id, content_item_id, channel, format, title, copy, call_to_action, current_version_id, created_at, created_by, updated_at, updated_by, revision)
      values(variant_id, a.workspace_id, a.client_id, a.brand_id, item_id, 'Instagram', 'Static', 'Instagram image', caption, brief.call_to_action, version_id, now(), actor, now(), actor, 1);
    insert into public.cs_content_versions(id, workspace_id, client_id, brand_id, content_item_id, variant_id, version_number, copy, change_summary, publisher_media_id, submitted_at, created_at, created_by, updated_at, updated_by, revision)
      values(version_id, a.workspace_id, a.client_id, a.brand_id, item_id, variant_id, 1, caption, 'Created in Social Publisher; image rights confirmed by author.', media.id, now(), now(), actor, now(), actor, 1);
    perform private.cs_publisher_audit(a.workspace_id, a.client_id, a.brand_id, actor, p_action, item_id);
    return to_jsonb(item_id);
  end if;

  if p_action = 'version.create' then
    if nullif(p_payload->>'external_asset_url','') is not null and p_payload->>'external_asset_url' !~ '^https?://' then raise exception 'Only HTTP or HTTPS asset links are allowed'; end if;
    select * into item from public.cs_content_items where id = (p_payload->>'item_id')::uuid for update;
    if item.id is null or not private.cs_publisher_role(actor, item.workspace_id, item.client_id, item.brand_id, array['CS_MANAGER','CONTRIBUTOR']) then raise exception 'Version creation is not authorized' using errcode = '42501'; end if;
    if item.lifecycle_state in ('PUBLISHED','PERFORMANCE_REVIEW','ARCHIVED','CANCELLED') or item.deleted_at is not null then raise exception 'This item cannot be revised'; end if;
    if exists(select 1 from public.cs_publisher_jobs where content_item_id = item.id and status = 'PROCESSING') then raise exception 'Wait for the active delivery before editing'; end if;
    select * into variant from public.cs_platform_variants where content_item_id = item.id order by id limit 1 for update;
    if variant.id is null then raise exception 'Variant not found'; end if;
    select * into version from public.cs_content_versions where id = variant.current_version_id;
    select coalesce(max(v.version_number), 0) + 1 into version_number from public.cs_content_versions v where v.variant_id = variant.id;
    caption := trim(p_payload->>'copy');
    if caption is null or char_length(caption) not between 1 and 5000 or (variant.channel = 'Instagram' and char_length(caption) > 2200) then raise exception 'Invalid copy length'; end if;
    insert into public.cs_content_versions(id, workspace_id, client_id, brand_id, content_item_id, variant_id, version_number, copy, change_summary, external_asset_url, publisher_media_id, submitted_at, created_at, created_by, updated_at, updated_by, revision)
      values(version_id, item.workspace_id, item.client_id, item.brand_id, item.id, variant.id, version_number, caption,
        coalesce(nullif(trim(p_payload->>'change_summary'), ''), 'Content revised'), nullif(p_payload->>'external_asset_url',''),
        case when nullif(p_payload->>'external_asset_url','') is null then version.publisher_media_id else null end, now(), now(), actor, now(), actor, 1);
    update public.cs_platform_variants set current_version_id = version_id, copy = caption, updated_at = now(), updated_by = actor, revision = revision + 1 where id = variant.id;
    update public.cs_content_items set current_version_id = version_id, updated_at = now(), updated_by = actor, revision = revision + 1,
      lifecycle_state = case when lifecycle_state = 'SCHEDULED' then 'INTERNAL_REVIEW' else lifecycle_state end where id = item.id;
    perform private.cs_publisher_audit(item.workspace_id, item.client_id, item.brand_id, actor, p_action, version_id);
    return to_jsonb(version_id);
  end if;

  if p_action = 'approval.request' then
    select * into item from public.cs_content_items where id = (p_payload->>'item_id')::uuid for update;
    if item.id is null or not private.cs_publisher_role(actor, item.workspace_id, item.client_id, item.brand_id, array['CS_MANAGER','ACCOUNT_BRAND']) then raise exception 'Approval requests are not authorized' using errcode = '42501'; end if;
    select * into version from public.cs_content_versions where id = item.current_version_id;
    select * into variant from public.cs_platform_variants where id = version.variant_id;
    if version.id is null or variant.current_version_id is distinct from version.id or item.lifecycle_state not in ('INTERNAL_REVIEW','CLIENT_APPROVAL') then raise exception 'Submit a current version for internal review first'; end if;
    if exists(select 1 from public.cs_approval_requests ar where ar.content_item_id = item.id and ar.status = 'PENDING' and ar.deleted_at is null) then raise exception 'An approval is already pending'; end if;
    insert into public.cs_approval_requests(id, workspace_id, client_id, brand_id, approval_number, content_item_id, title, route_name, step_name, status, targets,
      requested_by, requested_at, due_at, client_visible, created_at, created_by, updated_at, updated_by, revision)
      values(result_id, item.workspace_id, item.client_id, item.brand_id, 'APR-' || result_id::text, item.id, item.title, 'Brand content approval', 'Exact version decision', 'PENDING',
        jsonb_build_array(jsonb_build_object('variant_id', variant.id, 'version_id', version.id, 'channel', variant.channel, 'version_number', version.version_number)),
        (select first_name || ' ' || last_name from public.profiles where id = actor), now(), now() + interval '2 days', true, now(), actor, now(), actor, 1);
    -- ACCOUNT_BRAND can request approval, not edit the production lifecycle.
    if private.cs_has_role(item.workspace_id, item.client_id, item.brand_id, array['CS_MANAGER']) then
      update public.cs_content_items set lifecycle_state = 'CLIENT_APPROVAL', updated_at = now(), updated_by = actor, revision = revision + 1 where id = item.id;
    end if;
    perform private.cs_publisher_audit(item.workspace_id, item.client_id, item.brand_id, actor, p_action, result_id);
    return to_jsonb(result_id);
  end if;
  if p_action = 'approval.decide' then
    select * into approval from public.cs_approval_requests where id = (p_payload->>'approval_id')::uuid for update;
    if approval.id is null or not private.cs_publisher_role(actor, approval.workspace_id, approval.client_id, approval.brand_id, array['CS_MANAGER','CLIENT_APPROVER']) then raise exception 'Approval decisions are not authorized' using errcode = '42501'; end if;
    local_name := p_payload->>'decision';
    if approval.status <> 'PENDING' or local_name not in ('APPROVED','CHANGES_REQUESTED','REJECTED') then raise exception 'A valid decision on a pending approval is required'; end if;
    if local_name <> 'APPROVED' and nullif(trim(p_payload->>'comment'),'') is null then raise exception 'Explain the requested change or rejection'; end if;
    if exists(select 1 from jsonb_array_elements(approval.targets) t left join public.cs_platform_variants pv on pv.id = (t->>'variant_id')::uuid
      where pv.current_version_id is distinct from (t->>'version_id')::uuid) then raise exception 'The approval is stale; request approval of the new version'; end if;
    update public.cs_approval_requests set status = local_name, token_revoked_at = now(), updated_at = now(), updated_by = actor, revision = revision + 1,
      decisions = decisions || jsonb_build_array(jsonb_build_object('id', result_id, 'action', local_name, 'actor_id', actor,
        'actor_name', (select first_name || ' ' || last_name from public.profiles where id = actor), 'comment', coalesce(p_payload->>'comment',''), 'decided_at', now())) where id = approval.id;
    if local_name = 'CHANGES_REQUESTED' then
      update public.cs_content_items set exceptions = exceptions || jsonb_build_array(jsonb_build_object(
        'flag', 'NEEDS_CHANGES', 'reason', trim(p_payload->>'comment'), 'owner', owner,
        'opened_at', now(), 'opened_by', actor)), updated_at = now(), updated_by = actor, revision = revision + 1
        where id = approval.content_item_id;
    end if;
    perform private.cs_publisher_audit(approval.workspace_id, approval.client_id, approval.brand_id, actor, 'approval.' || lower(local_name), approval.id);
    return to_jsonb(approval.id);
  end if;

  if p_action = 'schedule' then
    select * into a from public.cs_social_accounts where id = (p_payload->>'account_id')::uuid for share;
    if a.id is null or not private.cs_publisher_role(actor, a.workspace_id, a.client_id, a.brand_id, array['CS_MANAGER','SOCIAL_COMMUNITY']) then raise exception 'Publishing is not authorized' using errcode = '42501'; end if;
    select * into job from public.cs_publisher_jobs where requested_by = actor and request_id = (p_payload->>'request_id')::uuid;
    if job.id is not null then
      if job.account_id <> a.id or job.version_id <> (p_payload->>'version_id')::uuid then raise exception 'Request ID was already used for a different post'; end if;
      return to_jsonb(job.id);
    end if;
    select * into version from public.cs_content_versions where id = (p_payload->>'version_id')::uuid;
    select * into item from public.cs_content_items where id = version.content_item_id for update;
    if a.status <> 'CONNECTED' or a.token_expires_at <= now() or not private.cs_publisher_version_valid(version.id, a.id) then raise exception 'A connected account and current approved image version in this brand are required'; end if;
    zone := p_payload->>'timezone'; planned := (p_payload->>'planned_at')::timestamptz;
    if planned is null or planned < now() - interval '1 minute' or zone is null or not exists(select 1 from pg_timezone_names where name = zone) then raise exception 'Choose a future time and valid timezone'; end if;
    insert into public.cs_schedules(id, workspace_id, client_id, brand_id, content_item_id, variant_id, version_id, channel, planned_at, timezone, publish_method, status, social_account_id, created_at, created_by, updated_at, updated_by, revision)
      values(schedule_id, a.workspace_id, a.client_id, a.brand_id, item.id, version.variant_id, version.id, 'Instagram', planned, zone, 'CONNECTOR', 'READY', a.id, now(), actor, now(), actor, 1);
    insert into public.cs_publisher_jobs(id, workspace_id, client_id, brand_id, schedule_id, account_id, content_item_id, variant_id, version_id, requested_by, request_id, planned_at, timezone, next_attempt_at)
      values(result_id, a.workspace_id, a.client_id, a.brand_id, schedule_id, a.id, item.id, version.variant_id, version.id, actor, (p_payload->>'request_id')::uuid, planned, zone, planned);
    insert into private.cs_publisher_runtime(job_id) values(result_id);
    update public.cs_content_items set lifecycle_state = 'SCHEDULED', updated_at = now(), updated_by = actor, revision = revision + 1 where id = item.id;
    perform private.cs_publisher_audit(a.workspace_id, a.client_id, a.brand_id, actor, p_action, result_id);
    return to_jsonb(result_id);
  end if;

  if p_action = 'job.retry' then
    select * into job from public.cs_publisher_jobs where id = (p_payload->>'job_id')::uuid for update;
    if job.id is null or not private.cs_publisher_role(actor, job.workspace_id, job.client_id, job.brand_id, array['CS_MANAGER','SOCIAL_COMMUNITY']) then raise exception 'Retry is not authorized' using errcode = '42501'; end if;
    if job.status <> 'FAILED' or exists(select 1 from private.cs_publisher_runtime where job_id = job.id and publish_started) then raise exception 'Only confirmed pre-dispatch failures can be retried'; end if;
    if not private.cs_publisher_version_valid(job.version_id, job.account_id) or not exists(select 1 from public.cs_social_accounts where id = job.account_id and status = 'CONNECTED' and token_expires_at > now()) then raise exception 'Reconnect the account and obtain approval of the current version before retrying'; end if;
    update public.cs_publisher_jobs set requested_by = actor, status = 'QUEUED', last_error = null, next_attempt_at = now(), updated_at = now() where id = job.id;
    update private.cs_publisher_runtime set retry_attempts = 0, container_id = null, lease_id = null, lease_expires_at = null where job_id = job.id;
    update public.cs_schedules set status = 'READY', updated_at = now(), updated_by = actor, revision = revision + 1 where id = job.schedule_id;
    perform private.cs_publisher_audit(job.workspace_id, job.client_id, job.brand_id, actor, p_action, job.id);
    return to_jsonb(job.id);
  end if;
  if p_action = 'job.cancel' then
    select * into job from public.cs_publisher_jobs where id = (p_payload->>'job_id')::uuid for update;
    if job.id is null or not private.cs_publisher_role(actor, job.workspace_id, job.client_id, job.brand_id, array['CS_MANAGER','SOCIAL_COMMUNITY']) then raise exception 'Cancellation is not authorized' using errcode = '42501'; end if;
    if job.status <> 'QUEUED' then raise exception 'Only queued jobs can be cancelled'; end if;
    update public.cs_publisher_jobs set status = 'CANCELLED', updated_at = now() where id = job.id;
    update public.cs_schedules set status = 'CANCELLED', updated_at = now(), updated_by = actor, revision = revision + 1 where id = job.schedule_id;
    perform private.cs_publisher_audit(job.workspace_id, job.client_id, job.brand_id, actor, p_action, job.id);
    return to_jsonb(job.id);
  end if;
  raise exception 'Unsupported publisher action' using errcode = '22023';
end;
$$;
revoke all on function private.cs_publisher_command(text, jsonb) from public, anon;
grant execute on function private.cs_publisher_command(text, jsonb) to authenticated;
create function public.cs_publisher_command(p_action text, p_payload jsonb) returns jsonb language sql security invoker set search_path = '' as $$ select private.cs_publisher_command(p_action, p_payload); $$;
revoke all on function public.cs_publisher_command(text, jsonb) from public, anon;
grant execute on function public.cs_publisher_command(text, jsonb) to authenticated;

-- Only this service-role RPC can read tokens, claim leases or confirm connector results.
create function private.cs_publisher_service(p_action text, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  oauth private.cs_publisher_oauth%rowtype; b public.cs_brands%rowtype; a public.cs_social_accounts%rowtype;
  job public.cs_publisher_jobs%rowtype; runtime private.cs_publisher_runtime%rowtype;
  v public.cs_content_versions%rowtype; media public.cs_publisher_media%rowtype;
  actor uuid; result_id uuid := gen_random_uuid(); secret uuid; token text; next_status text; message text; approval_data jsonb;
begin
  if p_action = 'media.preview' then
    select * into v from public.cs_content_versions where id = (p_payload->>'version_id')::uuid and deleted_at is null;
    if nullif(p_payload->>'approval_token','') is not null then
      approval_data := public.cs_client_approval(p_payload->>'approval_token');
      if not exists(select 1 from jsonb_array_elements(approval_data->'targets') t where t->>'versionId' = v.id::text) then raise exception 'This image is not part of the approval'; end if;
    elsif v.id is null or not private.cs_publisher_role((p_payload->>'actor_id')::uuid, v.workspace_id, v.client_id, v.brand_id, null) then
      raise exception 'Image preview is not authorized' using errcode = '42501';
    end if;
    select * into media from public.cs_publisher_media where id = v.publisher_media_id;
    return jsonb_build_object('storage_path', media.storage_path);
  end if;
  if p_action = 'oauth.consume' then
    update private.cs_publisher_oauth set consumed_at = now()
      where state_hash = p_payload->>'state_hash' and consumed_at is null and expires_at > now() returning * into oauth;
    if oauth.state_hash is null then raise exception 'Connection request expired or already used'; end if;
    return jsonb_build_object('brand_id', oauth.brand_id);
  end if;
  if p_action = 'oauth.complete' then
    select * into oauth from private.cs_publisher_oauth where state_hash = p_payload->>'state_hash'
      and consumed_at is not null and completed_at is null and expires_at > now() for update;
    select * into b from public.cs_brands where id = oauth.brand_id;
    if b.id is null or not private.cs_publisher_role(oauth.actor_id, b.workspace_id, b.client_id, b.id, array['CS_MANAGER','MODULE_ADMIN']) then raise exception 'Connection authority expired' using errcode = '42501'; end if;
    select * into a from public.cs_social_accounts where workspace_id = b.workspace_id and provider = 'INSTAGRAM' and provider_account_id = p_payload->>'provider_account_id' for update;
    if a.id is not null and (a.client_id, a.brand_id) <> (b.client_id, b.id) then raise exception 'This account is already assigned to another brand'; end if;
    if nullif(p_payload->>'access_token','') is null or (p_payload->>'expires_at')::timestamptz <= now() then raise exception 'Invalid provider credential'; end if;
    if a.id is null then
      insert into public.cs_social_accounts(id, workspace_id, client_id, brand_id, provider_account_id, username, status, token_expires_at, created_by)
        values(result_id, b.workspace_id, b.client_id, b.id, p_payload->>'provider_account_id', p_payload->>'username', 'CONNECTED', (p_payload->>'expires_at')::timestamptz, oauth.actor_id) returning * into a;
    else
      update public.cs_social_accounts set username = p_payload->>'username', status = 'CONNECTED', token_expires_at = (p_payload->>'expires_at')::timestamptz, updated_at = now() where id = a.id;
    end if;
    select secret_id into secret from private.cs_publisher_credentials where account_id = a.id;
    if secret is null then
      select vault.create_secret(p_payload->>'access_token', 'cs-instagram-' || a.id::text) into secret;
      insert into private.cs_publisher_credentials(account_id, secret_id) values(a.id, secret);
    else
      perform vault.update_secret(secret, p_payload->>'access_token');
    end if;
    update private.cs_publisher_oauth set completed_at = now() where state_hash = oauth.state_hash;
    perform private.cs_publisher_audit(b.workspace_id, b.client_id, b.id, oauth.actor_id, 'account.connected', a.id);
    return to_jsonb(a.id);
  end if;
  if p_action = 'media.register' then
    actor := (p_payload->>'actor_id')::uuid;
    select * into b from public.cs_brands where id = (p_payload->>'brand_id')::uuid;
    if b.id is null or not private.cs_publisher_role(actor, b.workspace_id, b.client_id, b.id, array['CS_MANAGER','PLANNER','CONTRIBUTOR']) then raise exception 'Image upload is not authorized' using errcode = '42501'; end if;
    insert into public.cs_publisher_media(id, workspace_id, client_id, brand_id, storage_path, sha256, width, height, byte_size, created_by)
      values(result_id, b.workspace_id, b.client_id, b.id, b.workspace_id::text || '/' || b.client_id::text || '/' || b.id::text || '/' || result_id::text || '.jpg',
        p_payload->>'sha256', (p_payload->>'width')::integer, (p_payload->>'height')::integer, (p_payload->>'byte_size')::integer, actor) returning * into media;
    return to_jsonb(media);
  end if;
  if p_action = 'job.claim' then
    select j.* into job from public.cs_publisher_jobs j join private.cs_publisher_runtime r on r.job_id = j.id
      where (j.status = 'QUEUED' and j.next_attempt_at <= now()) or (j.status = 'PROCESSING' and r.lease_expires_at < now())
      order by j.next_attempt_at, j.id limit 1 for update of j skip locked;
    if job.id is null then return null; end if;
    select * into runtime from private.cs_publisher_runtime where job_id = job.id for update;
    if runtime.publish_started then
      update public.cs_publisher_jobs set status = 'NEEDS_REVIEW', last_error = 'Delivery was interrupted after dispatch. Reconcile the provider result before any repost.', updated_at = now() where id = job.id;
      insert into public.cs_publisher_attempts(job_id, status, message) values(job.id, 'NEEDS_REVIEW', 'Expired lease after dispatch; automatic retry stopped.');
      return null;
    end if;
    select * into a from public.cs_social_accounts where id = job.account_id;
    if a.status <> 'CONNECTED' or a.token_expires_at <= now()
      or not private.cs_publisher_role(job.requested_by, job.workspace_id, job.client_id, job.brand_id, array['CS_MANAGER','SOCIAL_COMMUNITY'])
      or not private.cs_publisher_version_valid(job.version_id, job.account_id) then
      update public.cs_publisher_jobs set status = 'FAILED', last_error = 'Approval, content, connection, or scoped access changed. Review before creating another post.', updated_at = now() where id = job.id;
      update public.cs_schedules set status = 'FAILED', updated_at = now(), revision = revision + 1 where id = job.schedule_id;
      insert into public.cs_publisher_attempts(job_id, status, message) values(job.id, 'FAILED', 'Preflight authorization or content validation failed.');
      return null;
    end if;
    select s.decrypted_secret into token from private.cs_publisher_credentials c join vault.decrypted_secrets s on s.id = c.secret_id where c.account_id = a.id;
    if token is null then raise exception 'Connection credential unavailable'; end if;
    select * into v from public.cs_content_versions where id = job.version_id;
    select * into media from public.cs_publisher_media where id = v.publisher_media_id;
    update public.cs_publisher_jobs set status = 'PROCESSING', attempts = attempts + 1, updated_at = now() where id = job.id;
    update private.cs_publisher_runtime set lease_id = result_id, lease_expires_at = now() + interval '2 minutes', retry_attempts = retry_attempts + 1 where job_id = job.id;
    insert into public.cs_publisher_attempts(job_id, status, message) values(job.id, 'PROCESSING', 'Worker claimed delivery.');
    return jsonb_build_object('job_id', job.id, 'lease_id', result_id, 'account_id', a.id, 'provider_account_id', a.provider_account_id,
      'access_token', token, 'expires_at', a.token_expires_at, 'caption', v.copy, 'media', to_jsonb(media), 'container_id', runtime.container_id, 'attempts', job.attempts + 1);
  end if;
  if p_action in ('job.container','job.authorize','job.result','account.refresh') then
    select * into job from public.cs_publisher_jobs where id = (p_payload->>'job_id')::uuid for update;
    select * into runtime from private.cs_publisher_runtime where job_id = job.id for update;
    if job.id is null or job.status <> 'PROCESSING' or runtime.lease_id is distinct from (p_payload->>'lease_id')::uuid or runtime.lease_expires_at <= now() then raise exception 'Worker lease expired' using errcode = '40001'; end if;
    if p_action = 'account.refresh' then
      if nullif(p_payload->>'access_token','') is null or (p_payload->>'expires_at')::timestamptz <= now() then raise exception 'Invalid refreshed token'; end if;
      select secret_id into secret from private.cs_publisher_credentials where account_id = job.account_id;
      perform vault.update_secret(secret, p_payload->>'access_token');
      update public.cs_social_accounts set token_expires_at = (p_payload->>'expires_at')::timestamptz, updated_at = now() where id = job.account_id;
      return jsonb_build_object('ok', true);
    end if;
    if p_action = 'job.container' then
      if runtime.publish_started or p_payload->>'container_id' !~ '^[0-9]+$' then raise exception 'Invalid container checkpoint'; end if;
      update private.cs_publisher_runtime set container_id = p_payload->>'container_id' where job_id = job.id;
      return jsonb_build_object('ok', true);
    end if;
    if p_action = 'job.authorize' then
      if runtime.publish_started or runtime.container_id is null then raise exception 'Dispatch already started or container missing'; end if;
      if not private.cs_publisher_role(job.requested_by, job.workspace_id, job.client_id, job.brand_id, array['CS_MANAGER','SOCIAL_COMMUNITY'])
        or not private.cs_publisher_version_valid(job.version_id, job.account_id)
        or not exists(select 1 from public.cs_social_accounts where id = job.account_id and status = 'CONNECTED' and token_expires_at > now()) then raise exception 'Publishing authority or content changed'; end if;
      update private.cs_publisher_runtime set publish_started = true where job_id = job.id;
      return jsonb_build_object('ok', true);
    end if;
    next_status := p_payload->>'status'; message := left(p_payload->>'message', 400);
    if next_status not in ('PUBLISHED','FAILED','QUEUED','NEEDS_REVIEW') then raise exception 'Invalid worker result'; end if;
    if runtime.publish_started and next_status in ('FAILED','QUEUED') then next_status := 'NEEDS_REVIEW'; end if;
    if next_status = 'QUEUED' and runtime.retry_attempts >= 5 then next_status := 'FAILED'; end if;
    if next_status = 'PUBLISHED' then
      if not runtime.publish_started or coalesce(p_payload->>'external_id','') !~ '^[0-9]+$' or coalesce(p_payload->>'external_url','') !~ '^https://(www\.)?instagram\.com/' then raise exception 'Provider evidence required'; end if;
      insert into public.cs_publish_records(id, workspace_id, client_id, brand_id, schedule_id, content_item_id, variant_id, version_id, channel, method, status, external_url, external_id, published_at, proof_note, attempts, created_at, created_by, updated_at, updated_by, revision)
        values(gen_random_uuid(), job.workspace_id, job.client_id, job.brand_id, job.schedule_id, job.content_item_id, job.variant_id, job.version_id, 'Instagram', 'CONNECTOR', 'PUBLISHED', p_payload->>'external_url', p_payload->>'external_id', now(), 'Instagram confirmed delivery; provider media ID ' || (p_payload->>'external_id'), job.attempts, now(), job.requested_by, now(), job.requested_by, 1);
      update public.cs_schedules set status = 'PUBLISHED', updated_at = now(), revision = revision + 1 where id = job.schedule_id;
      update public.cs_content_items set lifecycle_state = 'PUBLISHED', updated_at = now(), revision = revision + 1 where id = job.content_item_id;
      perform private.cs_publisher_audit(job.workspace_id, job.client_id, job.brand_id, null, 'publish.confirmed', job.id);
    elsif next_status in ('FAILED','NEEDS_REVIEW') then
      update public.cs_schedules set status = 'FAILED', updated_at = now(), revision = revision + 1 where id = job.schedule_id;
    end if;
    if p_payload->>'reconnect' = 'true' then update public.cs_social_accounts set status = 'RECONNECT_REQUIRED', updated_at = now() where id = job.account_id; end if;
    update public.cs_publisher_jobs set status = next_status, last_error = message,
      next_attempt_at = now() + make_interval(secs => least(3600, 60 * power(2, least(attempts - 1, 6))::integer)),
      external_url = p_payload->>'external_url', external_id = p_payload->>'external_id', updated_at = now() where id = job.id;
    update private.cs_publisher_runtime set lease_id = null, lease_expires_at = null, provider_media_id = p_payload->>'external_id' where job_id = job.id;
    insert into public.cs_publisher_attempts(job_id, status, message) values(job.id, next_status, message);
    return jsonb_build_object('status', next_status);
  end if;
  raise exception 'Unsupported service action';
end;
$$;
revoke all on function private.cs_publisher_service(text, jsonb) from public, anon, authenticated;
grant execute on function private.cs_publisher_service(text, jsonb) to service_role;
grant usage on schema private to service_role;
create function public.cs_publisher_service(p_action text, p_payload jsonb) returns jsonb language sql security invoker set search_path = '' as $$ select private.cs_publisher_service(p_action, p_payload); $$;
revoke all on function public.cs_publisher_service(text, jsonb) from public, anon, authenticated;
grant execute on function public.cs_publisher_service(text, jsonb) to service_role;

-- Security-invoker trigger distinguishes raw browser DML from checked definer commands.
create function private.cs_connector_write_guard() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if current_user in ('authenticated','anon') and (
    (tg_table_name = 'cs_schedules' and (to_jsonb(new)->>'publish_method' = 'CONNECTOR' or to_jsonb(old)->>'publish_method' = 'CONNECTOR')) or
    (tg_table_name = 'cs_publish_records' and (to_jsonb(new)->>'method' = 'CONNECTOR' or to_jsonb(old)->>'method' = 'CONNECTOR'))
  ) then raise exception 'Connector state is managed by the publisher service' using errcode = '42501'; end if;
  return new;
end;
$$;
revoke all on function private.cs_connector_write_guard() from public, anon, authenticated;
create trigger cs_connector_schedule_guard before insert or update on public.cs_schedules for each row execute function private.cs_connector_write_guard();
create trigger cs_connector_result_guard before insert or update on public.cs_publish_records for each row execute function private.cs_connector_write_guard();

-- Approval links must never expose a version belonging to a different company or
-- brand. Validate direct REST writes as well as the transactional commands.
create function private.cs_approval_reference_guard() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if exists (
    select 1 from jsonb_array_elements(new.targets) t
    where not exists (
      select 1 from public.cs_content_versions v
      join public.cs_platform_variants pv on pv.id = v.variant_id
      join public.cs_content_items i on i.id = v.content_item_id
      where v.id = (t->>'version_id')::uuid and pv.id = (t->>'variant_id')::uuid
        and i.id = new.content_item_id and pv.content_item_id = i.id
        and (v.workspace_id, v.client_id, v.brand_id) = (new.workspace_id, new.client_id, new.brand_id)
        and (pv.workspace_id, pv.client_id, pv.brand_id) = (new.workspace_id, new.client_id, new.brand_id)
        and (i.workspace_id, i.client_id, i.brand_id) = (new.workspace_id, new.client_id, new.brand_id)
    )
  ) then raise exception 'Approval targets must belong to the same content item and brand' using errcode = '23514'; end if;
  if current_user = 'authenticated' and new.status in ('APPROVED','REJECTED','CHANGES_REQUESTED')
    and (tg_op = 'INSERT' or old.status is distinct from new.status)
    and not private.cs_has_role(new.workspace_id, new.client_id, new.brand_id, array['CS_MANAGER','CLIENT_APPROVER']) then
    raise exception 'This scoped role cannot decide approvals' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function private.cs_approval_reference_guard() from public, anon, authenticated;
create trigger cs_approval_reference_guard before insert or update of targets, content_item_id, workspace_id, client_id, brand_id, status
  on public.cs_approval_requests for each row execute function private.cs_approval_reference_guard();

comment on table public.cs_clients is 'Company entities for Content & Social; legacy table name preserved for compatibility. Not Sales customer accounts.';
create or replace function public.cs_client_approval(
  p_token text,
  p_action text default null,
  p_comment text default null,
  p_identity text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  approval public.cs_approval_requests%rowtype;
  response_targets jsonb;
  decision_id uuid;
begin
  if length(coalesce(p_token, '')) <> 64 then
    raise exception 'Approval link is invalid or expired' using errcode = '22023';
  end if;
  select * into approval
  from public.cs_approval_requests
  where secure_token_hash = extensions.digest(convert_to(p_token, 'UTF8'), 'sha256')
    and client_visible = true and token_revoked_at is null and deleted_at is null
    and secure_token_expires_at > now();
  if approval.id is null then
    raise exception 'Approval link is invalid or expired' using errcode = '22023';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'variantId', target->>'variant_id', 'versionId', target->>'version_id',
    'versionNumber', (target->>'version_number')::integer, 'channel', target->>'channel',
    'copy', version.copy, 'externalAssetUrl', version.external_asset_url, 'publisherMediaId', version.publisher_media_id,
    'changeSummary', version.change_summary
  )), '[]'::jsonb) into response_targets
  from jsonb_array_elements(approval.targets) target
  join public.cs_content_versions version on version.id = (target->>'version_id')::uuid;

  if p_action is not null then
    if approval.status <> 'PENDING' then raise exception 'This approval has already been decided' using errcode = '23514'; end if;
    if upper(p_action) not in ('APPROVED','CHANGES_REQUESTED','REJECTED') then raise exception 'Unsupported approval decision' using errcode = '22023'; end if;
    if nullif(trim(coalesce(p_identity, '')), '') is null then raise exception 'Your name is required' using errcode = '23502'; end if;
    if upper(p_action) <> 'APPROVED' and nullif(trim(coalesce(p_comment, '')), '') is null then raise exception 'A comment is required for this decision' using errcode = '23502'; end if;
    if exists (
      select 1 from jsonb_array_elements(approval.targets) target
      left join public.cs_platform_variants variant on variant.id = (target->>'variant_id')::uuid
      where variant.id is null or variant.current_version_id <> (target->>'version_id')::uuid
    ) then
      update public.cs_approval_requests set status = 'STALE', updated_at = now(), revision = revision + 1 where id = approval.id;
      raise exception 'The content changed after this link was issued; a new approval is required' using errcode = '40001';
    end if;

    decision_id := extensions.gen_random_uuid();
    update public.cs_approval_requests
      set status = upper(p_action),
          decisions = decisions || jsonb_build_array(jsonb_build_object(
            'id', decision_id, 'action', upper(p_action), 'actorId', 'client-token',
            'actorName', trim(p_identity), 'comment', coalesce(p_comment, ''), 'decidedAt', now()
          )),
          token_revoked_at = now(), updated_at = now(), revision = revision + 1
      where id = approval.id;
    insert into public.cs_audit_events(id, workspace_id, client_id, brand_id, actor_type, actor_id, actor_name, action, target_type, target_id, target_version, result, summary, request_id)
      values (extensions.gen_random_uuid(), approval.workspace_id, approval.client_id, approval.brand_id, 'CLIENT_TOKEN', 'client-token', trim(p_identity), 'approval.' || lower(p_action), 'ContentApproval', approval.id::text, null, 'SUCCESS', 'Client decision recorded against exact immutable versions.', decision_id::text);
    approval.status := upper(p_action);
  end if;

  return jsonb_build_object(
    'approvalNumber', approval.approval_number, 'title', approval.title,
    'status', approval.status, 'dueAt', approval.due_at,
    'requestedBy', approval.requested_by, 'targets', response_targets
  );
end;
$$;
comment on function public.cs_publisher_service(text, jsonb) is 'Server-only: may return provider credentials. Never grant to browser roles or log returned values.';
