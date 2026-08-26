import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, RefreshCw, Send, ShieldCheck, Users } from 'lucide-react';
import { useAuthorization } from '../auth/AuthorizationProvider';
import { isCeoApprovalAllowed, isInvitationAllowed, isTechnicalApprovalAllowed } from '../auth/provisioningPolicy';
import {
  PROVISIONING_ROLE_CODES, invokeProvisioning, listProvisionedUsers,
  listProvisioningRequests, type ProvisionedUser, type ProvisioningRequest,
  type ProvisioningRoleCode,
} from '../auth/userProvisioning';

const ROLE_LABELS: Record<ProvisioningRoleCode, string> = {
  CEO: 'Chief Executive Officer', MANAGEMENT: 'Management', SALES: 'Sales',
  MARKETING: 'Marketing', SOFTWARE_ENGINEER: 'Software Engineer',
};
const EMPTY = { firstName: '', lastName: '', email: '', jobTitle: '', department: '', roleCode: 'SALES' as ProvisioningRoleCode };
const dateLabel = (value: string | null) => value ? new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export default function UserProvisioningPage() {
  const { hasPermission, role } = useAuthorization();
  const [requests, setRequests] = useState<ProvisioningRequest[]>([]);
  const [users, setUsers] = useState<ProvisionedUser[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canRequest = hasPermission('users.request');
  const canView = hasPermission('users.view');
  const permissions = ['users.view', 'users.request', 'users.approve', 'users.invite', 'users.update', 'users.disable', 'users.enable'].filter(hasPermission);

  const refresh = async () => {
    if (!canView) return;
    setBusy('refresh');
    try {
      const [nextRequests, nextUsers] = await Promise.all([listProvisioningRequests(), listProvisionedUsers()]);
      setRequests(nextRequests.data);
      setUsers(nextUsers.data);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Provisioning status could not be loaded.');
    } finally { setBusy(null); }
  };
  useEffect(() => { void refresh(); }, []);

  const perform = async (action: 'approve_ceo' | 'reject_ceo' | 'approve_technical' | 'reject_technical' | 'send_invitation' | 'cancel_request', request: ProvisioningRequest) => {
    setBusy(`${action}:${request.id}`); setError(null); setMessage(null);
    try {
      const input: Record<string, unknown> = { requestId: request.id };
      if (action === 'reject_ceo' || action === 'reject_technical') input.reason = 'Rejected through controlled provisioning review.';
      await invokeProvisioning(action, input);
      setMessage(`Request for ${request.requested_email} was updated.`);
      await refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'The request could not be updated.');
    } finally { setBusy(null); }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy('create'); setError(null); setMessage(null);
    try {
      await invokeProvisioning('create_request', form);
      setForm(EMPTY); setMessage('Provisioning request created and awaiting CEO approval.');
      await refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'The request could not be created.');
    } finally { setBusy(null); }
  };

  const grouped = useMemo(() => ({
    pending: requests.filter((request) => request.status === 'PENDING'),
    ceoApproved: requests.filter((request) => request.status === 'CEO_APPROVED'),
    ready: requests.filter((request) => request.status === 'READY_FOR_INVITATION'),
    sent: requests.filter((request) => request.status === 'INVITATION_SENT'),
  }), [requests]);

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#15202B] sm:px-7 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <a href="/app" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#183153]"><ArrowLeft size={16} /> Back to gateway</a>
        <header className="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-[#D8D6CE] pb-5">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4065B3]">Controlled identity operations</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">User provisioning</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#5E6872]">CEO business approval and technical approval are both required before an invitation can be sent.</p></div>
          <button type="button" onClick={() => void refresh()} disabled={busy === 'refresh'} className="inline-flex min-h-11 items-center gap-2 border border-[#183153] px-4 text-sm font-semibold text-[#183153] disabled:opacity-50"><RefreshCw size={16} className={busy === 'refresh' ? 'animate-spin' : ''} /> Refresh</button>
        </header>
        {error && <p className="mt-5 border-l-4 border-[#A63A32] bg-[#F6E3E1] px-4 py-3 text-sm text-[#7E2D28]" role="alert">{error}</p>}
        {message && <p className="mt-5 border-l-4 border-[#246B4A] bg-[#E4F0E9] px-4 py-3 text-sm text-[#1B5238]" role="status">{message}</p>}

        {canRequest && <section className="mt-6 border border-[#D8D6CE] bg-white p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center bg-[#EDF1F6] text-[#183153]"><Users size={18} /></span><div><h2 className="font-semibold">Create employee request</h2><p className="text-sm text-[#5E6872]">Creates a pending request; it does not create an Auth account or send an email.</p></div></div><form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={submit}>{(['firstName', 'lastName', 'email', 'jobTitle', 'department'] as const).map((field) => <label key={field} className="block"><span className="mb-2 block text-xs font-semibold capitalize">{field.replace(/([A-Z])/g, ' $1')}</span><input required={field === 'firstName' || field === 'lastName' || field === 'email'} type={field === 'email' ? 'email' : 'text'} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="min-h-11 w-full border border-[#D8D6CE] bg-[#FCFBF7] px-3 text-sm" /></label>)}<label className="block"><span className="mb-2 block text-xs font-semibold">Approved global role</span><select value={form.roleCode} onChange={(event) => setForm({ ...form, roleCode: event.target.value as ProvisioningRoleCode })} className="min-h-11 w-full border border-[#D8D6CE] bg-[#FCFBF7] px-3 text-sm">{PROVISIONING_ROLE_CODES.map((code) => <option key={code} value={code}>{ROLE_LABELS[code]}</option>)}</select></label><div className="sm:col-span-2"><button disabled={busy === 'create'} className="inline-flex min-h-11 items-center gap-2 bg-[#183153] px-4 text-sm font-semibold text-white disabled:opacity-50"><Send size={16} /> Create request</button></div></form></section>}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Pending requests', grouped.pending.length], ['CEO approved', grouped.ceoApproved.length], ['Ready for invitation', grouped.ready.length], ['Invitation sent', grouped.sent.length]].map(([label, count]) => <article key={String(label)} className="border border-[#D8D6CE] bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#5E6872]">{label}</p><p className="mt-2 text-3xl font-semibold">{count}</p></article>)}</section>
        <section className="mt-6 border border-[#D8D6CE] bg-white p-5 sm:p-6"><h2 className="font-semibold">Provisioning requests</h2><div className="mt-4 space-y-3">{requests.length === 0 ? <p className="py-8 text-center text-sm text-[#5E6872]">No provisioning requests yet.</p> : requests.map((request) => <article key={request.id} className="border border-[#E4E1D9] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{request.first_name} {request.last_name}</p><p className="mt-1 text-sm text-[#5E6872]">{request.requested_email} · {request.requested_role?.name ?? 'Role unavailable'}</p><p className="mt-2 text-xs text-[#5E6872]">CEO: {request.ceo_approval_status} · Technical: {request.technical_approval_status} · Invitation: {request.invitation_status}</p></div><span className="border border-[#D8D6CE] px-2 py-1 text-xs font-semibold">{request.status.replaceAll('_', ' ')}</span></div><div className="mt-4 flex flex-wrap gap-2">{isCeoApprovalAllowed(role, permissions, request.status) && <><Action label="Approve as CEO" action="approve_ceo" request={request} busy={busy} onAction={perform} /><Action label="Reject" action="reject_ceo" request={request} busy={busy} onAction={perform} /></>}{isTechnicalApprovalAllowed(role, permissions, request.status) && <><Action label="Technical approve" action="approve_technical" request={request} busy={busy} onAction={perform} /><Action label="Reject" action="reject_technical" request={request} busy={busy} onAction={perform} /></>}{isInvitationAllowed(role, permissions, request.status, request.ceo_approval_status, request.technical_approval_status) && <Action label="Send Supabase invitation" action="send_invitation" request={request} busy={busy} onAction={perform} />}{canRequest && request.status !== 'INVITATION_SENT' && <Action label="Cancel request" action="cancel_request" request={request} busy={busy} onAction={perform} />}</div></article>)}</div></section>
        <section className="mt-6 border border-[#D8D6CE] bg-white p-5 sm:p-6"><h2 className="font-semibold">Account lifecycle</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{users.map((user) => <article key={user.id} className="border border-[#E4E1D9] p-4"><p className="font-semibold">{user.first_name} {user.last_name}</p><p className="mt-1 text-sm text-[#5E6872]">{user.role?.name ?? 'Role unavailable'}</p><p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold"><CheckCircle2 size={14} className="text-[#246B4A]" /> {user.status}</p><p className="mt-2 text-xs text-[#5E6872]">Created {dateLabel(user.created_at)}</p></article>)}</div></section>
      </div>
    </main>
  );
}

function Action({ label, action, request, busy, onAction }: { label: string; action: 'approve_ceo' | 'reject_ceo' | 'approve_technical' | 'reject_technical' | 'send_invitation' | 'cancel_request'; request: ProvisioningRequest; busy: string | null; onAction: (action: 'approve_ceo' | 'reject_ceo' | 'approve_technical' | 'reject_technical' | 'send_invitation' | 'cancel_request', request: ProvisioningRequest) => void }) {
  return <button type="button" disabled={busy === `${action}:${request.id}`} onClick={() => void onAction(action, request)} className="min-h-10 border border-[#183153] px-3 text-xs font-semibold text-[#183153] disabled:opacity-50">{label}</button>;
}
