-- Explicit staging activation only, after deployment and secret configuration.
-- Set cos.expected_project_ref in this session first. Do not put secret values here.
-- Vault must contain cos_publisher_project_url and cos_publisher_worker_token.
do $$
declare expected text := current_setting('cos.expected_project_ref', true); project_url text; worker_token text;
begin
  select decrypted_secret into project_url from vault.decrypted_secrets where name = 'cos_publisher_project_url';
  select decrypted_secret into worker_token from vault.decrypted_secrets where name = 'cos_publisher_worker_token';
  if expected is null or expected = '' or project_url is distinct from 'https://' || expected || '.supabase.co' then raise exception 'Explicit project-reference guard failed'; end if;
  if worker_token is null or length(worker_token) < 32 then raise exception 'Configure a strong worker secret in Vault and the matching Edge Function secret'; end if;
end;
$$;

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule('cos-social-publisher', '* * * * *', $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'cos_publisher_project_url') || '/functions/v1/social-publisher-worker',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cos-worker-token', (select decrypted_secret from vault.decrypted_secrets where name = 'cos_publisher_worker_token')),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
$job$);

-- Disable dispatch without deleting any history:
-- select cron.unschedule('cos-social-publisher');
