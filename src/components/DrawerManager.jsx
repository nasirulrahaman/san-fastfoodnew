import { useApp } from '../context/AppContext'
import CartDrawer from './CartDrawer'
import ProfileDrawer from './ProfileDrawer'
import AdminDrawer from './AdminDrawer'

export default function DrawerManager() {
  const { activeDrawer, setActiveDrawer } = useApp()
  const isOpen = !!activeDrawer
  const close = () => setActiveDrawer(null)

  return (
    <>
      <div className={`overlay ${isOpen ? 'open' : ''}`} onClick={close} />

      {/* Cart */}
      <div className={`drawer ${activeDrawer === 'cart' ? 'open' : ''}`}>
        <div className="drawer-hd">
          <h2>🛒 Your Order</h2>
          <button className="drawer-close" onClick={close}>✕</button>
        </div>
        <CartDrawer />
      </div>

      {/* Profile */}
      <div className={`drawer ${activeDrawer === 'profile' ? 'open' : ''}`}>
        <div className="drawer-hd">
          <h2>👤 My Profile</h2>
          <button className="drawer-close" onClick={close}>✕</button>
        </div>
        <div className="drawer-body">
          <ProfileDrawer />
        </div>
      </div>

      {/* Admin */}
      <div className={`drawer ${activeDrawer === 'admin' ? 'open' : ''}`}>
        <div className="drawer-hd">
          <h2>⚙️ Admin Panel</h2>
          <button className="drawer-close" onClick={close}>✕</button>
        </div>
        <div className="drawer-body">
          <AdminDrawer />
        </div>
      </div>
    </>
  )
}
