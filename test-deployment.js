const https = require('https');

const url = 'https://3364964e.elevateforhumanity.pages.dev/';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('=== HTML ANALYSIS ===');
    console.log('Status:', res.statusCode);
    console.log('');
    
    // Check for script tag
    const scriptMatch = data.match(/<script[^>]*type="module"[^>]*src="([^"]+)"/);
    if (scriptMatch) {
      console.log('✅ Module script found:', scriptMatch[1]);
    } else {
      console.log('❌ No module script found');
    }
    
    // Check for root div
    if (data.includes('id="root"')) {
      console.log('✅ Root div found');
    } else {
      console.log('❌ Root div missing');
    }
    
    // Check for noscript
    if (data.includes('<noscript>')) {
      console.log('⚠️  Noscript block present');
    }
    
    // Extract and test the script URL
    if (scriptMatch) {
      const scriptUrl = 'https://3364964e.elevateforhumanity.pages.dev' + scriptMatch[1];
      console.log('');
      console.log('=== TESTING SCRIPT URL ===');
      console.log('URL:', scriptUrl);
      
      https.get(scriptUrl, (scriptRes) => {
        console.log('Script Status:', scriptRes.statusCode);
        console.log('Content-Type:', scriptRes.headers['content-type']);
        
        let scriptData = '';
        scriptRes.on('data', (chunk) => { scriptData += chunk; });
        scriptRes.on('end', () => {
          console.log('Script Size:', scriptData.length, 'bytes');
          console.log('First 200 chars:', scriptData.substring(0, 200));
        });
      }).on('error', (err) => {
        console.log('❌ Script load error:', err.message);
      });
    }
  });
}).on('error', (err) => {
  console.log('❌ Page load error:', err.message);
});
