-- Phase 7A: staging/build-only Sales & Marketing interface visibility.
-- This capability exposes navigation only. It does not grant business actions,
-- database access, Content & Social membership, provisioning authority, or RLS bypass.

insert into public.permissions (key, module, action, description, status)
values (
  'testing.sales_marketing_interface.view',
  'testing',
  'view',
  'Staging/build-only visibility of the Sales & Marketing interface and navigation structure.',
  'active'
)
on conflict (key) do update
set
  module = excluded.module,
  action = excluded.action,
  description = excluded.description,
  status = excluded.status,
  updated_at = now();

insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from (
  values
    ('CEO', 'testing.sales_marketing_interface.view'),
    ('MANAGEMENT', 'testing.sales_marketing_interface.view'),
    ('SOFTWARE_ENGINEER', 'testing.sales_marketing_interface.view')
) as mapping(role_code, permission_key)
join public.roles on roles.code = mapping.role_code
join public.permissions on permissions.key = mapping.permission_key
on conflict do nothing;
