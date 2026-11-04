import https from 'https';

const opt = (url, w) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('/image/upload/') || url.includes('/image/upload/w_') || url.includes('/image/upload/f_')) return url;
  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto:good,w_${w},c_limit/`);
};

function fetchUrl(url, accept) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'Accept': accept } }, (res) => {
      let len = 0;
      res.on('data', c => len += c.length);
      res.on('end', () => resolve({ status: res.statusCode, size: len }));
    });
    req.on('error', () => resolve({ status: 500 }));
    req.setTimeout(10000, () => { req.destroy(); resolve({ status: 408 }); });
  });
}

async function main() {
  console.log('Fetching products list...');
  const res = await fetch('https://perfumesdfv-rho.vercel.app/api/products?t=' + Date.now());
  const products = await res.json();
  console.log(`Found ${products.length} products.`);

  const urls = new Set();
  for (const p of products) {
    if (p.image) urls.add(p.image);
    let extra = p.images || [];
    if (typeof extra === 'string') {
      try { extra = JSON.parse(extra); } catch { extra = [extra]; }
    }
    for (const img of extra) {
      if (typeof img === 'string' && img.trim()) urls.add(img.trim());
    }
  }

  const jobs = [];
  const accepts = ['image/avif,image/webp,image/*', 'image/webp,image/*', 'image/*'];
  for (const u of urls) {
    for (const a of accepts) {
      jobs.push({ url: opt(u, 400), accept: a });
    }
  }

  console.log(`Warming up Cloudinary CDN for ${urls.size} unique images (${jobs.length} requests)...`);
  let done = 0;
  let ok = 0;
  const queue = [...jobs];

  const workers = Array.from({ length: 10 }, async () => {
    while (queue.length > 0) {
      const job = queue.pop();
      const res = await fetchUrl(job.url, job.accept);
      done++;
      if (res.status === 200) ok++;
      if (done % 30 === 0 || done === jobs.length) {
        console.log(`Progress: ${done}/${jobs.length} (${ok} cached)`);
      }
    }
  });

  await Promise.all(workers);
  console.log(`Finished warming: ${ok}/${jobs.length} successful CDN caches.`);
}

main().catch(console.error);
