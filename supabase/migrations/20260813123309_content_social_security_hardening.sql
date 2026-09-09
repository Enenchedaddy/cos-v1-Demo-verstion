revoke execute on function public.cs_issue_approval_token(uuid, timestamptz) from anon;
revoke select on public.cs_approval_requests from authenticated;
grant select (
  id, workspace_id, client_id, brand_id, approval_number, content_item_id, title,
  route_name, step_name, status, targets, requested_by, requested_at, due_at,
  client_visible, secure_token_expires_at, decisions, created_at, created_by,
  updated_at, updated_by, revision, archived_at, deleted_at, deleted_by,
  deletion_reason, purge_after
) on public.cs_approval_requests to authenticated;
drop index if exists public.cs_fk_approval_requests_client;
