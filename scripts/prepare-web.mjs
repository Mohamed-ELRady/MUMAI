import { copyFile, readFile, writeFile } from 'node:fs/promises';

const indexPath = new URL('../dist/index.html', import.meta.url);
let html = await readFile(indexPath, 'utf8');
html = html
  .replace('<html lang="en">', '<html lang="ar" dir="rtl">')
  .replace('</head>', `  <meta name="description" content="MUMAI — private, bilingual child development tracking for families.">
  <meta name="theme-color" content="#A84F45">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">
  <link rel="manifest" href="/MUMAI/manifest.webmanifest">
</head>`)
  .replace('</body>', `  <script>if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/MUMAI/sw.js', { scope: '/MUMAI/' }));</script>
</body>`);
await writeFile(indexPath, html);
await writeFile(new URL('../dist/404.html', import.meta.url), html);
await copyFile(new URL('../assets/icon.png', import.meta.url), new URL('../dist/icon-512.png', import.meta.url));
await writeFile(new URL('../dist/manifest.webmanifest', import.meta.url), JSON.stringify({
  name: 'MUMAI — Child Development Tracker', short_name: 'MUMAI', lang: 'ar', dir: 'rtl',
  start_url: '/MUMAI/', scope: '/MUMAI/', display: 'standalone', background_color: '#FFF8F3', theme_color: '#A84F45',
  icons: [{ src: '/MUMAI/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }],
}, null, 2));
await writeFile(new URL('../dist/sw.js', import.meta.url), `const CACHE='mumai-v2';
const HOME='/MUMAI/';
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.add(HOME)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match(HOME))));return;}
e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;})));});\n`);
