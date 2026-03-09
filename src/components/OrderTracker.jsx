import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { db } from '../firebase'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import styles from './OrderTracker.module.css'

const STEPS = ['pending', 'preparing', 'delivered']
const LABELS = { pending: '⏳ Order Received', preparing: '👨‍🍳 Preparing', delivered: '✅ Delivered!' }
const ICONS = { pending: '📋', preparing: '🍳', delivered: '🎉' }

export default function OrderTracker({ onClose }) {
  const { user } = useApp()
  const [orders, setOrders] = useState([])
  const isAdmin = user?.isAdmin

  useEffect(() => {
    if (!user) return
    let q
    if (isAdmin) {
      q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    } else {
      q = query(collection(db, 'orders'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'))
    }
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [user])

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, 'orders', id), { status })
  }

  const nextStatus = (current) => {
    const idx = STEPS.indexOf(current || 'pending')
    return idx < STEPS.length - 1 ? STEPS[idx + 1] : null
  }

  const formatDate = (ts) => {
    if (!ts?.toDate) return ''
    return ts.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${styles.tracker}`}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{isAdmin ? '📦 All Orders' : '📦 My Orders'}</h2>

        {orders.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🛒</div>
            <p>No orders yet!</p>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map(order => {
              const status = order.status || 'pending'
              const stepIdx = STEPS.indexOf(status)
              return (
                <div key={order.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div>
                      <span className={styles.orderId}>{order.orderId}</span>
                      <span className={styles.date}>{formatDate(order.createdAt)}</span>
                    </div>
                    <span className={`${styles.badge} ${styles[status]}`}>{LABELS[status]}</span>
                  </div>

                  {/* Progress bar */}
                  <div className={styles.progress}>
                    {STEPS.map((s, i) => (
                      <div key={s} className={styles.progressStep}>
                        <div className={`${styles.progressDot} ${i <= stepIdx ? styles.progressDotActive : ''}`}>
                          {ICONS[s]}
                        </div>
                        <span className={`${styles.progressLabel} ${i <= stepIdx ? styles.progressLabelActive : ''}`}>
                          {s === 'pending' ? 'Received' : s === 'preparing' ? 'Preparing' : 'Delivered'}
                        </span>
                        {i < STEPS.length - 1 && (
                          <div className={`${styles.progressLine} ${i < stepIdx ? styles.progressLineActive : ''}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Order items */}
                  <div className={styles.items}>
                    {isAdmin && <div className={styles.customer}>👤 {order.customerName} • 📍 {order.customerAddress}</div>}
                    {Object.values(order.items || {}).map(item => (
                      <div key={item.name} className={styles.item}>
                        <span>{item.name} × {item.qty}</span>
                        <span>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                    <div className={styles.total}>Total: ₹{order.total}</div>
                  </div>

                  {/* Admin controls */}
                  {isAdmin && nextStatus(status) && (
                    <button
                      className={styles.updateBtn}
                      onClick={() => updateStatus(order.id, nextStatus(status))}
                    >
                      Mark as {nextStatus(status) === 'preparing' ? '👨‍🍳 Preparing' : '✅ Delivered'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
