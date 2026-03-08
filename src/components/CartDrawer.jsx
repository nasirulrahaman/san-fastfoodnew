import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import styles from './CartDrawer.module.css'

const FALLBACK = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=60&q=60'

export default function CartDrawer() {
  const {
    cartEntries, subtotal, discount, total,
    addToCart, removeFromCart,
    appliedCoupon, setAppliedCoupon,
    user, placeOrder, showToast,
  } = useApp()

  const [couponCode, setCouponCode] = useState('')
  const [couponMsg, setCouponMsg] = useState({ text: '', ok: false })
  const [name, setName] = useState(user?.name || '')
  const [address, setAddress] = useState(user?.address || '')

  // Auto-fill when user logs in mid-session
  useEffect(() => {
    if (user?.name && !name) setName(user.name)
    if (user?.address && !address) setAddress(user.address)
  }, [user])
  const [loading, setLoading] = useState(false)

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) { setCouponMsg({ text: 'Enter a coupon code', ok: false }); return }
    try {
      const snap = await getDocs(collection(db, 'coupons'))
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const c = all.find(x => x.code === code && x.active !== false)
      if (!c) { setCouponMsg({ text: '❌ Invalid or expired coupon', ok: false }); setAppliedCoupon(null); return }
      if (c.expiry && new Date(c.expiry) < new Date()) { setCouponMsg({ text: '❌ Coupon expired', ok: false }); setAppliedCoupon(null); return }
      if (c.minOrder && subtotal < c.minOrder) { setCouponMsg({ text: `⚠️ Min order ₹${c.minOrder} required`, ok: false }); setAppliedCoupon(null); return }
      setAppliedCoupon(c)
      const disc = c.type === 'percent' ? Math.floor(subtotal * c.value / 100) : c.value
      setCouponMsg({ text: `✅ Applied! You save ₹${disc}`, ok: true })
      showToast(`🎉 ${code} applied! -₹${disc}`)
    } catch { setCouponMsg({ text: '❌ Could not verify coupon', ok: false }) }
  }

  const handleOrder = async () => {
    if (!cartEntries.length) { showToast('⚠️ Cart is empty!'); return }
    if (!name.trim() || !address.trim()) { showToast('⚠️ Enter name & address!'); return }
    setLoading(true)
    await placeOrder(name.trim(), address.trim())
    setCouponCode(''); setCouponMsg({ text: '', ok: false })
    setLoading(false)
    showToast('✅ Order sent on WhatsApp!')
  }

  const advance = Math.ceil(total / 2)

  return (
    <>
      <div className={styles.hd}>
        <h2>🛒 Your Order</h2>
      </div>
      <div className={styles.body}>
        {cartEntries.length === 0 ? (
          <div className={styles.empty}>Your cart is empty 🍽️</div>
        ) : (
          cartEntries.map(v => {
            const id = v.id || v.name.replace(/[\s()&]/g, '_')
            return (
              <div key={id} className={styles.row}>
                <img src={v.img} alt={v.name} onError={e => e.target.src = FALLBACK} className={styles.rowImg} />
                <div className={styles.rowInfo}>
                  <div className={styles.rowName}>{v.name}</div>
                  <div className={styles.rowPrice}>₹{v.price} × {v.qty} = ₹{v.price * v.qty}</div>
                </div>
                <div className={styles.rowQty}>
                  <button onClick={() => removeFromCart(id)}>−</button>
                  <span>{v.qty}</span>
                  <button onClick={() => addToCart(v)}>+</button>
                </div>
              </div>
            )
          })
        )}
      </div>
      <div className={styles.ft}>
        <div className={styles.totalRow}><span>Subtotal</span><span>₹{subtotal}</span></div>
        {discount > 0 && (
          <div className={styles.discRow}>
            <span>Coupon ({appliedCoupon?.code})</span>
            <span>-₹{discount}</span>
          </div>
        )}
        <div className={styles.totalRow}><strong>Total</strong><strong>₹{total}</strong></div>
        {total > 0 && (
          <div className={styles.advRow}>💰 Advance: ₹{advance} | Balance: ₹{total - advance}</div>
        )}

        <div className={styles.couponRow}>
          <input
            className={styles.couponInput}
            value={couponCode}
            onChange={e => setCouponCode(e.target.value.toUpperCase())}
            placeholder="COUPON CODE"
          />
          <button className={styles.applyBtn} onClick={applyCoupon}>Apply</button>
        </div>
        {couponMsg.text && (
          <div className={`${styles.couponMsg} ${couponMsg.ok ? styles.ok : styles.err}`}>
            {couponMsg.text}
          </div>
        )}

        <input className="field" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name *" />
        <input className="field" value={address} onChange={e => setAddress(e.target.value)} placeholder="Delivery Address *" />

        <button className={styles.waBtn} onClick={handleOrder} disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.847L.057 23.882a.5.5 0 00.61.61l6.035-1.465A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.652-.495-5.187-1.362l-.372-.213-3.855.937.956-3.762-.234-.388A9.952 9.952 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          {loading ? 'Placing Order…' : 'Order on WhatsApp'}
        </button>
      </div>
    </>
  )
}
