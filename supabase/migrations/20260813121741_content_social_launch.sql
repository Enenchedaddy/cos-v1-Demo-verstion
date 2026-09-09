-- Content & Social Launch schema for COS.
-- Apply after the legacy demo schema. All public tables use explicit grants and RLS.

create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.cs_workspaces (
  id uuid primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cs_clients (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id) on delete restrict,
  name text not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, id)
);

create table if not exists public.cs_brands (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id) on delete restrict,
  client_id uuid not null references public.cs_clients(id) on delete restrict,
  name text not null,
  timezone text not null default 'Europe/London',
  created_at timestamptz not null default now(),
  unique (workspace_id, client_id, id)
);

create table if not exists public.cs_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.cs_workspaces(id) on delete cascade,
  client_id uuid references public.cs_clients(id) on delete cascade,
  brand_id uuid references public.cs_brands(id) on delete cascade,
  role text not null check (role in ('CS_MANAGER','PLANNER','CONTRIBUTOR','SOCIAL_COMMUNITY','PERFORMANCE_ANALYST','ACCOUNT_BRAND','EXECUTIVE_VIEWER','MODULE_ADMIN','CLIENT_APPROVER')),
  display_name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, workspace_id, client_id, brand_id)
);

create or replace function private.cs_has_scope(p_workspace_id uuid, p_client_id uuid, p_brand_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.cs_memberships m
    where m.user_id = (select auth.uid())
      and m.workspace_id = p_workspace_id
      and (m.client_id is null or m.client_id = p_client_id)
      and (m.brand_id is null or m.brand_id = p_brand_id)
  );
$$;

create or replace function private.cs_has_role(p_workspace_id uuid, p_client_id uuid, p_brand_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.cs_memberships m
    where m.user_id = (select auth.uid())
      and m.workspace_id = p_workspace_id
      and (m.client_id is null or m.client_id = p_client_id)
      and (m.brand_id is null or m.brand_id = p_brand_id)
      and m.role = any(p_roles)
  );
$$;

revoke all on function private.cs_has_scope(uuid, uuid, uuid) from public, anon;
revoke all on function private.cs_has_role(uuid, uuid, uuid, text[]) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.cs_has_scope(uuid, uuid, uuid) to authenticated;
grant execute on function private.cs_has_role(uuid, uuid, uuid, text[]) to authenticated;

create table if not exists public.cs_ideas (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id), client_id uuid not null references public.cs_clients(id), brand_id uuid not null references public.cs_brands(id),
  title text not null check (char_length(title) between 1 and 140), summary text not null, source text not null, owner text not null,
  priority text not null check (priority in ('LOW','MEDIUM','HIGH','CRITICAL')),
  status text not null check (status in ('OPEN','CONVERTED','DISMISSED')), converted_brief_id uuid,
  created_at timestamptz not null, created_by uuid not null, updated_at timestamptz not null, updated_by uuid not null, revision integer not null check (revision > 0),
  archived_at timestamptz, deleted_at timestamptz, deleted_by uuid, deletion_reason text, purge_after timestamptz
);

create table if not exists public.cs_briefs (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id), client_id uuid not null references public.cs_clients(id), brand_id uuid not null references public.cs_brands(id),
  brief_number text not null, title text not null, objective text not null, audience text not null, key_message text not null, call_to_action text not null,
  channels jsonb not null default '[]', formats jsonb not null default '[]', owner text not null, due_date date not null,
  status text not null check (status in ('DRAFT','SUBMITTED','APPROVED','CHANGES_REQUESTED')),
  source_idea_id uuid references public.cs_ideas(id), campaign_name text, claims_notes text,
  created_at timestamptz not null, created_by uuid not null, updated_at timestamptz not null, updated_by uuid not null, revision integer not null check (revision > 0),
  archived_at timestamptz, deleted_at timestamptz, deleted_by uuid, deletion_reason text, purge_after timestamptz,
  unique (workspace_id, client_id, brand_id, brief_number)
);

alter table public.cs_ideas drop constraint if exists cs_ideas_converted_brief_id_fkey;
alter table public.cs_ideas add constraint cs_ideas_converted_brief_id_fkey foreign key (converted_brief_id) references public.cs_briefs(id) on delete set null;

