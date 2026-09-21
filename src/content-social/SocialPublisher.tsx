import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { can } from './domain';
import type { ContentSocialSession, ContentSocialState, ScopeContext } from './model';
import { invokePublisher, loadPublisher, publisherCommand, safeInstagramUrl, validateCaption, validateInstagramImage, zonedLocalToUtc, type PublisherJob, type SocialAccount } from './publisher';

interface Props {
  scope: ScopeContext;
  state: ContentSocialState;
  session: ContentSocialSession;
  onReload: () => Promise<void>;
  onRouteChange: (route: string) => void;
  legacy: ReactNode;
}

export default function SocialPublisher({ scope, state, session, onReload, onRouteChange, legacy }: Props) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [jobs, setJobs] = useState<PublisherJob[]>([]);
  const [accountId, setAccountId] = useState('');
  const [briefId, setBriefId] = useState('');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const uploadInput = useRef<HTMLInputElement>(null);
  const [rights, setRights] = useState(false);
  const [versionId, setVersionId] = useState('');
  const [plannedAt, setPlannedAt] = useState('');
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string>();
  const roles = session.roles ?? [session.role];
  const canConnect = can(roles, 'connection.manage');
  const canCreate = can(roles, 'content.create');
  const canPublish = can(roles, 'publish.confirm');
  const timezone = scope.timezone ?? 'UTC';
  const selectedAccount = accounts.find(account => account.id === accountId);
  const briefs = state.briefs.filter(brief => brief.status === 'APPROVED' && !brief.deletedAt && brief.channels.includes('Instagram') && brief.formats.includes('Static'));
  const versions = state.versions.filter(version => state.variants.some(variant => variant.id === version.variantId && variant.channel === 'Instagram' && variant.format === 'Static' && variant.currentVersionId === version.id) &&
    state.approvals.some(approval => approval.status === 'APPROVED' && !approval.deletedAt && approval.targets.some(target => target.versionId === version.id && target.variantId === version.variantId)));

  const refresh = useCallback(async () => {
    const result = await loadPublisher(scope);
    setAccounts(result.accounts); setJobs(result.jobs); setLoading(false);
    setAccountId(previous => result.accounts.some(account => account.id === previous) ? previous : result.accounts.find(account => account.status === 'CONNECTED')?.id ?? '');
  }, [scope]);
  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const result = await loadPublisher(scope);
        if (!active) return;
        setAccounts(result.accounts); setJobs(result.jobs); setLoading(false);
        setAccountId(previous => result.accounts.some(account => account.id === previous) ? previous : result.accounts.find(account => account.status === 'CONNECTED')?.id ?? '');
      } catch (reason) { if (active) { setError(reason instanceof Error ? reason.message : 'Publisher unavailable.'); setLoading(false); } }
    };
    void poll();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void poll(); }, 15_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [scope]);
  useEffect(() => {
    if (!file) { setPreview(undefined); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const run = async (work: () => Promise<void>) => {
    setBusy(true); setError(undefined); setNotice(undefined);
    try { await work(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'The action failed.'); }
    finally { setBusy(false); }
  };
  const connect = () => run(async () => {
    const result = await invokePublisher<{ url: string }>('connect', { brand_id: scope.brandId });
    const destination = new URL(result.url);
    if (destination.protocol !== 'https:' || destination.hostname !== 'www.instagram.com') throw new Error('Unexpected connection destination.');
    window.location.assign(destination.href);
  });
  const createPost = () => run(async () => {
    if (!file || !rights || !selectedAccount || selectedAccount.status !== 'CONNECTED') throw new Error('Select a connected account, image, and confirm image rights.');
    const copy = validateCaption(caption);
    const bitmap = await createImageBitmap(file);
    try { validateInstagramImage(file.type, file.size, bitmap.width, bitmap.height); } finally { bitmap.close(); }
    const body = new FormData(); body.set('action', 'upload'); body.set('brand_id', scope.brandId); body.set('file', file);
    const upload = await supabase.functions.invoke('social-publisher', { body });
    if (upload.error || upload.data?.error) throw new Error(upload.data?.error ?? 'Image upload failed. Check the publishing service configuration.');
    await publisherCommand('post.create', { brief_id: briefId, account_id: accountId, media_id: upload.data.media_id, caption: copy, rights_confirmed: true });
    setCaption(''); setFile(null); setRights(false);
    if (uploadInput.current) uploadInput.current.value = '';
    setNotice('Post created in Production Pipeline. Request approval there before publishing.');
    await onReload();
    onRouteChange('Production Pipeline');
  });
  const queue = (immediate: boolean) => run(async () => {
    if (!selectedAccount || selectedAccount.status !== 'CONNECTED') throw new Error('Choose a connected account.');
    await invokePublisher('schedule', { account_id: accountId, version_id: versionId, local_time: immediate ? null : plannedAt, timezone, immediate, request_id: crypto.randomUUID() });
    setNotice(immediate ? 'Post queued for publishing. Its confirmed result will appear below.' : 'Post scheduled. COS does not need to remain open.');
    await refresh();
  });

  return <div className="space-y-5">
    <header><p className="text-xs font-semibold text-[#155EEF]">Content & Social / Social Publisher</p><h1 className="mt-2 text-3xl font-bold text-[#061B3A]">Social Publisher</h1><p className="mt-2 text-sm text-[#65758B]">{scope.clientName} · {scope.brandName} · {timezone}. Approved content, the right account, a verified result.</p></header>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    {session.mode === 'demo' && <p role="note" className="text-sm">Development fixtures cannot connect accounts or publish real posts.</p>}
    <section className="rounded-xl border border-[#D9E0EA] bg-white p-5" aria-label="Social accounts">
      <div className="flex flex-wrap items-end gap-4">
        <label className="w-full min-w-0 text-xs font-semibold sm:w-auto sm:flex-1">Instagram account<select className="cs-input mt-2 min-h-11" value={accountId} onChange={event => setAccountId(event.target.value)} disabled={busy || loading}><option value="">{loading ? 'Loading accounts…' : 'Select an account'}</option>{accounts.map(account => <option key={account.id} value={account.id}>@{account.username} — {account.status.replaceAll('_', ' ').toLowerCase()}</option>)}</select></label>
        {canConnect && <button className="cs-button-primary min-h-11" disabled={busy || session.mode === 'demo'} onClick={() => void connect()}>Connect Instagram</button>}
        <button className="cs-button-secondary min-h-11" disabled={busy} onClick={() => void run(refresh)}>Refresh results</button>
      </div>
      {!loading && accounts.length === 0 && <p className="mt-3 text-sm text-[#65758B]">No account connected for this brand. A scoped manager or module administrator must connect an Instagram professional account.</p>}
      {canConnect && selectedAccount?.status === 'CONNECTED' && <button className="cs-button-secondary mt-3 min-h-11" disabled={busy} onClick={() => {
        if (window.confirm(`Disconnect @${selectedAccount.username}? Pending posts will stop; history will be retained.`)) void run(async () => { await publisherCommand('account.disconnect', { account_id: accountId }); await refresh(); });
      }}>Disconnect selected account</button>}
    </section>
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-xl border border-[#D9E0EA] bg-white p-5">
        <h2 className="text-lg font-bold">Create post</h2><p className="mt-1 text-xs text-[#65758B]">Single JPEG image and caption. An approved Instagram / Static brief is required.</p>
        <form className="mt-4 space-y-4" onSubmit={event => { event.preventDefault(); void createPost(); }}>
          <label className="block text-xs font-semibold">Approved brief<select required className="cs-input mt-2 min-h-11" value={briefId} onChange={event => setBriefId(event.target.value)}><option value="">Choose a brief</option>{briefs.map(brief => <option key={brief.id} value={brief.id}>{brief.briefNumber} — {brief.title}</option>)}</select></label>
          {!briefs.length && <button type="button" className="cs-link min-h-11" onClick={() => onRouteChange('Planning & Briefs')}>Open Planning & Briefs</button>}
          <label className="block text-xs font-semibold">Caption<textarea required rows={5} maxLength={2200} className="cs-input mt-2" value={caption} onChange={event => setCaption(event.target.value)} /></label>
          <label className="block text-xs font-semibold">JPEG image<input ref={uploadInput} required type="file" accept="image/jpeg" className="mt-2 block min-h-11 w-full text-xs" onChange={event => setFile(event.target.files?.[0] ?? null)} /></label>
          {preview && <img src={preview} alt="Selected post image preview" className="max-h-64 max-w-full rounded-lg object-contain" />}
          <label className="flex min-h-11 items-center gap-2 text-xs"><input required type="checkbox" checked={rights} onChange={event => setRights(event.target.checked)} />I confirm this brand has permission to publish this image.</label>
          <button disabled={busy || !canCreate || !selectedAccount || selectedAccount.status !== 'CONNECTED' || session.mode === 'demo'} className="cs-button-primary min-h-11">{busy ? 'Working…' : 'Create post for review'}</button>
          {!canCreate && <p className="text-xs text-[#65758B]">Your scoped role cannot create posts. You can still use the actions assigned to you.</p>}
        </form>
      </section>
      <section className="rounded-xl border border-[#D9E0EA] bg-white p-5">
        <h2 className="text-lg font-bold">Publish approved version</h2><p className="mt-1 text-xs text-[#65758B]">Editing approved content requires a fresh approval.</p>
        <label className="mt-4 block text-xs font-semibold">Approved post<select className="cs-input mt-2 min-h-11" value={versionId} onChange={event => setVersionId(event.target.value)}><option value="">Choose a version</option>{versions.map(version => <option key={version.id} value={version.id}>{state.contentItems.find(item => item.id === version.contentItemId)?.title} — v{version.versionNumber}</option>)}</select></label>
        <button className="cs-link my-3 min-h-11" onClick={() => onRouteChange('Approvals')}>Open approvals</button>
        <label className="block text-xs font-semibold">Scheduled time ({timezone})<input type="datetime-local" className="cs-input mt-2 min-h-11" value={plannedAt} onChange={event => setPlannedAt(event.target.value)} /></label>
        <div className="mt-4 flex flex-wrap gap-3"><button disabled={busy || !canPublish || !versionId || selectedAccount?.status !== 'CONNECTED' || session.mode === 'demo'} className="cs-button-primary min-h-11" onClick={() => void queue(true)}>Publish now</button><button disabled={busy || !canPublish || !versionId || !plannedAt || selectedAccount?.status !== 'CONNECTED' || session.mode === 'demo'} className="cs-button-secondary min-h-11" onClick={() => {
          try { zonedLocalToUtc(plannedAt, timezone); void queue(false); } catch (reason) { setError((reason as Error).message); }
        }}>Schedule post</button></div>
        <p className="mt-4 text-xs leading-5 text-[#65758B]">Publishing runs on the server. A queued post is not marked published until Instagram confirms delivery.</p>
      </section>
    </div>
    <section className="rounded-xl border border-[#D9E0EA] bg-white p-5" aria-label="Publishing results"><h2 className="text-lg font-bold">Publishing results</h2>
      {!jobs.length && <p className="mt-3 text-sm text-[#65758B]">No connector publishing jobs for this brand yet.</p>}
      <div className="divide-y divide-[#E8EDF4]">{jobs.map(job => {
        const url = safeInstagramUrl(job.external_url);
        return <article key={job.id} className="py-4"><div className="flex flex-wrap justify-between gap-3"><h3 className="text-sm font-semibold">{state.contentItems.find(item => item.id === job.content_item_id)?.title ?? 'Instagram post'}</h3><span className="text-xs font-semibold">{job.status.replaceAll('_', ' ')}</span></div><p className="mt-2 text-xs text-[#65758B]">@{accounts.find(account => account.id === job.account_id)?.username ?? 'Account'} · {new Intl.DateTimeFormat(undefined, { timeZone: job.timezone, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(job.planned_at))} ({job.timezone}) · {job.attempts} attempts</p>{job.last_error && <p className="mt-2 text-sm text-red-700">{job.last_error}</p>}{job.status === 'NEEDS_REVIEW' && job.external_id && <p className="mt-2 break-all font-mono text-xs">Provider reference: {job.external_id}</p>}{url && <a className="cs-link mt-2 min-h-11" href={url} target="_blank" rel="noreferrer">View published post</a>}{canPublish && job.status === 'QUEUED' && <button className="cs-button-secondary mt-3 min-h-11" disabled={busy} onClick={() => void run(async () => { await publisherCommand('job.cancel', { job_id: job.id }); await refresh(); })}>Cancel scheduled post</button>}{canPublish && job.status === 'FAILED' && <button className="cs-button-secondary mt-3 min-h-11" disabled={busy} onClick={() => void run(async () => { await publisherCommand('job.retry', { job_id: job.id }); await refresh(); })}>Retry after fixing issue</button>}</article>;
      })}</div>
    </section>
    <details className="rounded-xl border border-[#D9E0EA] bg-white p-5"><summary className="min-h-11 cursor-pointer text-sm font-semibold">Existing manual publishing and evidence</summary><div className="mt-4">{legacy}</div></details>
  </div>;
}
