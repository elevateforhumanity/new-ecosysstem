import https from 'https';

const url = 'https://3364964e.elevateforhumanity.pages.dev/';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('=== HTML ANALYSIS ===');
    console.log('Status:', res.statusCode);
    console.log('');
    
    const scriptMatch = data.match(/<script[^>]*type="module"[^>]*src="([^"]+)"/);
    if (scriptMatch) {
      console.log('✅ Module script found:', scriptMatch[1]);
      
      const scriptUrl = 'https://3364964e.elevateforhumanity.pages.dev' + scriptMatch[1];
      console.log('');
      console.log('=== TESTING SCRIPT URL ===');
      
      https.get(scriptUrl, (scriptRes) => {
        console.log('Script Status:', scriptRes.statusCode);
        console.log('Content-Type:', scriptRes.headers['content-type']);
        
        let scriptData = '';
        scriptRes.on('data', (chunk) => { scriptData += chunk; });
        scriptRes.on('end', () => {
          console.log('Script Size:', scriptData.length, 'bytes');
          console.log('First 300 chars:', scriptData.substring(0, 300));
          
          // Check for common issues
          if (scriptData.includes('import.meta.env.VITE_')) {
            console.log('✅ Uses VITE_ env vars');
          }
          if (scriptData.includes('process.env')) {
            console.log('❌ WARNING: Uses process.env (will fail in browser)');
          }
        });
      });
    } else {
      console.log('❌ No module script found');
    }
    
    if (data.includes('id="root"')) {
      console.log('✅ Root div found');
    }
  });
});