create table if not exists public.cs_content_items (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id), client_id uuid not null references public.cs_clients(id), brand_id uuid not null references public.cs_brands(id),
  content_number text not null, title text not null, brief_id uuid not null references public.cs_briefs(id) on delete restrict, owner text not null,
  lifecycle_state text not null check (lifecycle_state in ('IDEA','BRIEF','ASSIGNED','IN_PRODUCTION','INTERNAL_REVIEW','CLIENT_APPROVAL','SCHEDULED','PUBLISHED','PERFORMANCE_REVIEW','ARCHIVED','CANCELLED')),
  priority text not null check (priority in ('LOW','MEDIUM','HIGH','CRITICAL')), due_date date not null, primary_channel text not null, format text not null,
  current_version_id uuid, exceptions jsonb not null default '[]', tags jsonb not null default '[]',
  created_at timestamptz not null, created_by uuid not null, updated_at timestamptz not null, updated_by uuid not null, revision integer not null check (revision > 0),
  archived_at timestamptz, deleted_at timestamptz, deleted_by uuid, deletion_reason text, purge_after timestamptz,
  unique (workspace_id, client_id, brand_id, content_number)
);

create table if not exists public.cs_platform_variants (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id), client_id uuid not null references public.cs_clients(id), brand_id uuid not null references public.cs_brands(id),
  content_item_id uuid not null references public.cs_content_items(id) on delete cascade, channel text not null, format text not null, title text not null, copy text not null, call_to_action text not null,
  current_version_id uuid,
  created_at timestamptz not null, created_by uuid not null, updated_at timestamptz not null, updated_by uuid not null, revision integer not null check (revision > 0),
  archived_at timestamptz, deleted_at timestamptz, deleted_by uuid, deletion_reason text, purge_after timestamptz,
  unique (content_item_id, channel, format)
);

create table if not exists public.cs_content_versions (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id), client_id uuid not null references public.cs_clients(id), brand_id uuid not null references public.cs_brands(id),
  content_item_id uuid not null references public.cs_content_items(id) on delete restrict, variant_id uuid not null references public.cs_platform_variants(id) on delete restrict,
  version_number integer not null check (version_number > 0), copy text not null, change_summary text not null, external_asset_url text,
  submitted_at timestamptz, immutable boolean not null default true check (immutable),
  created_at timestamptz not null, created_by uuid not null, updated_at timestamptz not null, updated_by uuid not null, revision integer not null check (revision = 1),
  archived_at timestamptz, deleted_at timestamptz, deleted_by uuid, deletion_reason text, purge_after timestamptz,
  unique (variant_id, version_number)
);

alter table public.cs_content_items drop constraint if exists cs_content_items_current_version_id_fkey;
alter table public.cs_content_items add constraint cs_content_items_current_version_id_fkey foreign key (current_version_id) references public.cs_content_versions(id) deferrable initially deferred;
alter table public.cs_platform_variants drop constraint if exists cs_platform_variants_current_version_id_fkey;
alter table public.cs_platform_variants add constraint cs_platform_variants_current_version_id_fkey foreign key (current_version_id) references public.cs_content_versions(id) deferrable initially deferred;

create table if not exists public.cs_approval_requests (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id), client_id uuid not null references public.cs_clients(id), brand_id uuid not null references public.cs_brands(id),
  approval_number text not null, content_item_id uuid not null references public.cs_content_items(id) on delete restrict, title text not null,
  route_name text not null, step_name text not null, status text not null check (status in ('PENDING','APPROVED','CHANGES_REQUESTED','REJECTED','STALE','EXPIRED')),
  targets jsonb not null check (jsonb_typeof(targets) = 'array' and jsonb_array_length(targets) > 0), requested_by text not null, requested_at timestamptz not null, due_at timestamptz not null,
  client_visible boolean not null default false, secure_token_hash bytea, secure_token_expires_at timestamptz, token_revoked_at timestamptz, decisions jsonb not null default '[]',
  created_at timestamptz not null, created_by uuid not null, updated_at timestamptz not null, updated_by uuid not null, revision integer not null check (revision > 0),
  archived_at timestamptz, deleted_at timestamptz, deleted_by uuid, deletion_reason text, purge_after timestamptz,
  unique (workspace_id, client_id, brand_id, approval_number)
);

create table if not exists public.cs_schedules (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id), client_id uuid not null references public.cs_clients(id), brand_id uuid not null references public.cs_brands(id),
  content_item_id uuid not null references public.cs_content_items(id), variant_id uuid not null references public.cs_platform_variants(id), version_id uuid not null references public.cs_content_versions(id),
  channel text not null, planned_at timestamptz not null, timezone text not null, publish_method text not null check (publish_method in ('MANUAL','CONNECTOR')),
  status text not null check (status in ('PLANNED','READY','PUBLISHED','FAILED','CANCELLED')),
  created_at timestamptz not null, created_by uuid not null, updated_at timestamptz not null, updated_by uuid not null, revision integer not null check (revision > 0),
  archived_at timestamptz, deleted_at timestamptz, deleted_by uuid, deletion_reason text, purge_after timestamptz
);

