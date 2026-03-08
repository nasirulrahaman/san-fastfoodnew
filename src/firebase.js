import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyA2qxYnkqDjG5tux32pBu8nZjRSQdYTq74",
  authDomain: "san-fastfood.firebaseapp.com",
  projectId: "san-fastfood",
  storageBucket: "san-fastfood.firebasestorage.app",
  messagingSenderId: "46371391363",
  appId: "1:46371391363:web:f49d17065510cbc28658b6"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Messaging (push notifications)
let messaging = null
try {
  messaging = getMessaging(app)
} catch {}
export { messaging, getToken, onMessage }
