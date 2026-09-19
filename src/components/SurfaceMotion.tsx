import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import { motion, useIsPresent, useReducedMotion } from 'motion/react';

/** Presence retains only the closing presentation; existing action handlers stay with callers. */
export function FloatingLayer({ children, ...props }: ComponentProps<'div'>) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  return <motion.div {...props as ComponentProps<typeof motion.div>}
    data-closing={!present || undefined} inert={!present || undefined}
    initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }}
    exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : present ? .2 : .15, ease: 'easeOut' }}>
    {children}
  </motion.div>;
}

export function ToastSurface({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div role="status" className={`cos-toast ${className}`}
    initial={{ opacity: 0, x: reduced ? 0 : 16 }} animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, transition: { duration: reduced ? 0 : .15 } }}
    transition={{ duration: reduced ? 0 : .2, ease: 'easeOut' }}>{children}</motion.div>;
}

export function ContentSkeleton({ label, layout = 'workspace' }: { label: string; layout?: 'workspace' | 'detail' }) {
  return <div className="cos-loading-layout" role="status" aria-label={label}>
    <span className="sr-only">{label}</span>
    <div className="cos-skeleton cos-skeleton-heading" aria-hidden="true" />
    <div className="cos-skeleton-metrics" aria-hidden="true" hidden={layout === 'detail'}>{[0, 1, 2, 3].map((item) => <div key={item} className="cos-skeleton" />)}</div>
    <div className="cos-skeleton-records" aria-hidden="true">{[0, 1, 2, 3].map((item) => <div key={item} className="cos-skeleton" />)}</div>
  </div>;
}

/** Fade the existing page node without remounting forms or resetting child state. */
export function useContentFade(section: string) {
  const ref = useRef<HTMLDivElement & HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !ref.current?.animate) return;
    const animation = ref.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
    return () => animation.cancel();
  }, [section, reduced]);
  return ref;
}