create table if not exists public.cs_publish_records (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id), client_id uuid not null references public.cs_clients(id), brand_id uuid not null references public.cs_brands(id),
  schedule_id uuid not null references public.cs_schedules(id), content_item_id uuid not null references public.cs_content_items(id), variant_id uuid not null references public.cs_platform_variants(id), version_id uuid not null references public.cs_content_versions(id),
  channel text not null, method text not null check (method in ('MANUAL','CONNECTOR')), status text not null check (status in ('PENDING','PUBLISHED','FAILED')),
  external_url text, external_id text, published_at timestamptz, proof_note text, last_error text, attempts integer not null default 0 check (attempts >= 0),
  created_at timestamptz not null, created_by uuid not null, updated_at timestamptz not null, updated_by uuid not null, revision integer not null check (revision > 0),
  archived_at timestamptz, deleted_at timestamptz, deleted_by uuid, deletion_reason text, purge_after timestamptz,
  unique (schedule_id, version_id)
);

create table if not exists public.cs_assets (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id), client_id uuid not null references public.cs_clients(id), brand_id uuid not null references public.cs_brands(id),
  asset_number text not null, name text not null, type text not null, source_provider text not null, source_url text not null,
  rights_status text not null check (rights_status in ('VALID','EXPIRING','EXPIRED','MISSING','QUARANTINED')), rights_expires_at date, owner text not null, usage_content_item_ids jsonb not null default '[]',
  created_at timestamptz not null, created_by uuid not null, updated_at timestamptz not null, updated_by uuid not null, revision integer not null check (revision > 0),
  archived_at timestamptz, deleted_at timestamptz, deleted_by uuid, deletion_reason text, purge_after timestamptz,
  unique (workspace_id, client_id, brand_id, asset_number)
);

create table if not exists public.cs_community_records (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id), client_id uuid not null references public.cs_clients(id), brand_id uuid not null references public.cs_brands(id),
  channel text not null, external_thread_url text not null, contact_name text not null, summary text not null,
  classification text not null check (classification in ('ENQUIRY','COMPLAINT','PRAISE','LEAD','SUPPORT','RISK')), priority text not null check (priority in ('LOW','MEDIUM','HIGH','CRITICAL')),
  owner text not null, status text not null check (status in ('NEW','ASSIGNED','IN_PROGRESS','ESCALATED','RESOLVED')), response_draft text,
  converted_record_type text, converted_record_id text,
  created_at timestamptz not null, created_by uuid not null, updated_at timestamptz not null, updated_by uuid not null, revision integer not null check (revision > 0),
  archived_at timestamptz, deleted_at timestamptz, deleted_by uuid, deletion_reason text, purge_after timestamptz
);

create table if not exists public.cs_listening_signals (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id), client_id uuid not null references public.cs_clients(id), brand_id uuid not null references public.cs_brands(id),
  channel text not null, source_url text not null, topic text not null, summary text not null,
  severity text not null check (severity in ('LOW','MEDIUM','HIGH','CRITICAL')), owner text not null,
  status text not null check (status in ('NEW','TRIAGED','CONVERTED','RESOLVED')), sentiment text not null check (sentiment in ('POSITIVE','NEUTRAL','NEGATIVE','MIXED')),
  converted_record_type text, converted_record_id text,
  created_at timestamptz not null, created_by uuid not null, updated_at timestamptz not null, updated_by uuid not null, revision integer not null check (revision > 0),
  archived_at timestamptz, deleted_at timestamptz, deleted_by uuid, deletion_reason text, purge_after timestamptz
);

create table if not exists public.cs_metric_observations (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id), client_id uuid not null references public.cs_clients(id), brand_id uuid not null references public.cs_brands(id),
  content_item_id uuid not null references public.cs_content_items(id), channel text not null,
  metric text not null check (metric in ('IMPRESSIONS','REACH','ENGAGEMENTS','CLICKS','LEADS','CONVERSIONS','REVENUE')), value numeric not null check (value >= 0),
  period_start date not null, period_end date not null check (period_end >= period_start), source_type text not null check (source_type in ('VERIFIED','IMPORTED','MANUAL','ESTIMATED')),
  source_reference text not null, verified_by text,
  created_at timestamptz not null, created_by uuid not null, updated_at timestamptz not null, updated_by uuid not null, revision integer not null check (revision > 0),
  archived_at timestamptz, deleted_at timestamptz, deleted_by uuid, deletion_reason text, purge_after timestamptz
);

