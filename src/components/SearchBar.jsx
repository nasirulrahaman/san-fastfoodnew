import { useState, useEffect, useRef } from 'react'
import { menuData } from '../data/menuData'
import { useApp } from '../context/AppContext'
import styles from './SearchBar.module.css'

export default function SearchBar() {
  const { addToCart, user } = useApp()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handleClick = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.toLowerCase()
    const all = menuData.flatMap(cat => cat.items.map(item => ({ ...item, category: cat.category })))
    setResults(all.filter(item => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)).slice(0, 8))
  }, [query])

  const FALLBACK = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&q=60'

  return (
    <div className={styles.wrap} ref={ref}>
      <div className={styles.bar}>
        <span className={styles.icon}>🔍</span>
        <input
          className={styles.input}
          placeholder="Search biryani, momos, chicken…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
        />
        {query && <button className={styles.clear} onClick={() => { setQuery(''); setResults([]) }}>✕</button>}
      </div>

      {open && results.length > 0 && (
        <div className={styles.dropdown}>
          {results.map((item, i) => {
            const id = item.name.replace(/[\s()&]/g, '_')
            return (
              <div key={i} className={styles.result}>
                <img
                  src={item.img}
                  alt={item.name}
                  className={styles.thumb}
                  onError={e => { e.target.src = FALLBACK }}
                />
                <div className={styles.info}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.cat}>{item.category}</span>
                </div>
                <span className={styles.price}>₹{item.price}</span>
                <button
                  className={styles.addBtn}
                  onClick={() => { addToCart(item); setQuery(''); setOpen(false) }}
                >+</button>
              </div>
            )
          })}
        </div>
      )}

      {open && query && results.length === 0 && (
        <div className={styles.dropdown}>
          <div className={styles.noResult}>😕 No items found for "{query}"</div>
        </div>
      )}
    </div>
  )
}
