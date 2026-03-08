import styles from './Footer.module.css'

export default function Footer() {
  return (
    <>
      <section className={styles.infoSec}>
        <div className={styles.inner}>
          <h2 className={styles.title}>Find Us & Order</h2>
          <div className={styles.grid}>
            <div className={styles.card}><div className={styles.ico}>📍</div><h3>Location</h3><p>Dakshin Baguan, Chanserpur<br />Tatultala Mor, Ganna Para</p></div>
            <div className={styles.card}><div className={styles.ico}>📞</div><h3>Call Us</h3><p>7001728030<br />8293062407</p></div>
            <div className={styles.card}><div className={styles.ico}>⏰</div><h3>Hours</h3><p>Monday – Sunday<br />10:00 AM – 10:00 PM</p></div>
            <div className={styles.card}><div className={styles.ico}>💳</div><h3>Payment</h3><p>50% advance required<br />Balance at delivery</p></div>
          </div>
        </div>
      </section>
      <footer className={styles.footer}>
        <strong>SAN FASTFOOD</strong><br />
        📍 Dakshin Baguan, Chanserpur, Tatultala Mor, Ganna Para<br />
        📞 7001728030 | 8293062407<br />
        <small>© 2025 SAN Fastfood. All rights reserved.</small>
      </footer>
    </>
  )
}
