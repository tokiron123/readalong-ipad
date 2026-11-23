// ReadAlong iPad PWA offline shell. User EPUB, audio, and SRT are stored only in IndexedDB.
const VERSION='readalong-ipad-shell-2026-11-v1';
const ASSETS=['./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('readalong-ipad-shell-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(res=>{if(res.ok){const copy=res.clone();caches.open(VERSION).then(c=>c.put('./index.html',copy));}return res;}).catch(async()=>await caches.match('./index.html') || Response.error()));
    return;
  }
  if(ASSETS.some(path=>new URL(path,self.registration.scope).pathname===url.pathname)){
    event.respondWith(caches.match(request).then(hit=>hit||fetch(request)));
  }
});
