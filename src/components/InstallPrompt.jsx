import { useState, useEffect } from 'react'
import styles from './InstallPrompt.module.css'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (localStorage.getItem('install_prompt_shown')) return
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show after 8 seconds (after notification prompt)
      setTimeout(() => setVisible(true), 8000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setVisible(false)
    localStorage.setItem('install_prompt_shown', 'true')
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  const handleClose = () => {
    setVisible(false)
    localStorage.setItem('install_prompt_shown', 'true')
  }

  if (!visible || !deferredPrompt) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.banner}>
        <button className={styles.close} onClick={handleClose}>✕</button>
        <div className={styles.left}>
          <img src="/icons/icon-192.png" className={styles.appIcon} alt="SAN Fastfood" />
          <div className={styles.content}>
            <h3>Install SAN Fastfood App!</h3>
            <p>Order faster from your home screen 📲</p>
            <div className={styles.features}>
              <span>⚡ Faster ordering</span>
              <span>🔔 Get offers</span>
              <span>📴 Works offline</span>
            </div>
          </div>
        </div>
        <div className={styles.btns}>
          <button className={styles.installBtn} onClick={handleInstall}>
            📲 Install App
          </button>
          <button className={styles.laterBtn} onClick={handleClose}>
            Not Now
          </button>
        </div>
      </div>
    </div>
  )
}
