import type { ReactNode } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import COSLogo from './COSLogo';

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#F3F6FA] text-[#111C33] lg:grid lg:grid-cols-[minmax(340px,0.82fr)_minmax(560px,1.18fr)]">
      <section className="relative hidden overflow-hidden bg-[#14294A] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-40 -top-32 h-[440px] w-[440px] rounded-full border border-white/10" />
        <div className="absolute -right-20 -top-12 h-[280px] w-[280px] rounded-full border border-white/10" />

        <a href="/app" className="relative flex w-fit items-center gap-3" aria-label="Central Operating System gateway">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white">
            <COSLogo className="h-8 w-8" variant="full" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#AFC3E6]">Central Operating System</p>
            <p className="mt-0.5 text-sm font-semibold text-white">Secure identity gateway</p>
          </div>
        </a>

        <div className="relative max-w-lg">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#90AADA]">One identity · governed access</p>
          <h2 className="mt-5 font-display text-5xl font-semibold leading-[1.04] tracking-[-0.04em] text-white">
            Your operating system starts here.
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-[#C2CEE2]">
            Enter one secure gateway for sales, marketing, and management workflows across the shared operating spine.
          </p>
        </div>

        <div className="relative flex items-center gap-3 border-t border-white/15 pt-6 text-xs text-[#C2CEE2]">
          <ShieldCheck size={18} className="text-[#7DD8BB]" />
          <span>Workspace selection is recorded with every session.</span>
        </div>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16 lg:py-10">
        <header className="flex items-center justify-between">
          <a href="/app" className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[#52617A] transition hover:text-[#335AA8]">
            <ArrowLeft size={15} />
            Back to gateway
          </a>
          <a href="/app" className="flex items-center gap-2 lg:hidden" aria-label="Central Operating System gateway">
            <COSLogo className="h-8 w-8" variant="full" />
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#183153]">COS</span>
          </a>
        </header>

        <div className="mx-auto flex w-full max-w-[500px] flex-1 flex-col justify-center py-10">
          <div className="mb-8">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#335AA8]">{eyebrow}</p>
            <h1 className="mt-3 text-[40px] font-semibold leading-tight sm:text-[46px]">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-[#66758D]">{description}</p>
          </div>

          <div className="rounded-2xl border border-[#CAD4E1] bg-white p-5 shadow-[0_14px_40px_rgba(20,36,64,0.08)] sm:p-7">
            {children}
          </div>
          <div className="mt-6 text-center text-sm text-[#66758D]">{footer}</div>
        </div>

        <p className="text-center font-mono text-[9px] uppercase tracking-[0.11em] text-[#8A96A8]">
          Internal access · CO-10 secure
        </p>
      </section>
    </main>
  );
}

interface AuthFieldProps {
  id: string;
  label: string;
  error?: string;
  type: 'text' | 'email' | 'password';
  value: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  onChange: (event: { target: { value: string } }) => void;
}

export function AuthField({ label, error, id, ...props }: AuthFieldProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#68778E]">{label}</span>
      <input
        id={id}
        {...props}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`min-h-12 w-full rounded-lg border bg-[#F9FBFD] px-3.5 text-sm text-[#18243A] outline-none transition placeholder:text-[#9AA5B5] focus:ring-2 ${
          error
            ? 'border-[#A63A32] focus:border-[#A63A32] focus:ring-[#A63A32]/10'
            : 'border-[#CBD5E2] focus:border-[#335AA8] focus:ring-[#335AA8]/15'
        }`}
      />
      {error && <span id={`${id}-error`} className="mt-1.5 block text-xs text-[#A63A32]">{error}</span>}
    </label>
  );
}

export function WorkspaceField({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: string }) {
  return (
    <label className="block" htmlFor="workspace">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#68778E]">Operating workspace</span>
      <select
        id="workspace"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'workspace-error' : undefined}
        className={`min-h-12 w-full rounded-lg border bg-[#F9FBFD] px-3.5 text-sm font-medium text-[#18243A] outline-none transition focus:ring-2 ${error ? 'border-[#A63A32] focus:ring-[#A63A32]/10' : 'border-[#CBD5E2] focus:border-[#335AA8] focus:ring-[#335AA8]/15'}`}
      >
        <option value="">Select your destination</option>
        <option value="sales">Sales Platform</option>
        <option value="marketing">Marketing Platform</option>
        <option value="management">CEO &amp; Management Suite</option>
      </select>
      {error && <span id="workspace-error" className="mt-1.5 block text-xs text-[#A63A32]">{error}</span>}
    </label>
  );
}

export function AuthSubmitButton({ children }: { children: ReactNode }) {
  return (
    <button type="submit" className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#335AA8] px-4 text-sm font-semibold text-white transition hover:bg-[#284986] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#335AA8]">
      {children}
    </button>
  );
}
