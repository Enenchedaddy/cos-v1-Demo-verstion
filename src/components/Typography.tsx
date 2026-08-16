import type { ReactNode } from 'react';

interface PageTitleBarProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  headingId?: string;
  className?: string;
}

export function PageTitleBar({ eyebrow, title, subtitle, actions, headingId, className = '' }: PageTitleBarProps) {
  return (
    <header className={`cos-page-titlebar ${className}`.trim()}>
      <div className="cos-page-titlebar__copy">
        {eyebrow && <div className="cos-type-eyebrow">{eyebrow}</div>}
        <h1 id={headingId} className="cos-page-titlebar__title cos-type-page-title">{title}</h1>
        {subtitle && <p className="cos-page-titlebar__subtitle cos-type-supporting">{subtitle}</p>}
      </div>
      {actions && <div className="cos-page-titlebar__actions">{actions}</div>}
    </header>
  );
}

interface SectionTitleBarProps {
  title: ReactNode;
  detail?: ReactNode;
  action?: ReactNode;
  headingId?: string;
}

export function SectionTitleBar({ title, detail, action, headingId }: SectionTitleBarProps) {
  return (
    <header className="cos-section-titlebar">
      <div className="min-w-0">
        <h2 id={headingId} className="cos-type-card-title">{title}</h2>
        {detail && <p className="cos-section-titlebar__detail">{detail}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
