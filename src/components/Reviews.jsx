import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { db } from '../firebase'
import {
  collection, addDoc, getDocs,
  orderBy, query, limit, serverTimestamp
} from 'firebase/firestore'
import styles from './Reviews.module.css'

const STARS = [1, 2, 3, 4, 5]

export default function Reviews() {
  const { user, showToast } = useApp()
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showLoginHint, setShowLoginHint] = useState(false)

  useEffect(() => { loadReviews() }, [])

  const loadReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(20))
      const snap = await getDocs(q)
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setReviews([]) }
  }

  const handleWriteReview = () => {
    if (!user) { setShowLoginHint(true); return }
    setShowLoginHint(false)
    setShowForm(true)
  }

  const submitReview = async () => {
    if (!rating) { showToast('⚠️ Please select a rating!'); return }
    if (!comment.trim()) { showToast('⚠️ Please write something!'); return }
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'reviews'), {
        name: user.name || 'Customer',
        phone: user.phone,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      })
      showToast('✅ Review submitted! Thank you 🙏')
      setRating(0); setComment(''); setShowForm(false)
      loadReviews()
    } catch { showToast('❌ Failed to submit') }
    setSubmitting(false)
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const ratingCounts = [5,4,3,2,1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
    pct: reviews.length ? Math.round(reviews.filter(r => r.rating === s).length / reviews.length * 100) : 0
  }))

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>What Our Customers Say</h2>
        <p className={styles.sub}>Real reviews from real foodies 🍽️</p>

        {/* Summary */}
        {reviews.length > 0 && (
          <div className={styles.summary}>
            <div className={styles.avgBox}>
              <div className={styles.avgNum}>{avgRating}</div>
              <div className={styles.avgStars}>
                {STARS.map(s => (
                  <span key={s} className={s <= Math.round(avgRating) ? styles.starFilled : styles.starEmpty}>★</span>
                ))}
              </div>
              <div className={styles.avgCount}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
            </div>
            <div className={styles.barChart}>
              {ratingCounts.map(r => (
                <div key={r.star} className={styles.barRow}>
                  <span className={styles.barLabel}>{r.star}★</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: r.pct + '%' }} />
                  </div>
                  <span className={styles.barCount}>{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Write review button */}
        {!showForm && (
          <div className={styles.writeWrap}>
            <button className={styles.writeBtn} onClick={handleWriteReview}>
              ✍️ Write a Review
            </button>
            {showLoginHint && (
              <p className={styles.loginHint}>⚠️ Please login first to write a review!</p>
            )}
          </div>
        )}

        {/* Review form */}
        {showForm && (
          <div className={styles.form}>
            <h3 className={styles.formTitle}>Your Review</h3>
            <div className={styles.starPicker}>
              {STARS.map(s => (
                <button
                  key={s}
                  className={`${styles.starBtn} ${s <= (hovered || rating) ? styles.starActive : ''}`}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(s)}
                >★</button>
              ))}
              <span className={styles.ratingLabel}>
                {(hovered || rating) === 1 && 'Poor 😞'}
                {(hovered || rating) === 2 && 'Fair 😐'}
                {(hovered || rating) === 3 && 'Good 🙂'}
                {(hovered || rating) === 4 && 'Very Good 😊'}
                {(hovered || rating) === 5 && 'Excellent! 🤩'}
              </span>
            </div>
            <textarea
              className={styles.textarea}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us about your experience... What did you order? How was the taste? 😋"
              rows={4}
            />
            <div className={styles.formBtns}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.submitBtn} onClick={submitReview} disabled={submitting}>
                {submitting ? 'Submitting…' : '📤 Submit Review'}
              </button>
            </div>
          </div>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🌟</div>
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {reviews.map((r, i) => (
              <div key={r.id} className={styles.card} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>{r.name?.[0]?.toUpperCase() || '👤'}</div>
                  <div>
                    <div className={styles.reviewer}>{r.name}</div>
                    <div className={styles.cardStars}>
                      {STARS.map(s => (
                        <span key={s} className={s <= r.rating ? styles.starFilled : styles.starEmpty}>★</span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.cardDate}>
                    {r.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) || ''}
                  </div>
                </div>
                <p className={styles.comment}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
