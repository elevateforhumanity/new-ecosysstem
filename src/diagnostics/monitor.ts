declare global {
  interface Window {
    __EFH_MONITOR__?: { errors: any[] };
  }
}
window.__EFH_MONITOR__ = window.__EFH_MONITOR__ || { errors: [] };

window.addEventListener(
  'error',
  (e: any) => {
    const isChunk =
      e?.message?.includes('Loading chunk') ||
      (e?.target?.src && e.target.src.includes('/assets/'));
    const payload = {
      time: new Date().toISOString(),
      message: e?.message || 'resource error',
      src: (e?.target && (e.target as any).src) || null,
      isChunk,
    };
    window.__EFH_MONITOR__!.errors.push(payload);
    console.error('[EFH][monitor] error:', payload);
  },
  true
);

window.addEventListener('unhandledrejection', (e: any) => {
  const payload = {
    time: new Date().toISOString(),
    reason: String(e?.reason || 'unknown'),
  };
  window.__EFH_MONITOR__!.errors.push(payload);
  console.error('[EFH][monitor] unhandledrejection:', payload);
});
