/* Günlük bütçe — çevrimdışı çalışma. Bilgiler (localStorage) burada değil, telefonda; bu dosya sadece uygulamanın dosyalarını saklar.
   Sayfa (index.html): önce internetten istenir (en çok 4 sn beklenir), gelmezse saklanan sürüm açılır → güncelleme hemen görünür, internetsiz de çalışır.
   Yazı tipi ve ikonlar: önce saklanan (değişmiyorlar). */
var C="gb-0.1.10",FILES=["./","index.html","nunito.ttf","manifest.webmanifest","icons/icon-192.png","icons/apple-touch-icon.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(FILES.map(function(f){return new Request(f,{cache:"reload"})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==C}).map(function(n){return caches.delete(n)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){
  var q=e.request,u=new URL(q.url);
  if(q.method!=="GET"||u.origin!==location.origin)return;
  var page=q.mode==="navigate"||/\/(index\.html)?$/.test(u.pathname);
  e.respondWith(caches.open(C).then(function(c){
    if(page){   /* sayfa: internet önce */
      var net=fetch(q,{cache:"no-cache"}).then(function(r){if(r&&r.ok)c.put(q,r.clone());return r});
      var late=new Promise(function(ok){setTimeout(ok,4000)}).then(function(){return c.match(q,{ignoreSearch:true})});
      return Promise.race([net,late.then(function(h){return h||net})]).catch(function(){return c.match(q,{ignoreSearch:true}).then(function(h){return h||c.match("./")})});
    }
    return c.match(q,{ignoreSearch:true}).then(function(hit){   /* diğerleri: saklanan önce */
      return hit||fetch(q).then(function(r){if(r&&r.ok)c.put(q,r.clone());return r});
    });
  }));
});
