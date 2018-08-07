self.importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
self.importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
self.addEventListener('push', function(event) {
    var data = event.data;
    var notification = self.registration.showNotification(data.title, {
        body: data.content,
        icon: '/gatherapp/512x512.png'
    });
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

if(navigator.onLine){
    caches.keys().then(function(names) {
        for (let name of names)
            caches.delete(name);
    });
}

var CACHE_NAME = "CACHE";

var urlsToCache = [
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

self.addEventListener('install', function(event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) {
                return response;
            }
            return fetch(event.request);
            }
        )
    );
});
