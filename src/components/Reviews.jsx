import { useState, useEffect, useRef } from 'react'
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
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showLoginHint, setShowLoginHint] = useState(false)
  const fileRef = useRef()

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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('⚠️ Photo must be under 5MB'); return }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const uploadPhoto = async (file) => {
    // Convert to base64 and store directly in Firestore (works without any API key)
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }

  const submitReview = async () => {
    if (!rating) { showToast('⚠️ Please select a rating!'); return }
    if (!comment.trim()) { showToast('⚠️ Please write something!'); return }
    setSubmitting(true)
    let photoUrl = null
    if (photo) {
      setUploading(true)
      try { photoUrl = await uploadPhoto(photo) } catch {}
      setUploading(false)
    }
    try {
      await addDoc(collection(db, 'reviews'), {
        name: user.name || 'Customer',
        phone: user.phone,
        rating,
        comment: comment.trim(),
        photoUrl,
        createdAt: serverTimestamp(),
      })
      showToast('✅ Review submitted! Thank you 🙏')
      setRating(0); setComment(''); setPhoto(null); setPhotoPreview(null); setShowForm(false)
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

        {!showForm && (
          <div className={styles.writeWrap}>
            <button className={styles.writeBtn} onClick={handleWriteReview}>✍️ Write a Review</button>
            {showLoginHint && <p className={styles.loginHint}>⚠️ Please login first to write a review!</p>}
          </div>
        )}

        {showForm && (
          <div className={styles.form}>
            <h3 className={styles.formTitle}>Your Review</h3>
            <div className={styles.starPicker}>
              {STARS.map(s => (
                <button key={s}
                  className={`${styles.starBtn} ${s <= (hovered || rating) ? styles.starActive : ''}`}
                  onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(s)}>★</button>
              ))}
              <span className={styles.ratingLabel}>
                {(hovered || rating) === 1 && 'Poor 😞'}
                {(hovered || rating) === 2 && 'Fair 😐'}
                {(hovered || rating) === 3 && 'Good 🙂'}
                {(hovered || rating) === 4 && 'Very Good 😊'}
                {(hovered || rating) === 5 && 'Excellent! 🤩'}
              </span>
            </div>
            <textarea className={styles.textarea} value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Tell us about your experience... What did you order? How was the taste? 😋" rows={4} />

            {/* Photo upload */}
            <div className={styles.photoWrap}>
              {photoPreview ? (
                <div className={styles.previewWrap}>
                  <img src={photoPreview} className={styles.preview} alt="preview" />
                  <button className={styles.removePhoto} onClick={() => { setPhoto(null); setPhotoPreview(null) }}>✕ Remove</button>
                </div>
              ) : (
                <button className={styles.uploadBtn} onClick={() => fileRef.current.click()}>
                  📸 Add Food Photo (optional)
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>

            <div className={styles.formBtns}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.submitBtn} onClick={submitReview} disabled={submitting || uploading}>
                {uploading ? 'Uploading photo…' : submitting ? 'Submitting…' : '📤 Submit Review'}
              </button>
            </div>
          </div>
        )}

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
                {r.photoUrl && (
                  <img src={r.photoUrl} alt="food" className={styles.reviewPhoto} onClick={() => window.open(r.photoUrl, '_blank')} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
