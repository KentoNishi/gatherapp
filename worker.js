self.addEventListener('push', function(event) {
    var data = event.data.json();
    var tag=((data.tag.split("/").length>0&&data.tag.split("/")[1]=="board"?"":Date.now())+data.tag);
    var obj={
        body: data.content,
        icon: '/gatherapp/512x512.png',
        tag:tag
    }
    var notification = self.registration.showNotification(data.title, obj);
});
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.matchAll().then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if ('focus' in client){
                return client.focus().then(function(){
                    client.navigate('https://kentonishi.github.io/gatherapp/#'+(event.notification.tag.split(":").length>1?event.notification.tag.split(":")[1]:event.notification.tag));
                });
            }
        }
        if (clients.openWindow){
            return clients.openWindow('https://kentonishi.github.io/gatherapp/#'+(event.notification.tag.split(":").length>1?event.notification.tag.split(":")[1]:event.notification.tag));
        }
    }));
});
/*
self.importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-database.js');

var config = {
    apiKey: "AIzaSyDpWZcmNnF0rmmYJOLgI0-cZJMIvvHngsY",
    authDomain: "gatherapp-1906b.firebaseapp.com",
    databaseURL: "https://gatherapp-1906b.firebaseio.com",
    projectId: "gatherapp-1906b",
    storageBucket: "gatherapp-1906b.appspot.com",
    messagingSenderId: "1038044491990"
};
firebase.initializeApp(config);

var messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function(payload) {
  // Customize notification here
  var notificationTitle = 'Background Message Title';
  var notificationOptions = {
    body: 'Background Message body.',
    icon: '/gatherapp/192x192.png'
  };
  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});

messaging.onMessage(function(payload) {
  // Customize notification here
  var notificationTitle = 'Background Message Title';
  var notificationOptions = {
    body: 'Background Message body.',
    icon: '/gatherapp/192x192.png'
  };
  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});

var uid;

self.onmessage=function(e){
    if(uid==null){
        uid=e.data;
    }
}
*/

var CACHE_NAME = "CACHE"+new Date().getTime();

var CACHED_URLS = [
    '/gatherapp/app.js',
    '/gatherapp/',
    '/gatherapp/index.html',
    '/gatherapp/manifest.json',
    '/gatherapp/192x192.png',
    '/gatherapp/512x512.png',
    '/gatherapp/add.svg',
    '/gatherapp/menu.svg',
    '/gatherapp/google.png',
    '/gatherapp/logo.png'
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHED_URLS);
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        }
      });
    })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (CACHE_NAME !== cacheName &&  cacheName.startsWith("CACHE")) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