create table if not exists public.cs_notifications (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id), client_id uuid not null references public.cs_clients(id), brand_id uuid not null references public.cs_brands(id),
  user_id uuid not null, type text not null, title text not null, message text not null, record_type text not null, record_id text not null, critical boolean not null default false, read_at timestamptz,
  created_at timestamptz not null, created_by uuid not null, updated_at timestamptz not null, updated_by uuid not null, revision integer not null check (revision > 0),
  archived_at timestamptz, deleted_at timestamptz, deleted_by uuid, deletion_reason text, purge_after timestamptz
);

create table if not exists public.cs_audit_events (
  id uuid primary key,
  workspace_id uuid not null references public.cs_workspaces(id), client_id uuid not null references public.cs_clients(id), brand_id uuid not null references public.cs_brands(id),
  occurred_at timestamptz not null default now(), actor_type text not null check (actor_type in ('USER','SYSTEM','CLIENT_TOKEN')), actor_id text not null, actor_name text not null,
  action text not null, target_type text not null, target_id text not null, target_version text, result text not null check (result in ('SUCCESS','FAILURE','REVERSAL')),
  summary text not null, request_id text not null
);

create index if not exists cs_content_items_scope_state_idx on public.cs_content_items(workspace_id, client_id, brand_id, lifecycle_state) where deleted_at is null;
create index if not exists cs_content_items_due_idx on public.cs_content_items(brand_id, due_date) where deleted_at is null;
create index if not exists cs_versions_variant_idx on public.cs_content_versions(variant_id, version_number desc);
create index if not exists cs_approvals_scope_status_idx on public.cs_approval_requests(brand_id, status, due_at) where deleted_at is null;
create index if not exists cs_schedules_brand_time_idx on public.cs_schedules(brand_id, planned_at) where deleted_at is null;
create index if not exists cs_community_brand_status_idx on public.cs_community_records(brand_id, status, priority) where deleted_at is null;
create index if not exists cs_listening_brand_status_idx on public.cs_listening_signals(brand_id, status, severity) where deleted_at is null;
create index if not exists cs_metrics_item_period_idx on public.cs_metric_observations(content_item_id, period_end desc);
create index if not exists cs_notifications_user_read_idx on public.cs_notifications(user_id, read_at, created_at desc);
create index if not exists cs_audit_scope_time_idx on public.cs_audit_events(workspace_id, client_id, brand_id, occurred_at desc);

create or replace function private.cs_enforce_content_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed boolean;
begin
  if new.lifecycle_state = old.lifecycle_state then return new; end if;
  if (select auth.uid()) is not null and not private.cs_has_role(new.workspace_id, new.client_id, new.brand_id, array['CS_MANAGER','PLANNER','CONTRIBUTOR','SOCIAL_COMMUNITY']) then
    raise exception 'Not authorised to transition content' using errcode = '42501';
  end if;
  allowed := case old.lifecycle_state
    when 'IDEA' then new.lifecycle_state in ('BRIEF','CANCELLED')
    when 'BRIEF' then new.lifecycle_state in ('ASSIGNED','CANCELLED')
    when 'ASSIGNED' then new.lifecycle_state in ('IN_PRODUCTION','CANCELLED')
    when 'IN_PRODUCTION' then new.lifecycle_state in ('INTERNAL_REVIEW','CANCELLED')
    when 'INTERNAL_REVIEW' then new.lifecycle_state in ('IN_PRODUCTION','CLIENT_APPROVAL','SCHEDULED','CANCELLED')
    when 'CLIENT_APPROVAL' then new.lifecycle_state in ('IN_PRODUCTION','SCHEDULED','CANCELLED')
    when 'SCHEDULED' then new.lifecycle_state in ('INTERNAL_REVIEW','PUBLISHED','CANCELLED')
    when 'PUBLISHED' then new.lifecycle_state = 'PERFORMANCE_REVIEW'
    when 'PERFORMANCE_REVIEW' then new.lifecycle_state = 'ARCHIVED'
    else false end;
  if not allowed then raise exception 'Invalid content lifecycle transition: % -> %', old.lifecycle_state, new.lifecycle_state using errcode = '23514'; end if;
  if new.lifecycle_state = 'SCHEDULED' and new.current_version_id is null then raise exception 'Scheduling requires a current immutable version' using errcode = '23514'; end if;
  if new.lifecycle_state = 'PUBLISHED' and not exists (select 1 from public.cs_publish_records p where p.content_item_id = new.id and p.version_id = new.current_version_id and p.status = 'PUBLISHED') then
    raise exception 'Published requires proof for the current version' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists cs_content_transition_guard on public.cs_content_items;
