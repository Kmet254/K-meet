
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDgRaeK8CnCpHyxaIE7MaspmRinswwsrNo",
  authDomain: "kmeet-database.firebaseapp.com",
  projectId: "kmeet-database",
  storageBucket: "kmeet-database.firebasestorage.app",
  messagingSenderId: "123313610325",
  appId: "1:123313610325:web:255c467996eff14d72bedc"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log(
    "[firebase-messaging-sw.js] Background message received:",
    payload
  );

  const notificationTitle =
    payload.notification?.title || "Kmeet";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "A new member has joined Kmeet ❤️",
    icon: "/K-meet/kmeet-heart.png",
    badge: "/K-meet/kmeet-heart.png",
    data: {
      url: "https://kmet254.github.io/K-meet/discover.html"
    }
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(
      event.notification.data?.url ||
      "https://kmet254.github.io/K-meet/discover.html"
    )
  );
});
