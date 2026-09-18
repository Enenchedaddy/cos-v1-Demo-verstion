import type { ReactNode } from 'react';
import COSLogo from './COSLogo';
import './LoginPage.css';

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <main className="cos-login cos-auth">
      <div className="cos-login__content">
        <a href="/app" className="cos-login__brand cos-auth__brand" aria-label="Central Operating System">
          <span className="cos-auth__logo"><COSLogo className="h-12 w-12" variant="white" /></span>
          <span>COS</span>
        </a>
        <section className="cos-login__card" aria-labelledby="auth-title">
          <h1 id="auth-title">{title}</h1>
          {children}
        </section>
        {footer && <div className="mt-6 text-center text-sm text-[#66758D]">{footer}</div>}
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
          <option value="management">CEO &amp; Management Suite</option>
          <option value="sales-marketing">Sales and Marketing platform</option>
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