create trigger cs_content_transition_guard before update of lifecycle_state on public.cs_content_items for each row execute function private.cs_enforce_content_transition();

create or replace function private.cs_enforce_immutable_version()
returns trigger language plpgsql security definer set search_path = '' as $$ begin raise exception 'Content versions are immutable' using errcode = '55000'; end; $$;
drop trigger if exists cs_content_version_immutable_update on public.cs_content_versions;
create trigger cs_content_version_immutable_update before update or delete on public.cs_content_versions for each row execute function private.cs_enforce_immutable_version();

create or replace function private.cs_invalidate_stale_approvals()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.cs_approval_requests a
    set status = 'STALE', updated_at = now(), revision = revision + 1
  where a.workspace_id = new.workspace_id and a.client_id = new.client_id and a.brand_id = new.brand_id
    and a.status in ('PENDING','APPROVED')
    and exists (select 1 from jsonb_array_elements(a.targets) target where target->>'variant_id' = new.variant_id::text and target->>'version_id' <> new.id::text);
  return new;
end;
$$;
drop trigger if exists cs_approval_stale_on_version on public.cs_content_versions;
create trigger cs_approval_stale_on_version after insert on public.cs_content_versions for each row execute function private.cs_invalidate_stale_approvals();

create or replace function private.cs_enforce_publish_proof()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'PUBLISHED' then
    if new.external_url is null or new.published_at is null or nullif(trim(new.proof_note), '') is null then raise exception 'Published requires URL, actual time and proof note' using errcode = '23514'; end if;
    if not exists (select 1 from public.cs_content_items i where i.id = new.content_item_id and i.current_version_id = new.version_id) then raise exception 'Publish record must reference the current immutable version' using errcode = '23514'; end if;
    if not exists (select 1 from public.cs_approval_requests a where a.content_item_id = new.content_item_id and a.status = 'APPROVED' and exists (select 1 from jsonb_array_elements(a.targets) target where target->>'version_id' = new.version_id::text)) then raise exception 'Current version is not approved' using errcode = '23514'; end if;
  end if;
  return new;
end;
$$;
drop trigger if exists cs_publish_proof_guard on public.cs_publish_records;
create trigger cs_publish_proof_guard before insert or update on public.cs_publish_records for each row execute function private.cs_enforce_publish_proof();

do $$
declare table_name text;
begin
  foreach table_name in array array['cs_workspaces','cs_clients','cs_brands','cs_memberships','cs_ideas','cs_briefs','cs_content_items','cs_platform_variants','cs_content_versions','cs_approval_requests','cs_schedules','cs_publish_records','cs_assets','cs_community_records','cs_listening_signals','cs_metric_observations','cs_notifications','cs_audit_events']
  loop execute format('alter table public.%I enable row level security', table_name); end loop;
end $$;

drop policy if exists cs_memberships_self_select on public.cs_memberships;
drop policy if exists cs_workspaces_member_select on public.cs_workspaces;
drop policy if exists cs_clients_member_select on public.cs_clients;
drop policy if exists cs_brands_member_select on public.cs_brands;
create policy cs_memberships_self_select on public.cs_memberships for select to authenticated using ((select auth.uid()) = user_id);
create policy cs_workspaces_member_select on public.cs_workspaces for select to authenticated using (exists (select 1 from public.cs_memberships m where m.user_id = (select auth.uid()) and m.workspace_id = id));
create policy cs_clients_member_select on public.cs_clients for select to authenticated using (exists (select 1 from public.cs_memberships m where m.user_id = (select auth.uid()) and m.workspace_id = workspace_id and (m.client_id is null or m.client_id = id)));
create policy cs_brands_member_select on public.cs_brands for select to authenticated using (private.cs_has_scope(workspace_id, client_id, id));

