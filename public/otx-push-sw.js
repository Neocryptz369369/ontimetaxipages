// On Time Taxi background alert worker
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (e) {
  var title = 'On Time Taxi';
  var body = 'A new taxi order just came in.';
  var url = '/';
  try {
    if (e.data) {
      var d = e.data.json();
      if (d && d.title) title = String(d.title);
      if (d && d.body) body = String(d.body);
      if (d && d.url) url = String(d.url);
    }
  } catch (err) {}
  e.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: '/ontimetaxi-logo.png',
      badge: '/ontimetaxi-logo.png',
      vibrate: [500, 250, 500, 250, 500, 250, 500],
      requireInteraction: true,
      renotify: true,
      tag: 'otx-new-order',
      data: { url: url }
    })
  );
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf(url) >= 0 && list[i].focus) return list[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
      return null;
    })
  );
});
