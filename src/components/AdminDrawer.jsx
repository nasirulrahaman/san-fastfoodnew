import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { db } from '../firebase'
import {
  collection, getDocs, addDoc, deleteDoc,
  doc, setDoc, getDoc, serverTimestamp
} from 'firebase/firestore'
import styles from './AdminDrawer.module.css'

export default function AdminDrawer() {
  const { showToast, setOfferBanner } = useApp()
  const [coupons, setCoupons] = useState([])
  const [offerEnabled, setOfferEnabled] = useState(false)
  const [offerMsg, setOfferMsg] = useState('')
  const [offerCode, setOfferCode] = useState('')

  // New coupon form
  const [code, setCode] = useState('')
  const [type, setType] = useState('percent')
  const [value, setValue] = useState('')
  const [minOrder, setMinOrder] = useState('')
  const [expiry, setExpiry] = useState('')

  useEffect(() => {
    loadCoupons()
    loadOffer()
  }, [])

  const loadCoupons = async () => {
    try {
      const snap = await getDocs(collection(db, 'coupons'))
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setCoupons([]) }
  }

  const loadOffer = async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'offer'))
      if (snap.exists()) {
        const d = snap.data()
        setOfferEnabled(!!d.enabled)
        setOfferMsg(d.message || '')
        setOfferCode(d.couponCode || '')
      }
    } catch {}
  }

  const saveOffer = async (enabled = offerEnabled, msg = offerMsg, cCode = offerCode) => {
    try {
      await setDoc(doc(db, 'settings', 'offer'), { enabled, message: msg, couponCode: cCode })
      if (enabled && msg) setOfferBanner({ enabled, message: msg, couponCode: cCode })
      else setOfferBanner(null)
      showToast('✅ Offer saved!')
    } catch { showToast('❌ Save failed') }
  }

  const addCoupon = async () => {
    if (!code.trim() || !value) { showToast('⚠️ Fill code and value'); return }
    try {
      await addDoc(collection(db, 'coupons'), {
        code: code.trim().toUpperCase(),
        type, value: parseFloat(value),
        minOrder: parseFloat(minOrder) || 0,
        expiry: expiry || null,
        active: true,
        createdAt: serverTimestamp(),
      })
      showToast('✅ Coupon added!')
      setCode(''); setValue(''); setMinOrder(''); setExpiry('')
      loadCoupons()
    } catch (e) { showToast('❌ ' + e.message) }
  }

  const deleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return
    await deleteDoc(doc(db, 'coupons', id))
    showToast('🗑️ Deleted')
    loadCoupons()
  }

  return (
    <>
      {/* Offer Banner */}
      <div className={styles.card}>
        <h3>🎉 Offer Banner</h3>
        <div className={styles.toggleRow}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={offerEnabled}
              onChange={e => { setOfferEnabled(e.target.checked); saveOffer(e.target.checked, offerMsg, offerCode) }}
            />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>Show banner on site</span>
        </div>
        <input className={styles.input} value={offerMsg} onChange={e => setOfferMsg(e.target.value)} placeholder="Offer message e.g. 20% OFF today!" />
        <input className={styles.input} value={offerCode} onChange={e => setOfferCode(e.target.value.toUpperCase())} placeholder="Coupon code to display (optional)" />
        <button className={styles.btn} onClick={() => saveOffer()}>💾 Save Offer</button>
      </div>

      {/* Add Coupon */}
      <div className={styles.card}>
        <h3>🏷️ Add New Coupon</h3>
        <input className={styles.input} value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Code e.g. SAN20" />
        <div className={styles.row2}>
          <select className={styles.input} value={type} onChange={e => setType(e.target.value)}>
            <option value="percent">Percentage %</option>
            <option value="flat">Flat ₹</option>
          </select>
          <input className={styles.input} type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="Value e.g. 20" />
        </div>
        <input className={styles.input} type="number" value={minOrder} onChange={e => setMinOrder(e.target.value)} placeholder="Min order ₹ (optional)" />
        <input className={styles.input} type="date" value={expiry} onChange={e => setExpiry(e.target.value)} />
        <button className={styles.btn} onClick={addCoupon}>➕ Add Coupon</button>
      </div>

      {/* Coupon List */}
      <div className={styles.card}>
        <h3>📋 Active Coupons</h3>
        {coupons.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '.88rem' }}>No coupons yet.</p>
        ) : (
          coupons.map(c => (
            <div key={c.id} className={styles.couponItem}>
              <div>
                <span className={styles.couponTag}>{c.code}</span>
                <div className={styles.couponInfo}>
                  {c.type === 'percent' ? `${c.value}% off` : `₹${c.value} off`}
                  {c.minOrder ? ` • Min ₹${c.minOrder}` : ''}
                  {c.expiry ? ` • Exp: ${c.expiry}` : ''}
                </div>
              </div>
              <button className={styles.deleteBtn} onClick={() => deleteCoupon(c.id)}>🗑️</button>
            </div>
          ))
        )}
      </div>
    </>
  )
}
