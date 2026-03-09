import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import styles from './OnboardingFlow.module.css'

function InstallStep({ onDone, onSkip }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])
  const handleInstall = async () => {
    if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice }
    onDone()
  }
  return (
    <div className={styles.card}>
      <button className={styles.skip} onClick={onSkip}>Skip</button>
      <div className={styles.appIconWrap}>
        <img src="/icons/icon-192.png" className={styles.appIcon} alt="SAN Fastfood" />
      </div>
      <h2>Install SAN Fastfood!</h2>
      <p>Add to home screen for faster ordering & exclusive deals 🎉</p>
      <div className={styles.features}>
        <div className={styles.feature}><span>⚡</span> Faster ordering</div>
        <div className={styles.feature}><span>🔔</span> Get offers</div>
        <div className={styles.feature}><span>📴</span> Works offline</div>
      </div>
      <button className={styles.primaryBtn} onClick={handleInstall}>📲 Install App</button>
      {!deferredPrompt && (
        <p className={styles.alreadyNote}>Already installed? <button className={styles.link} onClick={onDone}>Continue →</button></p>
      )}
    </div>
  )
}

function LoginStep({ onDone, onSkip }) {
  const { login, user } = useApp()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { if (user) onDone() }, [user])
  const handleLogin = async () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) { setError('Enter a valid 10-digit number'); return }
    setLoading(true)
    await login(name.trim(), phone.trim())
    setLoading(false)
    onDone()
  }
  return (
    <div className={styles.card}>
      <button className={styles.skip} onClick={onSkip}>Skip</button>
      <div className={styles.stepIcon}>👋</div>
      <h2>Welcome!</h2>
      <p>Login to track orders & get exclusive offers</p>
      <input className={styles.input} placeholder="Your Name *" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
      <input className={styles.input} placeholder="Phone Number * (10 digits)" value={phone} onChange={e => setPhone(e.target.value)} type="tel" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.primaryBtn} onClick={handleLogin} disabled={loading}>{loading ? 'Logging in…' : '✅ Continue'}</button>
      <p className={styles.note}>🔒 No OTP needed. Free & secure.</p>
    </div>
  )
}

function NotifStep({ onDone }) {
  const [waiting, setWaiting] = useState(false)
  const handleEnable = async () => {
    setWaiting(true)
    try {
      if (window.OneSignal) {
        await window.OneSignal.Notifications.requestPermission()
      } else if (window.OneSignalDeferred) {
        await new Promise(resolve => {
          window.OneSignalDeferred.push(async function(OneSignal) {
            try { await OneSignal.Notifications.requestPermission() } catch(e) {}
            resolve()
          })
        })
      } else if ('Notification' in window) {
        await Notification.requestPermission()
      }
    } catch(e) { console.log(e) }
    setWaiting(false)
    onDone()
  }
  return (
    <div className={styles.card}>
      <div className={styles.stepIcon}>🔔</div>
      <h2>Get Exclusive Offers!</h2>
      <p>Enable notifications to never miss a deal or discount from SAN Fastfood</p>
      <div className={styles.features}>
        <div className={styles.feature}><span>🎉</span> Flash sale alerts</div>
        <div className={styles.feature}><span>🏷️</span> Coupon codes</div>
        <div className={styles.feature}><span>🍗</span> New item updates</div>
      </div>
      <button className={styles.primaryBtn} onClick={handleEnable} disabled={waiting}>
        {waiting ? 'Waiting for permission…' : '🔔 Enable Notifications'}
      </button>
      <button className={styles.secondaryBtn} onClick={onDone}>Maybe Later</button>
    </div>
  )
}

export default function OnboardingFlow() {
  const { user } = useApp()
  const [step, setStep] = useState(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (localStorage.getItem('onboarding_v3')) return
    const timer = setTimeout(() => { setStep('install'); setVisible(true) }, 2000)
    return () => clearTimeout(timer)
  }, [])
  const finish = () => { localStorage.setItem('onboarding_v3', 'true'); setVisible(false) }
  const goToLogin = () => { if (user) setStep('notif'); else setStep('login') }
  const goToNotif = () => setStep('notif')
  if (!visible) return null
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && finish()}>
      <div className={styles.sheet}>
        <div className={styles.dots}>
          <span className={step === 'install' ? styles.dotActive : styles.dot} />
          <span className={step === 'login' ? styles.dotActive : styles.dot} />
          <span className={step === 'notif' ? styles.dotActive : styles.dot} />
        </div>
        {step === 'install' && <InstallStep onDone={goToLogin} onSkip={goToLogin} />}
        {step === 'login' && <LoginStep onDone={goToNotif} onSkip={goToNotif} />}
        {step === 'notif' && <NotifStep onDone={finish} />}
      </div>
    </div>
  )
}