do $$
declare table_name text;
begin
  foreach table_name in array array['cs_ideas','cs_briefs','cs_content_items','cs_platform_variants','cs_approval_requests','cs_schedules','cs_publish_records','cs_assets','cs_community_records','cs_listening_signals','cs_metric_observations']
  loop
    execute format('drop policy if exists %I on public.%I', table_name || '_scope_select', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_scope_insert', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_scope_update', table_name);
    execute format('create policy %I on public.%I for select to authenticated using (private.cs_has_scope(workspace_id, client_id, brand_id))', table_name || '_scope_select', table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check (private.cs_has_role(workspace_id, client_id, brand_id, array[''CS_MANAGER'',''PLANNER'',''CONTRIBUTOR'',''SOCIAL_COMMUNITY'',''PERFORMANCE_ANALYST'',''ACCOUNT_BRAND'']))', table_name || '_scope_insert', table_name);
    execute format('create policy %I on public.%I for update to authenticated using (private.cs_has_role(workspace_id, client_id, brand_id, array[''CS_MANAGER'',''PLANNER'',''CONTRIBUTOR'',''SOCIAL_COMMUNITY'',''PERFORMANCE_ANALYST'',''ACCOUNT_BRAND''])) with check (private.cs_has_role(workspace_id, client_id, brand_id, array[''CS_MANAGER'',''PLANNER'',''CONTRIBUTOR'',''SOCIAL_COMMUNITY'',''PERFORMANCE_ANALYST'',''ACCOUNT_BRAND'']))', table_name || '_scope_update', table_name);
  end loop;
end $$;

drop policy if exists cs_versions_scope_select on public.cs_content_versions;
drop policy if exists cs_versions_scope_insert on public.cs_content_versions;
drop policy if exists cs_notifications_recipient_select on public.cs_notifications;
drop policy if exists cs_notifications_recipient_update on public.cs_notifications;
drop policy if exists cs_notifications_scope_insert on public.cs_notifications;
drop policy if exists cs_audit_scope_select on public.cs_audit_events;
drop policy if exists cs_audit_append on public.cs_audit_events;
create policy cs_versions_scope_select on public.cs_content_versions for select to authenticated using (private.cs_has_scope(workspace_id, client_id, brand_id));
create policy cs_versions_scope_insert on public.cs_content_versions for insert to authenticated with check (private.cs_has_role(workspace_id, client_id, brand_id, array['CS_MANAGER','CONTRIBUTOR','PLANNER']));
create policy cs_notifications_recipient_select on public.cs_notifications for select to authenticated using (private.cs_has_scope(workspace_id, client_id, brand_id) and user_id = (select auth.uid()));
create policy cs_notifications_recipient_update on public.cs_notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy cs_notifications_scope_insert on public.cs_notifications for insert to authenticated with check (private.cs_has_role(workspace_id, client_id, brand_id, array['CS_MANAGER','MODULE_ADMIN']));
create policy cs_audit_scope_select on public.cs_audit_events for select to authenticated using (private.cs_has_scope(workspace_id, client_id, brand_id));
create policy cs_audit_append on public.cs_audit_events for insert to authenticated with check (private.cs_has_scope(workspace_id, client_id, brand_id) and actor_id = (select auth.uid())::text);

do $$
declare table_name text;
begin
  foreach table_name in array array['cs_workspaces','cs_clients','cs_brands','cs_memberships','cs_ideas','cs_briefs','cs_content_items','cs_platform_variants','cs_content_versions','cs_approval_requests','cs_schedules','cs_publish_records','cs_assets','cs_community_records','cs_listening_signals','cs_metric_observations','cs_notifications','cs_audit_events']
  loop execute format('revoke all on public.%I from anon', table_name); end loop;
end $$;
grant select on public.cs_workspaces, public.cs_clients, public.cs_brands, public.cs_memberships to authenticated;
grant select, insert, update on public.cs_ideas, public.cs_briefs, public.cs_content_items, public.cs_platform_variants, public.cs_approval_requests, public.cs_schedules, public.cs_publish_records, public.cs_assets, public.cs_community_records, public.cs_listening_signals, public.cs_metric_observations, public.cs_notifications to authenticated;
grant select, insert on public.cs_content_versions, public.cs_audit_events to authenticated;

insert into public.cs_workspaces(id, name) values ('10000000-0000-4000-8000-000000000001', 'Brand Circuit') on conflict (id) do update set name = excluded.name;
insert into public.cs_clients(id, workspace_id, name) values ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'DELabs Ltd (UK Hub)') on conflict (id) do update set name = excluded.name;
insert into public.cs_brands(id, workspace_id, client_id, name, timezone) values ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'DELabs', 'Europe/London') on conflict (id) do update set name = excluded.name, timezone = excluded.timezone;


