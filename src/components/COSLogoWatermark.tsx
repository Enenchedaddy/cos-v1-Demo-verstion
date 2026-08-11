import COSLogo from './COSLogo';

export default function COSLogoWatermark() {
  return (
    <div
      className="workspace-logo-watermark pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 select-none md:h-[650px] md:w-[650px]"
      style={{ opacity: 0.085 }}
      aria-hidden="true"
    >
      <COSLogo className="h-full w-full" variant="monochrome" />
    </div>
  );
}
