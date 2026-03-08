import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { categories, menuData } from '../data/menuData'
import MenuItem from './MenuItem'
import styles from './MenuSection.module.css'

export default function MenuSection() {
  const [activeCat, setActiveCat] = useState('rice')
  const [search, setSearch] = useState('')

  const items = useMemo(() => {
    if (search.trim()) {
      const term = search.toLowerCase()
      return Object.values(menuData).flat().filter(i => i.name.toLowerCase().includes(term))
    }
    return menuData[activeCat] || []
  }, [activeCat, search])

  return (
    <section className={styles.section} id="menu">
      {/* Search */}
      <div className={styles.searchWrap}>
        <div className={styles.searchBox}>
          <span>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search biryani, momo, chicken…"
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* Category heading */}
      <div className={styles.heading}>
        <h2 className={styles.title}>What are you craving?</h2>
        <p className={styles.sub}>Fresh, hot & made with love — every single order</p>
      </div>

      {/* Categories */}
      {!search && (
        <div className={styles.catGrid}>
          {categories.map(c => (
            <button
              key={c.key}
              className={`${styles.catBtn} ${activeCat === c.key ? styles.active : ''}`}
              onClick={() => setActiveCat(c.key)}
            >
              <span className={styles.catEm}>{c.em}</span>
              <span className={styles.catLbl}>{c.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Menu grid */}
      <div className={styles.menuGrid}>
        {items.length === 0 ? (
          <p className={styles.noResults}>No items found. Try another search.</p>
        ) : (
          items.map((item, i) => (
            <MenuItem key={item.name} item={item} index={i} />
          ))
        )}
      </div>
    </section>
  )
}
