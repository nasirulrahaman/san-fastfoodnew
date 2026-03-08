import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { db } from '../firebase'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import styles from './ProfileDrawer.module.css'

export default function ProfileDrawer() {
  const { user, logout, updateProfile, setActiveDrawer } = useApp()
  const [name, setName] = useState(user?.name || '')
  const [address, setAddress] = useState(user?.address || '')
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!user) return
    setName(user.name || '')
    setAddress(user.address || '')
    loadOrders()
  }, [user])

  const loadOrders = async () => {
    setLoadingOrders(true)
    try {
      const q = query(
        collection(db, 'orders'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      )
      const snap = await getDocs(q)
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setOrders([]) }
    setLoadingOrders(false)
  }

  const handleSave = async () => {
    await updateProfile(name, address)
  }

  if (!user) return null

  return (
    <>
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>{user.name?.[0]?.toUpperCase() || '👤'}</div>
        <div>
          <div className={styles.uName}>{user.name}</div>
          <div className={styles.uPhone}>{user.phone}</div>
          {user.isAdmin && <span className={styles.adminTag}>ADMIN</span>}
        </div>
      </div>

      <div className={styles.pointsCard}>
        <div>
          <div className={styles.pointsLabel}>LOYALTY POINTS</div>
          <div className={styles.pointsVal}>{user.points || 0} 🌟</div>
          <div className={styles.pointsSub}>Earn 1 point per ₹10 spent</div>
        </div>
        <span style={{ fontSize: '2.5rem' }}>🎁</span>
      </div>

      <div className={styles.sectionLabel}>Edit Profile</div>
      <input className="field" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" />
      <input className="field" value={address} onChange={e => setAddress(e.target.value)} placeholder="Default Address" />
      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }} onClick={handleSave}>
        Save Profile
      </button>

      {user.isAdmin && (
        <button
          className={styles.adminBtn}
          onClick={() => setActiveDrawer('admin')}
        >
          ⚙️ Open Admin Panel
        </button>
      )}

      <div className={styles.sectionLabel}>Order History</div>
      {loadingOrders ? (
        <p style={{ color: 'var(--muted)', fontSize: '.88rem' }}>Loading orders…</p>
      ) : orders.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: '.88rem' }}>No orders yet.</p>
      ) : (
        orders.map(o => {
          const items = Object.values(o.items || {}).map(i => `${i.name} ×${i.qty}`).join(', ')
          const date = o.createdAt?.toDate?.()?.toLocaleDateString('en-IN') || ''
          return (
            <div key={o.id} className={styles.orderCard}>
              <div className={styles.orderTop}>
                <span className={styles.orderId}>{o.orderId || o.id}</span>
                <span className={styles.orderAmt}>₹{o.total}</span>
              </div>
              <div className={styles.orderItems}>{items}</div>
              {date && <div className={styles.orderDate}>{date}</div>}
            </div>
          )
        })
      )}

      <button className={styles.logoutBtn} onClick={logout}>Logout</button>
    </>
  )
}
