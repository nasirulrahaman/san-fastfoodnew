importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyA2qxYnkqDjG5tux32pBu8nZjRSQdYTq74",
  authDomain: "san-fastfood.firebaseapp.com",
  projectId: "san-fastfood",
  storageBucket: "san-fastfood.firebasestorage.app",
  messagingSenderId: "46371391363",
  appId: "1:46371391363:web:f49d17065510cbc28658b6"
})

const messaging = firebase.messaging()

// Handle background notifications
messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {}
  self.registration.showNotification(title || 'SAN Fastfood', {
    body: body || 'New update from SAN Fastfood!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: payload.data,
  })
})
