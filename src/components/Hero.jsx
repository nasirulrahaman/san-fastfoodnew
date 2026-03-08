import { useApp } from '../context/AppContext'
import styles from './Hero.module.css'

export default function Hero() {
  const { offerBanner, setActiveDrawer } = useApp()

  return (
    <>
      {offerBanner && (
        <div className={styles.offerBanner}>
          <span className={styles.offerText}>🎉 {offerBanner.message}</span>
          {offerBanner.couponCode && (
            <span
              className={styles.offerCode}
              onClick={() => {
                navigator.clipboard?.writeText(offerBanner.couponCode)
                setActiveDrawer('cart')
              }}
              title="Click to copy & open cart"
            >
              {offerBanner.couponCode}
            </span>
          )}
        </div>
      )}

      <section className={styles.hero}>

        {/* Premium food image collage */}
        <div className={styles.imgCollage}>
          <div className={styles.imgCard + ' ' + styles.imgCard1}>
            <img src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=85" alt="Biryani" />
            <span className={styles.imgLabel}>Biryani</span>
          </div>
          <div className={styles.imgCard + ' ' + styles.imgCard2}>
            <img src="https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=85" alt="Chicken" />
            <span className={styles.imgLabel}>Chicken</span>
          </div>
          <div className={styles.imgCard + ' ' + styles.imgCard3}>
            <img src="https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&q=85" alt="Momos" />
            <span className={styles.imgLabel}>Momos</span>
          </div>
          <div className={styles.imgGlow} />
        </div>

        <h1 className={styles.title}>SAN <em>FAST</em>FOOD</h1>
        <p className={styles.sub}>Premium Taste • Fast Delivery</p>
        <p className={styles.hindi}>Swaad Aisa ki Ghar jaisa 🏠</p>
        <div className={styles.btns}>
          <a href="#menu" className="btn-primary">🍽️ Order Now</a>
          <a href="https://wa.me/918293062407" target="_blank" rel="noreferrer" className="btn-secondary">
            💬 WhatsApp Us
          </a>
        </div>
        <div className={styles.badges}>
          <span className={styles.badge}>⏰ Open 10 AM – 10 PM</span>
          <span className={styles.badge}>🚀 Fast Delivery</span>
          <span className={styles.badge}>💰 50% Advance</span>
        </div>
      </section>
    </>
  )
}
