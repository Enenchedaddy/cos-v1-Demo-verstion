create unique index if not exists cs_approval_token_hash_idx on public.cs_approval_requests(secure_token_hash) where secure_token_hash is not null;

create or replace function public.cs_issue_approval_token(p_approval_id uuid, p_expires_at timestamptz default now() + interval '7 days')
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  approval public.cs_approval_requests%rowtype;
  raw_token text;
begin
  select * into approval from public.cs_approval_requests where id = p_approval_id and deleted_at is null;
  if approval.id is null or not private.cs_has_role(approval.workspace_id, approval.client_id, approval.brand_id, array['CS_MANAGER','ACCOUNT_BRAND']) then
    raise exception 'Approval request is unavailable' using errcode = '42501';
  end if;
  if approval.status <> 'PENDING' or not approval.client_visible then
    raise exception 'Only pending client-visible approvals can receive a secure link' using errcode = '23514';
  end if;
  if p_expires_at <= now() or p_expires_at > now() + interval '30 days' then
    raise exception 'Approval link expiry must be within the next 30 days' using errcode = '22007';
  end if;

  raw_token := encode(extensions.gen_random_bytes(32), 'hex');
  update public.cs_approval_requests
    set secure_token_hash = extensions.digest(convert_to(raw_token, 'UTF8'), 'sha256'),
        secure_token_expires_at = p_expires_at,
        token_revoked_at = null,
        updated_at = now(), updated_by = (select auth.uid()), revision = revision + 1
    where id = p_approval_id;
  return raw_token;
end;
$$;

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
    'copy', version.copy, 'externalAssetUrl', version.external_asset_url,
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

revoke all on function public.cs_issue_approval_token(uuid, timestamptz) from public;
revoke all on function public.cs_client_approval(text, text, text, text) from public;
grant execute on function public.cs_issue_approval_token(uuid, timestamptz) to authenticated;
grant execute on function public.cs_client_approval(text, text, text, text) to anon, authenticated;

