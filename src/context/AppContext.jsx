import { createContext, useContext, useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [cart, setCart] = useState({})
  const [user, setUser] = useState(null)           // { name, phone, uid, points, address, isAdmin }
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [activeDrawer, setActiveDrawer] = useState(null) // 'cart' | 'profile' | 'admin'
  const [toast, setToast] = useState('')
  const [offerBanner, setOfferBanner] = useState(null)

  const ADMIN_PHONE = '7001728030'

  // Load user from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('san_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch {}
    }
    loadOfferBanner()
  }, [])

  const loadOfferBanner = async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'offer'))
      if (snap.exists()) {
        const d = snap.data()
        if (d.enabled && d.message) setOfferBanner(d)
      }
    } catch {}
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const login = async (name, phone) => {
    const uid = 'user_' + phone.replace(/\D/g, '')
    const isAdmin = phone.replace(/\D/g, '').endsWith(ADMIN_PHONE)
    // Save to Firestore
    try {
      const ref = doc(db, 'users', uid)
      const snap = await getDoc(ref)
      const existing = snap.exists() ? snap.data() : {}
      const userData = {
        name: name || existing.name || 'Customer',
        phone,
        points: existing.points || 0,
        address: existing.address || '',
        isAdmin,
        uid,
      }
      await setDoc(ref, { name: userData.name, phone, isAdmin, points: userData.points, address: userData.address }, { merge: true })
      setUser(userData)
      localStorage.setItem('san_user', JSON.stringify(userData))
      showToast('✅ Welcome, ' + userData.name + '!')
      return userData
    } catch (e) {
      // Firestore failed, still login locally
      const userData = { name, phone, uid, points: 0, address: '', isAdmin }
      setUser(userData)
      localStorage.setItem('san_user', JSON.stringify(userData))
      showToast('✅ Welcome, ' + name + '!')
      return userData
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('san_user')
    setActiveDrawer(null)
    showToast('👋 Logged out')
  }

  const updateProfile = async (name, address) => {
    if (!user) return
    try {
      await setDoc(doc(db, 'users', user.uid), { name, address }, { merge: true })
    } catch {}
    const updated = { ...user, name, address }
    setUser(updated)
    localStorage.setItem('san_user', JSON.stringify(updated))
    showToast('✅ Profile saved!')
  }

  const addToCart = (item) => {
    const id = item.name.replace(/[\s()&]/g, '_')
    setCart(prev => ({
      ...prev,
      [id]: prev[id]
        ? { ...prev[id], qty: prev[id].qty + 1 }
        : { ...item, id, qty: 1 }
    }))
    showToast('✅ ' + item.name.split('(')[0].trim() + ' added!')
  }

  const removeFromCart = (id) => {
    setCart(prev => {
      const updated = { ...prev }
      if (updated[id]) {
        if (updated[id].qty > 1) updated[id] = { ...updated[id], qty: updated[id].qty - 1 }
        else delete updated[id]
      }
      return updated
    })
  }

  const clearCart = () => setCart({})

  const cartEntries = Object.values(cart).filter(v => v.qty > 0)
  const cartCount = cartEntries.reduce((s, v) => s + v.qty, 0)
  const subtotal = cartEntries.reduce((s, v) => s + v.price * v.qty, 0)
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.floor(subtotal * appliedCoupon.value / 100)
      : Math.min(appliedCoupon.value, subtotal)
    : 0
  const total = Math.max(0, subtotal - discount)

  const placeOrder = async (name, address) => {
    if (!cartEntries.length) return null
    const now = new Date()
    const oid = `SAN-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*99999).toString().padStart(5,'0')}`
    const orderData = {
      orderId: oid,
      customerName: name,
      customerAddress: address,
      items: cart,
      subtotal,
      discount,
      total,
      coupon: appliedCoupon?.code || null,
      uid: user?.uid || 'guest',
      createdAt: serverTimestamp(),
    }
    try {
      await addDoc(collection(db, 'orders'), orderData)
      // Add loyalty points + auto-save name & address
      if (user) {
        const pts = Math.floor(total / 10)
        const ref = doc(db, 'users', user.uid)
        const snap = await getDoc(ref)
        const cur = snap.exists() ? (snap.data().points || 0) : 0
        await setDoc(ref, { points: cur + pts, name, address }, { merge: true })
        const updated = { ...user, points: cur + pts, name, address }
        setUser(updated)
        localStorage.setItem('san_user', JSON.stringify(updated))
      }
    } catch (e) { console.warn('Order save failed:', e) }

    // Build WhatsApp message
    let msg = `Hello SAN FASTFOOD 👋\n\nOrder ID: ${oid}\nTime: ${now.toLocaleString()}\n\nName: ${name}\nAddress: ${address}\n\nOrder:\n`
    cartEntries.forEach(v => { msg += `• ${v.name} × ${v.qty} = ₹${v.price * v.qty}\n` })
    if (discount > 0) msg += `\nCoupon (${appliedCoupon.code}): -₹${discount}`
    msg += `\n\nTotal: ₹${total}\n💰 50% advance: ₹${Math.ceil(total/2)}\n🚚 Balance at delivery`
    window.open(`https://wa.me/918293062407?text=${encodeURIComponent(msg)}`, '_blank')
    clearCart()
    setAppliedCoupon(null)
    return oid
  }

  return (
    <AppContext.Provider value={{
      cart, cartEntries, cartCount, subtotal, discount, total,
      addToCart, removeFromCart, clearCart,
      appliedCoupon, setAppliedCoupon,
      user, login, logout, updateProfile,
      activeDrawer, setActiveDrawer,
      toast, showToast,
      offerBanner, setOfferBanner, loadOfferBanner,
      placeOrder,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
