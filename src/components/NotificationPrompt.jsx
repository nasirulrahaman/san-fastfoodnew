import { useState, useEffect } from 'react'
import styles from './NotificationPrompt.module.css'

export default function NotificationPrompt() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if already answered
    if (localStorage.getItem('notif_prompt_shown')) return
    // Don't show if already granted
    if (Notification?.permission === 'granted') return
    // Show after 3 seconds
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleEnable = () => {
    setVisible(false)
    localStorage.setItem('notif_prompt_shown', 'true')
    // Trigger browser notification permission directly
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // Re-init OneSignal to register the token
          if (window.OneSignalDeferred) {
            window.OneSignalDeferred.push(async function(OneSignal) {
              try {
                await OneSignal.Notifications.requestPermission()
              } catch(e) {}
            })
          }
        }
      })
    }
  }

  const handleClose = () => {
    setVisible(false)
    localStorage.setItem('notif_prompt_shown', 'true')
  }

  if (!visible) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.banner}>
        <button className={styles.close} onClick={handleClose}>✕</button>
        <div className={styles.icon}>🔔</div>
        <div className={styles.content}>
          <h3>Get Exclusive Offers & Deals!</h3>
          <p>Enable notifications to never miss a discount from SAN Fastfood 🍗</p>
        </div>
        <div className={styles.btns}>
          <button className={styles.enableBtn} onClick={handleEnable}>
            ✅ Enable Now
          </button>
          <button className={styles.laterBtn} onClick={handleClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}
