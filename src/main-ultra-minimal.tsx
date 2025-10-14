console.log('[EFH] Ultra minimal script executing...');

const root = document.getElementById('root');
console.log('[EFH] Root element:', root);

if (root) {
  root.innerHTML = `
    <div style="font-family: system-ui; padding: 2rem; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #22c55e;">✅ JavaScript IS Executing!</h1>
      <p>If you see this, the problem is NOT with Cloudflare Pages or the build.</p>
      <p>The issue is in the React app initialization.</p>
      <div style="margin-top: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 8px;">
        <h3>Next Step:</h3>
        <p>Check the browser console for React/import errors.</p>
      </div>
    </div>
  `;
  console.log('[EFH] Content injected successfully');
} else {
  console.error('[EFH] FATAL: Root element not found!');
  document.body.innerHTML = '<h1 style="color: red; padding: 2rem;">ERROR: Root element not found</h1>';
}
