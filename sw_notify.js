self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(function(clientList) {  //console.log(event)
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url == 'https://dj0001.github.io/miband3-selfie/notify.htm' && 'focus' in client)  //DWD-Warnmodul-2/
        return client.focus();
    }
    if (clients.openWindow)
      return clients.openWindow('./');  //notify.htm
  }));
});