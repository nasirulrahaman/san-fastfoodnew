import { useApp } from '../context/AppContext'
import styles from './FloatingCart.module.css'

export default function FloatingCart() {
  const { cartCount, total, setActiveDrawer } = useApp()

  if (cartCount === 0) return null

  return (
    <>
      {/* Floating pill (desktop) */}
      <button className={styles.pill} onClick={() => setActiveDrawer('cart')}>
        🛒 {cartCount} item{cartCount !== 1 ? 's' : ''} | ₹{total}
        <span className={styles.badge}>View</span>
      </button>

      {/* Mobile bottom bar */}
      <div className={styles.mobBar}>
        <a href="#menu" className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '.85rem', padding: '11px' }}>
          🍽️ Browse Menu
        </a>
        <button className={styles.mobCart} onClick={() => setActiveDrawer('cart')}>
          🛒 <span>{cartCount}</span>
        </button>
      </div>
    </>
  )
}
