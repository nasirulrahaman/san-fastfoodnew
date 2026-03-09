import { useEffect } from 'react'
import { messaging, getToken, onMessage } from '../firebase'
import { db } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'

const VAPID_KEY = 'YOUR_VAPID_KEY_HERE' // Replace with your VAPID key from Firebase Console

export function useNotifications(user) {
  useEffect(() => {
    if (!user || !messaging) return
    requestPermission()
  }, [user])

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY })
        if (token && user) {
          // Save token to Firestore under user's document
          await setDoc(doc(db, 'users', user.uid), { fcmToken: token }, { merge: true })
          console.log('FCM token saved!')
        }
      }
    } catch (e) {
      console.warn('Notification permission denied or failed:', e)
    }
  }

  // Handle foreground notifications
  useEffect(() => {
    if (!messaging) return
    const unsub = onMessage(messaging, payload => {
      const { title, body } = payload.notification || {}
      if (title) {
        new Notification(title, {
          body: body || '',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
        })
      }
    })
    return () => unsub()
  }, [])
}
