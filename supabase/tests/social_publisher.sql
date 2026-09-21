-- Run ONLY in an explicit transaction AFTER the candidate migration, then ROLLBACK.
-- Uses an existing active principal only as a test subject. All company, membership,
-- media, Vault and publishing fixtures are transaction-local and MUST NOT be committed.
do $$
declare actor uuid; workspace uuid := gen_random_uuid(); company uuid := gen_random_uuid(); brand uuid := gen_random_uuid(); other_workspace uuid := gen_random_uuid(); other_company uuid := gen_random_uuid(); other_brand uuid := gen_random_uuid(); membership uuid := gen_random_uuid();
begin
  select p.id into actor from public.profiles p where p.status = 'active' order by p.id limit 1;
  if actor is null then raise exception 'A controlled active staging principal is required'; end if;
  perform set_config('test.actor', actor::text, true);
  perform set_config('test.workspace', workspace::text, true);
  perform set_config('test.company', company::text, true);
  perform set_config('test.brand', brand::text, true);
  perform set_config('test.other_brand', other_brand::text, true);
  perform set_config('test.membership', membership::text, true);
  insert into public.cs_workspaces(id, name) values(workspace, 'Publisher transaction test'), (other_workspace, 'Isolated transaction test');
  insert into public.cs_clients(id, workspace_id, name) values(company, workspace, 'Test company'), (other_company, other_workspace, 'Isolated company');
  insert into public.cs_brands(id, workspace_id, client_id, name) values(brand, workspace, company, 'Test brand'), (other_brand, other_workspace, other_company, 'Isolated brand');
  insert into public.cs_memberships(id, user_id, workspace_id, client_id, brand_id, role, display_name) values(membership, actor, workspace, company, brand, 'CS_MANAGER', 'Transaction test');
  perform set_config('request.jwt.claims', jsonb_build_object('sub', actor, 'role', 'authenticated')::text, true);
end;
$$;
set local role authenticated;
do $$
declare directory jsonb;
begin
  directory := public.cs_company_directory();
  if not exists(select 1 from jsonb_array_elements(directory->'brands') b where b->>'id' = current_setting('test.brand')) then raise exception 'Assigned brand missing'; end if;
  if exists(select 1 from jsonb_array_elements(directory->'brands') b where b->>'id' = current_setting('test.other_brand')) then raise exception 'Cross-workspace brand leaked'; end if;
  if not exists(select 1 from public.cs_clients where id = current_setting('test.company')::uuid) then raise exception 'Company visibility policy still broken'; end if;
  if not exists(select 1 from public.cs_workspaces where id = current_setting('test.workspace')::uuid) then raise exception 'Workspace visibility policy still broken'; end if;
  begin
    perform public.cs_publisher_command('company.create', jsonb_build_object('workspace_id', current_setting('test.workspace'), 'name', 'Forbidden company'));
    raise exception 'Brand manager was able to create a company';
  exception when insufficient_privilege then null; end;
  begin
    perform public.cs_publisher_service('job.claim', '{}');
    raise exception 'Browser was able to invoke the service RPC';
  exception when insufficient_privilege then null; end;
  begin
    perform public.cs_publisher_command('oauth.begin', jsonb_build_object('brand_id', current_setting('test.other_brand'), 'state_hash', repeat('b',64)));
    raise exception 'Cross-brand OAuth was authorized';
  exception when insufficient_privilege then null; end;
  perform public.cs_publisher_command('oauth.begin', jsonb_build_object('brand_id', current_setting('test.brand'), 'state_hash', repeat('a',64)));
