import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import COSLogo from './COSLogo';

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#F3F6FA] text-[#111C33] lg:grid lg:grid-cols-[minmax(320px,38%)_1fr]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#183153] lg:flex lg:flex-col lg:justify-between lg:p-8" aria-label="Central Operating System">
        <a href="/?view=app" className="relative z-10 w-fit text-[11px] font-bold uppercase tracking-[0.16em] text-white">
          Central Operating System
        </a>

        <div className="relative z-10 mx-auto flex flex-col items-center" aria-hidden="true">
          <div className="flex aspect-square w-[min(72%,420px)] items-center justify-center rounded-[48px] border border-white/15 bg-[#254663]">
            <COSLogo className="h-[72%] w-[72%]" variant="white" />
          </div>
          <p className="mt-8 font-display text-7xl font-semibold leading-none tracking-[-0.06em] text-white">COS</p>
        </div>

        <span aria-hidden="true" />
      </aside>

      <div className="flex min-h-screen flex-col px-4 py-6 sm:px-8 sm:py-8 lg:px-16">
        <header className="mx-auto flex w-full max-w-[600px] items-center justify-between border-b border-[#D7DEE8] pb-4">
          <a href="/?view=app" className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#335AA8] lg:hidden">
            Central Operating System
          </a>
          <span aria-hidden="true" />
          <a href="/?view=app" className="inline-flex min-h-12 items-center gap-2 text-xs font-semibold text-[#52617A] transition hover:text-[#335AA8]">
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Back to gateway</span>
          </a>
        </header>

        <section className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center py-12 sm:py-16">
          <div className="rounded-[24px] border border-[#CAD4E1] bg-white p-6 shadow-[0_12px_32px_rgba(20,36,64,0.08)] sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-8">
              <h1 className="text-[40px] font-semibold leading-none sm:text-[48px]">{title}</h1>
              <span className="mt-2 h-3 w-3 shrink-0 rounded-full bg-[#335AA8]" aria-hidden="true" />
            </div>
            <div>
              {children}
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-[#66758D]">{footer}</div>
        </section>
      </div>
    </main>
  );
}

interface AuthFieldProps {
  id: string;
  label: string;
  error?: string;
  type: 'text' | 'email' | 'password';
  value: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  onChange: (event: { target: { value: string } }) => void;
}

export function AuthField({ label, error, id, ...props }: AuthFieldProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#68778E]">{label}</span>
      <input id={id} {...props} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`min-h-12 w-full rounded-[12px] border bg-[#F9FBFD] px-4 text-sm text-[#18243A] outline-none transition focus:ring-2 ${error ? 'border-[#A63A32] focus:border-[#A63A32] focus:ring-[#A63A32]/10' : 'border-[#CBD5E2] focus:border-[#335AA8] focus:ring-[#335AA8]/15'}`} />
      {error && <span id={`${id}-error`} className="mt-2 block text-xs text-[#A63A32]">{error}</span>}
    </label>
  );
}

export function WorkspaceField({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: string }) {
  return (
    <label className="block" htmlFor="workspace">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#68778E]">Destination</span>
      <div className="relative">
        <select
          id="workspace"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'workspace-error' : undefined}
          className={`min-h-12 w-full appearance-none rounded-[12px] border bg-[#F9FBFD] px-4 pr-12 text-sm font-medium text-[#18243A] outline-none transition focus:ring-2 ${error ? 'border-[#A63A32] focus:ring-[#A63A32]/10' : 'border-[#CBD5E2] focus:border-[#335AA8] focus:ring-[#335AA8]/15'}`}
        >
          <option value="">Select workspace</option>
          <option value="sales">Sales Platform</option>
          <option value="marketing">Marketing Platform</option>
          <option value="management">CEO &amp; Management Suite</option>
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 h-2 w-2 -translate-y-2 rotate-45 border-b-2 border-r-2 border-[#52617A]" aria-hidden="true" />
      </div>
      {error && <span id="workspace-error" className="mt-2 block text-xs text-[#A63A32]">{error}</span>}
    </label>
  );
}

export function AuthSubmitButton({ children }: { children: ReactNode }) {
  return (
    <button type="submit" className="flex min-h-12 w-full items-center justify-center rounded-[12px] bg-[#335AA8] px-4 text-sm font-semibold text-white transition hover:bg-[#284986] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#335AA8]">
      {children}
    </button>
  );
}
