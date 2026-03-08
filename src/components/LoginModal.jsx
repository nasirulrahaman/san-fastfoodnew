import { useState } from 'react'
import { useApp } from '../context/AppContext'
import styles from './LoginModal.module.css'

export default function LoginModal({ onClose }) {
  const { login } = useApp()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) { setError('Enter a valid 10-digit phone number'); return }
    setLoading(true)
    setError('')
    await login(name.trim(), phone.trim())
    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>👋 Login / Sign Up</h2>
        <p>Enter your details to track orders & earn loyalty points</p>
        <input
          className="field"
          placeholder="Your Name *"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <input
          className="field"
          placeholder="Phone Number * (e.g. 9876543210)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          type="tel"
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        {error && <p className={styles.error}>{error}</p>}
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in…' : '✅ Continue'}
        </button>
        <p className={styles.note}>No OTP needed. Your data is saved securely.</p>
      </div>
    </div>
  )
}
