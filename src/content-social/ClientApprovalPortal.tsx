import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileCheck2, LoaderCircle, ShieldCheck } from 'lucide-react';
import COSLogo from '../components/COSLogo';
import { supabase } from '../supabaseClient';

interface ClientApprovalData {
  approvalNumber: string;
  title: string;
  status: string;
  dueAt: string;
  requestedBy: string;
  targets: Array<{ variantId: string; versionId: string; versionNumber: number; channel: string; copy: string; externalAssetUrl?: string | null; changeSummary: string }>;
}

export default function ClientApprovalPortal({ token }: { token: string }) {
  const [data, setData] = useState<ClientApprovalData | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'saving' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>();
  const [identity, setIdentity] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    let active = true;
    void supabase.rpc('cs_client_approval', { p_token: token }).then(({ data: response, error: rpcError }) => {
      if (!active) return;
      if (rpcError) { setError(rpcError.message); setStatus('error'); return; }
      setData(response as ClientApprovalData);
      setStatus('loaded');
    });
    return () => { active = false; };
  }, [token]);

  const decide = async (action: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED') => {
    if (!identity.trim()) { setError('Enter your name before recording a decision.'); return; }
    if (action !== 'APPROVED' && !comment.trim()) { setError('Add a comment explaining the requested change or rejection.'); return; }
    setStatus('saving'); setError(undefined);
    const { data: response, error: rpcError } = await supabase.rpc('cs_client_approval', { p_token: token, p_action: action, p_comment: comment, p_identity: identity });
    if (rpcError) { setError(rpcError.message); setStatus('error'); return; }
    setData(response as ClientApprovalData); setStatus('success');
  };

  return <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 font-sans text-[#172B4D] sm:py-14"><div className="mx-auto max-w-3xl"><header className="flex items-center gap-3"><COSLogo className="h-11 w-11" variant="full" /><div><p className="font-display text-xs font-bold uppercase tracking-[.1em] text-[#155EEF]">Brand Circuit</p><p className="text-sm font-semibold">Secure client approval</p></div></header>{status === 'loading' && <PortalState icon={LoaderCircle} title="Opening approval" detail="Validating the secure link and immutable content versions." spinning />}{status === 'error' && !data && <PortalState icon={AlertTriangle} title="Approval unavailable" detail={error ?? 'This link is invalid, expired, revoked, or already superseded.'} />}{data && <section className="mt-8 overflow-hidden rounded-2xl border border-[#D9E0EA] bg-white shadow-sm"><div className="border-b border-[#E4E9F0] p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-[10px] font-semibold text-[#155EEF]">{data.approvalNumber}</p><h1 className="mt-2 font-display text-2xl font-bold">{data.title}</h1><p className="mt-2 text-sm text-[#65758B]">Requested by {data.requestedBy} · due {new Date(data.dueAt).toLocaleString()}</p></div><span className="rounded-full border border-[#BFD4FF] bg-[#EEF4FF] px-3 py-1 font-mono text-[10px] font-semibold text-[#155EEF]">{data.status}</span></div></div><div className="space-y-4 p-6 sm:p-8">{data.targets.map((target) => <article key={target.versionId} className="rounded-xl border border-[#D9E0EA] bg-[#F9FBFD] p-5"><div className="flex items-center justify-between"><strong className="font-display text-sm">{target.channel}</strong><span className="font-mono text-xs">Version {target.versionNumber}</span></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#44546B]">{target.copy}</p><p className="mt-3 text-xs text-[#74839A]">{target.changeSummary}</p>{target.externalAssetUrl && <a className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#155EEF] underline underline-offset-4" href={target.externalAssetUrl} target="_blank" rel="noreferrer">Open attached asset</a>}</article>)}{data.status === 'PENDING' && status !== 'success' && <div className="border-t border-[#E4E9F0] pt-6"><label className="block text-xs font-semibold">Your name<input className="cs-input mt-2" value={identity} onChange={(event) => setIdentity(event.target.value)} /></label><label className="mt-4 block text-xs font-semibold">Decision comment<textarea className="cs-input mt-2 min-h-24" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Required when requesting changes or rejecting" /></label>{error && <p className="mt-3 text-sm text-red-700">{error}</p>}<div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end"><button className="cs-button-secondary" disabled={status === 'saving'} onClick={() => void decide('REJECTED')}>Reject</button><button className="cs-button-secondary" disabled={status === 'saving'} onClick={() => void decide('CHANGES_REQUESTED')}>Request changes</button><button className="cs-button-primary" disabled={status === 'saving'} onClick={() => void decide('APPROVED')}>{status === 'saving' ? <LoaderCircle size={15} className="animate-spin" /> : <ShieldCheck size={15} />}Approve exact versions</button></div></div>}{status === 'success' && <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 size={20} className="mt-0.5 shrink-0" /><div><h2 className="font-display text-sm font-bold">Decision recorded</h2><p className="mt-1 text-xs leading-5">Your one-time link is now revoked and the decision has been added to the audit trail.</p></div></div>}</div></section>}<p className="mt-5 text-center text-xs text-[#74839A]">This one-time link is bound to the versions shown above. Do not forward it.</p></div></main>;
}

function PortalState({ icon: Icon, title, detail, spinning = false }: { icon: typeof FileCheck2; title: string; detail: string; spinning?: boolean }) {
  return <section className="mt-16 rounded-2xl border border-[#D9E0EA] bg-white p-10 text-center"><Icon className={`mx-auto text-[#155EEF] ${spinning ? 'animate-spin' : ''}`} size={28} /><h1 className="mt-5 font-display text-xl font-bold">{title}</h1><p className="mt-2 text-sm text-[#74839A]">{detail}</p></section>;
}
