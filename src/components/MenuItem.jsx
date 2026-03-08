import { useApp } from '../context/AppContext'
import styles from './MenuItem.module.css'

const FALLBACK = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'

export default function MenuItem({ item, index }) {
  const { cart, addToCart, removeFromCart } = useApp()
  const id = item.name.replace(/[\s()&]/g, '_')
  const qty = cart[id]?.qty || 0

  return (
    <div className={styles.card} style={{ animationDelay: `${index * 0.055}s` }}>
      {item.size && <span className={styles.sizeBadge}>{item.size}</span>}
      <img
        src={item.img}
        alt={item.name}
        loading="lazy"
        onError={e => { e.target.src = FALLBACK }}
        className={styles.img}
      />
      <div className={styles.body}>
        <h3 className={styles.name}>{item.name}</h3>
        <div className={styles.footer}>
          <span className={styles.price}>₹{item.price}</span>
          <div className={styles.qty}>
            <button onClick={() => removeFromCart(id)}>−</button>
            <span>{qty}</span>
            <button onClick={() => addToCart(item)}>+</button>
          </div>
        </div>
      </div>
    </div>
  )
}
