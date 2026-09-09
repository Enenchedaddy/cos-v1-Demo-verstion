-- Narrow write policies to the responsibility matrix. The earlier policies
-- establish the shared pattern; these replace their write role sets table by table.
do $$
declare rule record;
begin
  for rule in select * from (values
    ('cs_ideas', array['CS_MANAGER','PLANNER','SOCIAL_COMMUNITY']::text[]),
    ('cs_briefs', array['CS_MANAGER','PLANNER','ACCOUNT_BRAND']::text[]),
    ('cs_content_items', array['CS_MANAGER','PLANNER','CONTRIBUTOR']::text[]),
    ('cs_platform_variants', array['CS_MANAGER','CONTRIBUTOR']::text[]),
    ('cs_approval_requests', array['CS_MANAGER','ACCOUNT_BRAND']::text[]),
    ('cs_schedules', array['CS_MANAGER','PLANNER','SOCIAL_COMMUNITY']::text[]),
    ('cs_publish_records', array['CS_MANAGER','SOCIAL_COMMUNITY']::text[]),
    ('cs_assets', array['CS_MANAGER','CONTRIBUTOR']::text[]),
    ('cs_community_records', array['CS_MANAGER','SOCIAL_COMMUNITY']::text[]),
    ('cs_listening_signals', array['CS_MANAGER','SOCIAL_COMMUNITY']::text[]),
    ('cs_metric_observations', array['CS_MANAGER','PERFORMANCE_ANALYST']::text[])
  ) as configured(table_name, roles)
  loop
    execute format('drop policy if exists %I on public.%I', rule.table_name || '_scope_insert', rule.table_name);
    execute format('drop policy if exists %I on public.%I', rule.table_name || '_scope_update', rule.table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check (private.cs_has_role(workspace_id, client_id, brand_id, %L::text[]))', rule.table_name || '_scope_insert', rule.table_name, rule.roles);
    execute format('create policy %I on public.%I for update to authenticated using (private.cs_has_role(workspace_id, client_id, brand_id, %L::text[])) with check (private.cs_has_role(workspace_id, client_id, brand_id, %L::text[]))', rule.table_name || '_scope_update', rule.table_name, rule.roles, rule.roles);
  end loop;
end $$;


