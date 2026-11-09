/* Günlük bütçe — çevrimdışı çalışma. Bilgiler (localStorage) burada değil, telefonda; bu dosya sadece uygulamanın dosyalarını saklar.
   Açılışta önce saklanan sürüm gelir (hızlı, internetsiz), arkada yenisi indirilir; bir sonraki açılışta yeni sürüm görünür. */
var C="gb-0.1.1",FILES=["./","index.html","nunito.ttf","manifest.webmanifest","icons/icon-192.png","icons/apple-touch-icon.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==C}).map(function(n){return caches.delete(n)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(caches.open(C).then(function(c){return c.match(e.request,{ignoreSearch:true}).then(function(hit){
    var net=fetch(e.request).then(function(r){if(r&&r.ok)c.put(e.request,r.clone());return r}).catch(function(){return hit});
    return hit||net;
  })}));
});
