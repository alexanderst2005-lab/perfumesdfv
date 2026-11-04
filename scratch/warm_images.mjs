// Pre-genera en Cloudinary las versiones optimizadas (500 y 900 px) de TODAS las fotos
// de todos los productos, para que ningún visitante espere la primera transformación.
// Uso: node scratch/warm_images.mjs [urlBase]
const base = process.argv[2] || 'https://perfumesdfv-rho.vercel.app';

const opt = (url, w) =>
  url.includes('/image/upload/') && !url.includes('/image/upload/w_')
    ? url.replace('/image/upload/', `/image/upload/w_${w},f_auto,q_auto/`)
    : url;

const products = await (await fetch(`${base}/api/products?t=${Date.now()}`)).json();
const urls = new Set();
for (const p of products) {
  if (p.image) urls.add(p.image);
  let extra = p.images || [];
  if (typeof extra === 'string') { try { extra = JSON.parse(extra); } catch { extra = [extra]; } }
  for (const i of extra) if (typeof i === 'string' && i.trim()) urls.add(i.trim());
}

// Se pide con distintos Accept para generar avif, webp y el formato por defecto.
const accepts = ['image/avif,image/webp,image/*', 'image/webp,image/*', 'image/*'];
const jobs = [];
for (const u of urls) for (const w of [500, 900]) for (const a of accepts) jobs.push([opt(u, w), a]);

console.log(`${urls.size} imagenes, ${jobs.length} peticiones`);
let ok = 0, fail = 0;
const queue = [...jobs];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const [url, accept] = queue.pop();
    try {
      const r = await fetch(url, { headers: { Accept: accept } });
      await r.arrayBuffer();
      r.ok ? ok++ : fail++;
    } catch { fail++; }
  }
}));
console.log(`listo: ${ok} ok, ${fail} fallidas`);
