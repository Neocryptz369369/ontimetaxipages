// On Time Taxi background alert worker - v3 (one fresh noisy alert per push)
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
  var tag = '';
  try {
    if (e.data) {
      var d = e.data.json();
      if (d && d.title) title = String(d.title);
      if (d && d.body) body = String(d.body);
      if (d && d.url) url = String(d.url);
      if (d && d.tag) tag = String(d.tag);
    }
  } catch (err) {}
  if (!tag) tag = 'otx-new-order-' + Date.now();
  e.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: '/ontimetaxi-logo.png',
      badge: '/ontimetaxi-logo.png',
      vibrate: [500, 250, 500, 250, 500, 250, 500],
      requireInteraction: true,
      renotify: true,
      silent: false,
      tag: tag,
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
        if (list[i].url.indexOf(url) > -1 && list[i].focus) return list[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
      return null;
    })
  );
});
