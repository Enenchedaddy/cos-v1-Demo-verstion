import { ContentSkeleton } from './SurfaceMotion';

interface HexLoaderProps {
  fullPage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  progress?: number;
  label?: string;
  simulateProgress?: boolean;
}

/** Retains the existing loading API while showing the workspace's known layout. */
export default function HexLoader({ fullPage = false, progress, label = 'Loading governed data…' }: HexLoaderProps) {
  return <div className={fullPage ? 'fixed inset-0 z-[200] overflow-y-auto bg-[#EEF0FB] p-6' : 'w-full'}>
    <ContentSkeleton label={label} />
    {progress !== undefined && <progress className="mx-6" aria-label={label} max={100} value={Math.max(0, Math.min(100, progress))} />}
  </div>;
}