end;
$$;
reset role;
-- Upgrade ONLY the newly created transaction fixture, never any pre-existing membership.
update public.cs_memberships set client_id = null, brand_id = null where id = current_setting('test.membership')::uuid;
set local role authenticated;
do $$
declare company uuid; brand uuid;
begin
  company := (public.cs_publisher_command('company.create', jsonb_build_object('workspace_id', current_setting('test.workspace'), 'name', 'Additional test company')) #>> '{}')::uuid;
  brand := (public.cs_publisher_command('brand.create', jsonb_build_object('workspace_id', current_setting('test.workspace'), 'client_id', company, 'name', 'Additional test brand', 'timezone', 'Africa/Lagos')) #>> '{}')::uuid;
  if not exists(select 1 from public.cs_brands b where b.id = brand and b.client_id = company) then raise exception 'Onboarding failed'; end if;
end;
$$;
reset role;
update public.cs_memberships set client_id = current_setting('test.company')::uuid, brand_id = current_setting('test.brand')::uuid where id = current_setting('test.membership')::uuid;
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
set local role service_role;
do $$
declare account uuid; media jsonb;
begin
  perform public.cs_publisher_service('oauth.consume', jsonb_build_object('state_hash', repeat('a',64)));
  begin
    perform public.cs_publisher_service('oauth.consume', jsonb_build_object('state_hash', repeat('a',64)));
    raise exception 'OAuth state replay succeeded';
  exception when raise_exception then if sqlerrm = 'OAuth state replay succeeded' then raise; end if; end;
  account := (public.cs_publisher_service('oauth.complete', jsonb_build_object('state_hash', repeat('a',64), 'provider_account_id', '999900001111', 'username', 'transaction_test', 'access_token', 'synthetic-instagram-test-token', 'expires_at', now() + interval '30 days')) #>> '{}')::uuid;
  media := public.cs_publisher_service('media.register', jsonb_build_object('actor_id', current_setting('test.actor'), 'brand_id', current_setting('test.brand'), 'sha256', repeat('0',64), 'width', 1080, 'height', 1080, 'byte_size', 100));
  perform set_config('test.account', account::text, true);
  perform set_config('test.media', media->>'id', true);
  perform set_config('test.media_path', media->>'storage_path', true);
end;
$$;
reset role;
insert into storage.objects(bucket_id, name) values('cs-publisher', current_setting('test.media_path'));
do $$
declare brief uuid := gen_random_uuid(); actor uuid := current_setting('test.actor')::uuid;
begin
  insert into public.cs_briefs(id, workspace_id, client_id, brand_id, brief_number, title, objective, audience, key_message, call_to_action, channels, formats, owner, due_date, status, created_at, created_by, updated_at, updated_by, revision)
    values(brief, current_setting('test.workspace')::uuid, current_setting('test.company')::uuid, current_setting('test.brand')::uuid, 'TEST-' || brief::text, 'Transaction image post', 'Test', 'Test', 'Test', 'Test', '["Instagram"]', '["Static"]', 'Transaction test', current_date + 1, 'APPROVED', now(), actor, now(), actor, 1);
  perform set_config('test.brief', brief::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', actor, 'role', 'authenticated')::text, true);
end;
$$;
set local role authenticated;
do $$
declare item uuid; version uuid; approval uuid; job uuid; repeated uuid; request uuid := gen_random_uuid();
begin
  item := (public.cs_publisher_command('post.create', jsonb_build_object('account_id', current_setting('test.account'), 'brief_id', current_setting('test.brief'), 'media_id', current_setting('test.media'), 'caption', 'Approved test image', 'rights_confirmed', true)) #>> '{}')::uuid;
  select current_version_id into version from public.cs_content_items where id = item;
  begin
    perform public.cs_publisher_command('schedule', jsonb_build_object('account_id', current_setting('test.account'), 'version_id', version, 'request_id', request, 'planned_at', now(), 'timezone', 'Africa/Lagos'));
    raise exception 'Unapproved version was scheduled';
  exception when raise_exception then if sqlerrm = 'Unapproved version was scheduled' then raise; end if; end;
  approval := (public.cs_publisher_command('approval.request', jsonb_build_object('item_id', item)) #>> '{}')::uuid;
  perform public.cs_publisher_command('approval.decide', jsonb_build_object('approval_id', approval, 'decision', 'CHANGES_REQUESTED', 'comment', 'Keep the existing changes-requested flag'));
  if not exists(select 1 from public.cs_content_items ci, jsonb_array_elements(ci.exceptions) ex where ci.id = item and ex->>'flag' = 'NEEDS_CHANGES') then
    raise exception 'Approval decision lost the changes-requested exception';
  end if;
  approval := (public.cs_publisher_command('approval.request', jsonb_build_object('item_id', item)) #>> '{}')::uuid;
  perform public.cs_publisher_command('approval.decide', jsonb_build_object('approval_id', approval, 'decision', 'APPROVED'));
  job := (public.cs_publisher_command('schedule', jsonb_build_object('account_id', current_setting('test.account'), 'version_id', version, 'request_id', request, 'planned_at', now(), 'timezone', 'Africa/Lagos')) #>> '{}')::uuid;
  repeated := (public.cs_publisher_command('schedule', jsonb_build_object('account_id', current_setting('test.account'), 'version_id', version, 'request_id', request, 'planned_at', now(), 'timezone', 'Africa/Lagos')) #>> '{}')::uuid;
  if job <> repeated then raise exception 'Queue request was not idempotent'; end if;
  begin
    update public.cs_schedules set status = 'PUBLISHED' where id = (select schedule_id from public.cs_publisher_jobs where id = job);
    raise exception 'Browser fabricated connector result';
  exception when insufficient_privilege then null; end;
  begin
    update public.cs_content_versions set copy = 'Changed' where id = version;
    if exists(select 1 from public.cs_content_versions where id = version and copy = 'Changed') then raise exception 'Immutable version was modified'; end if;
  exception when object_not_in_prerequisite_state then null; when insufficient_privilege then null; end;
  perform set_config('test.item', item::text, true);
  perform set_config('test.version', version::text, true);
  perform set_config('test.job', job::text, true);
end;
$$;
reset role;
set constraints all immediate;
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
set local role service_role;
do $$
declare claimed jsonb;
begin
  claimed := public.cs_publisher_service('job.claim', '{}');
  if claimed->>'job_id' <> current_setting('test.job') then raise exception 'Worker did not claim the due test job'; end if;
  if public.cs_publisher_service('job.claim', '{}') is not null then raise exception 'Worker concurrently reclaimed leased job'; end if;
  perform public.cs_publisher_service('job.container', claimed || '{"container_id":"111122223333"}');
  perform public.cs_publisher_service('job.authorize', claimed);
  perform public.cs_publisher_service('job.result', claimed || '{"status":"PUBLISHED","external_id":"444455556666","external_url":"https://www.instagram.com/p/transaction-test/"}');
end;
$$;
reset role;
do $$
begin
  if not exists(select 1 from public.cs_publisher_jobs where id = current_setting('test.job')::uuid and status = 'PUBLISHED') then raise exception 'Job result missing'; end if;
  if not exists(select 1 from public.cs_content_items where id = current_setting('test.item')::uuid and lifecycle_state = 'PUBLISHED') then raise exception 'Content lifecycle was not updated'; end if;
  if (select count(*) from public.cs_publish_records where content_item_id = current_setting('test.item')::uuid) <> 1 then raise exception 'Expected exactly one publication record'; end if;
  if has_function_privilege('anon', 'public.cs_publisher_command(text,jsonb)', 'EXECUTE') or has_function_privilege('authenticated', 'public.cs_publisher_service(text,jsonb)', 'EXECUTE') then raise exception 'Unexpected public privilege'; end if;
  if has_table_privilege('authenticated', 'private.cs_publisher_credentials', 'SELECT') then raise exception 'Provider credentials exposed'; end if;
end;
$$;
-- Exercise stale approvals and permission revocation on further isolated jobs.
set constraints all deferred;
create function pg_temp.publisher_test_job() returns uuid language plpgsql as $$
declare item uuid; approval uuid; version uuid; job uuid;
begin
  item := (public.cs_publisher_command('post.create', jsonb_build_object('account_id', current_setting('test.account'), 'brief_id', current_setting('test.brief'), 'media_id', current_setting('test.media'), 'caption', 'Safety test', 'rights_confirmed', true)) #>> '{}')::uuid;
  select current_version_id into version from public.cs_content_items where id = item;
  approval := (public.cs_publisher_command('approval.request', jsonb_build_object('item_id', item)) #>> '{}')::uuid;
  perform public.cs_publisher_command('approval.decide', jsonb_build_object('approval_id', approval, 'decision', 'APPROVED'));
  job := (public.cs_publisher_command('schedule', jsonb_build_object('account_id', current_setting('test.account'), 'version_id', version, 'request_id', gen_random_uuid(), 'planned_at', now(), 'timezone', 'UTC')) #>> '{}')::uuid;
  perform set_config('test.current_item', item::text, true);
  perform set_config('test.current_approval', approval::text, true);
  return job;
end;
$$;
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.actor'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare job uuid; version uuid;
begin
  job := pg_temp.publisher_test_job();
  version := (public.cs_publisher_command('version.create', jsonb_build_object('item_id', current_setting('test.current_item'), 'copy', 'Revised after approval', 'change_summary', 'Stale-version test')) #>> '{}')::uuid;
  if not exists(select 1 from public.cs_approval_requests where id = current_setting('test.current_approval')::uuid and status = 'STALE') then raise exception 'New version did not invalidate approval'; end if;
  perform set_config('test.stale_job', job::text, true);
  perform set_config('test.revoked_job', pg_temp.publisher_test_job()::text, true);
end;
$$;
reset role;
update public.cs_memberships set role = 'EXECUTIVE_VIEWER' where id = current_setting('test.membership')::uuid;
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
set local role service_role;
do $$ begin
  perform public.cs_publisher_service('job.claim', '{}');
  perform public.cs_publisher_service('job.claim', '{}');
end; $$;
reset role;
do $$ begin
  if exists(select 1 from public.cs_publisher_jobs where id in (current_setting('test.stale_job')::uuid, current_setting('test.revoked_job')::uuid) and status <> 'FAILED') then raise exception 'Invalid jobs were dispatched'; end if;
end; $$;
update public.cs_memberships set role = 'CS_MANAGER' where id = current_setting('test.membership')::uuid;
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.actor'), 'role', 'authenticated')::text, true);
set local role authenticated;
select set_config('test.uncertain_job', pg_temp.publisher_test_job()::text, true);
reset role;
select set_config('request.jwt.claims', '{"role":"service_role"}', true);
set local role service_role;
do $$ declare claimed jsonb; begin
  claimed := public.cs_publisher_service('job.claim', '{}');
  perform public.cs_publisher_service('job.container', claimed || '{"container_id":"111100009999"}');
  perform public.cs_publisher_service('job.authorize', claimed);
  perform public.cs_publisher_service('job.result', claimed || '{"status":"QUEUED","message":"Simulated timeout after dispatch"}');
  if public.cs_publisher_service('job.claim', '{}') is not null then raise exception 'Uncertain publication was blindly retried'; end if;
end; $$;
reset role;
do $$ begin
  if not exists(select 1 from public.cs_publisher_jobs where id = current_setting('test.uncertain_job')::uuid and status = 'NEEDS_REVIEW') then raise exception 'Uncertain publication not flagged'; end if;
end; $$;
set constraints all immediate;
-- Caller MUST execute ROLLBACK; fixtures include no real external publishing.
