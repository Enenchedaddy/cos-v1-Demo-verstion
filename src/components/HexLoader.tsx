import { useEffect, useState } from 'react';

interface HexLoaderProps {
  fullPage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  progress?: number;
  label?: string;
  simulateProgress?: boolean;
}

const sizes = {
  sm: { shell: 'min-h-36', graphic: 'h-16 w-16', label: 'text-xs' },
  md: { shell: 'min-h-52', graphic: 'h-24 w-24', label: 'text-sm' },
  lg: { shell: 'min-h-72', graphic: 'h-36 w-36', label: 'text-base' },
};

export default function HexLoader({
  fullPage = false,
  size = 'md',
  progress,
  label = 'Loading governed data…',
  simulateProgress = progress === undefined,
}: HexLoaderProps) {
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  useEffect(() => {
    if (!simulateProgress || progress !== undefined) return;

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setSimulatedProgress(() => {
        if (elapsed >= 1800) return 100;
        const eased = 1 - Math.pow(1 - Math.min(elapsed / 1800, 1), 2.2);
        return Math.min(99, Math.round(eased * 100));
      });
    }, 45);

    return () => window.clearInterval(timer);
  }, [progress, simulateProgress]);

  const value = Math.max(0, Math.min(100, Math.round(progress ?? simulatedProgress)));
  const sizing = sizes[size];

  return (
    <div
      className={
        fullPage
          ? 'fixed inset-0 z-[200] flex items-center justify-center bg-[#F3F6FA]/[0.97] px-6'
          : `${sizing.shell} relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-[#D7DEE8] bg-white/90 p-6`
      }
      role="status"
      aria-live="polite"
      aria-label={`${label} ${value}%`}
    >
      <style>{`
        .hex-loader-facet {
          transform-box: view-box;
          transform-origin: 50px 50px;
          animation: hexFacetPulse 1.8s ease-in-out infinite;
        }
        .hex-loader-f2 { animation-delay: .18s; }
        .hex-loader-f3 { animation-delay: .36s; }
        .hex-loader-f4 { animation-delay: .54s; }
        .hex-loader-core {
          transform-box: view-box;
          transform-origin: 50px 50px;
          animation: hexCoreBreathe 1.8s ease-in-out infinite;
        }
        @keyframes hexFacetPulse {
          0%, 62%, 100% { opacity: .24; transform: scale(.92); }
          18%, 36% { opacity: 1; transform: scale(1.035); }
        }
        @keyframes hexCoreBreathe {
          0%, 100% { transform: scale(.96); opacity: .88; }
          50% { transform: scale(1.03); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hex-loader-facet, .hex-loader-core { animation: none !important; opacity: 1; }
        }
      `}</style>

      <div className="flex flex-col items-center text-center">
        <svg className={sizing.graphic} viewBox="0 0 100 100" aria-hidden="true">
          <polygon className="hex-loader-facet hex-loader-f1" points="15.36,30 50,10 84.64,30 67.32,40 50,30 32.68,40" fill="#4065B3" />
          <polygon className="hex-loader-facet hex-loader-f2" points="84.64,30 84.64,70 50,90 50,70 67.32,60 67.32,40" fill="#264288" />
          <polygon className="hex-loader-facet hex-loader-f3" points="50,90 15.36,70 32.68,60 50,70" fill="#182A5C" />
          <polygon className="hex-loader-facet hex-loader-f4" points="15.36,70 15.36,30 32.68,40 32.68,60" fill="#6C84B8" />
          <polygon className="hex-loader-core" points="50,31 66.45,40.5 66.45,59.5 50,69 33.55,59.5 33.55,40.5" fill="#FFFFFF" stroke="#D7DEE8" strokeWidth="1" />
          <text x="50" y="54" textAnchor="middle" fill="#182A5C" fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize="11" fontWeight="500">
            {value}%
          </text>
        </svg>
        <p className={`mt-5 max-w-md font-semibold text-[#18243A] ${sizing.label}`}>{label}</p>
        <div className="mt-4 h-1 w-44 overflow-hidden rounded-full bg-[#DDE6EF]" aria-hidden="true">
          <div className="h-full bg-[#4065B3] transition-[width] duration-150 ease-out" style={{ width: `${value}%` }} />
        </div>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-[#77839A]">
          COS secure operation
        </p>
      </div>
    </div>
  );
}
