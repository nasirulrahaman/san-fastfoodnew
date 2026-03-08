import { useState } from 'react'
import { useApp } from '../context/AppContext'
import LoginModal from './LoginModal'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { cartCount, user, setActiveDrawer } = useApp()
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.logo}>SAN <span>FAST</span>FOOD</div>
        <div className={styles.right}>
          {user ? (
            <button className={styles.avatar} onClick={() => setActiveDrawer('profile')}>
              {user.name?.[0]?.toUpperCase() || '👤'}
            </button>
          ) : (
            <button className={styles.loginBtn} onClick={() => setShowLogin(true)}>
              🔐 Login
            </button>
          )}
          <button className={styles.cartBtn} onClick={() => setActiveDrawer('cart')}>
            🛒 <span className={styles.badge}>{cartCount}</span>
          </button>
        </div>
      </nav>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
