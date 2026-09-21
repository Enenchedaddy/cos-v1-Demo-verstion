import { useEffect, useRef, useState } from 'react';
import { invokePublisher } from './publisher';

export default function PublisherImage({ versionId, approvalToken, onReady }: { versionId: string; approvalToken?: string; onReady?: (ready: boolean) => void }) {
  const [url, setUrl] = useState<string>();
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const onReadyRef = useRef(onReady);
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  useEffect(() => {
    let active = true;
    setUrl(undefined); setError(false); onReadyRef.current?.(false);
    void invokePublisher<{ url: string | null }>('preview', { version_id: versionId, approval_token: approvalToken }).then(result => {
      if (active && result.url) setUrl(result.url);
      else if (active) setError(true);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [versionId, approvalToken, refresh]);
  if (error) return <div role="alert" className="mt-3 text-xs text-red-700">The approved image could not be loaded. <button className="cs-link min-h-11" onClick={() => setRefresh(value => value + 1)}>Retry image</button></div>;
  if (!url) return <p role="status" className="mt-3 text-xs">Loading exact version image…</p>;
  return <img className="mt-4 max-h-96 max-w-full rounded-lg object-contain" src={url} alt="Image attached to this exact content version" onLoad={() => onReady?.(true)} onError={() => { setError(true); onReady?.(false); }} />;
}
