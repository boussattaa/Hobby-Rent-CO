const https = require('https');

const endpoints = [
  '/',
  '/offroad',
  '/water',
  '/trailers',
  '/tools',
  '/search?q=trailer',
  '/search?q=boat',
  '/search?q=skid%20steer',
  '/item/5c3fc466-e53f-4145-8742-c461ef4a28ac',
  '/cancellation-policy',
  '/protection-plan',
  '/terms',
  '/privacy',
  '/support',
  '/robots.txt',
  '/sitemap.xml'
];

async function checkUrl(path) {
  return new Promise((resolve) => {
    const url = `https://www.hobbyrent.com${path}`;
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          contentType: res.headers['content-type'],
          length: body.length,
          hasHsts: !!res.headers['strict-transport-security'],
          hasNosniff: !!res.headers['x-content-type-options'],
          hasFrameDeny: !!res.headers['x-frame-options']
        });
      });
    }).on('error', (err) => {
      resolve({ path, error: err.message });
    });
  });
}

async function run() {
  console.log('--- Production Endpoints Verification ---');
  for (const ep of endpoints) {
    const res = await checkUrl(ep);
    if (res.error) {
      console.log(`❌ ${ep} -> ERROR: ${res.error}`);
    } else {
      const ok = res.status === 200 ? '✅' : '⚠️';
      console.log(`${ok} [${res.status}] ${ep} (${res.length} bytes) | HSTS: ${res.hasHsts} | CSP/SecHeaders: ${res.hasNosniff && res.hasFrameDeny}`);
    }
  }
}

run();
