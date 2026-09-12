import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllLostItems } from '../../services/lostItemService'
import { getErrorMessage } from '../../services/api'
import type { LostItem } from '../../types/lostItem'
import LostItemCard from '../../components/lost-items/LostItemCard'

export default function LostItemsListPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<LostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [urgentOnly, setUrgentOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST'>('NEWEST')

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllLostItems()
      setItems(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      await fetchItems()
    }
    load()
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.category) set.add(item.category)
    })
    return Array.from(set).sort()
  }, [items])

  const filteredItems = useMemo(() => {
    const result = items.filter((item) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        item.itemName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.lastSeenLocation.toLowerCase().includes(q)

      const matchesCategory =
        selectedCategory === 'ALL' || item.category.toLowerCase() === selectedCategory.toLowerCase()

      const matchesUrgent = !urgentOnly || item.isUrgent

      return matchesQuery && matchesCategory && matchesUrgent
    })

    result.sort((a, b) => {
      const timeA = new Date(a.lostDateTime).getTime()
      const timeB = new Date(b.lostDateTime).getTime()
      return sortBy === 'NEWEST' ? timeB - timeA : timeA - timeB
    })

    return result
  }, [items, searchQuery, selectedCategory, urgentOnly, sortBy])

  return (
    <section className="directory page-width">
      <div className="directory-head">
        <div>
          <span className="section-kicker">CAMPUS LOST &amp; FOUND</span>
          <h1>Lost items</h1>
          <p>Browse reported lost items from across campus. Found something? Help reunite it.</p>
        </div>
        <div className="directory-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => navigate('/my-lost')}
          >
            <i className="bi bi-person-lines-fill" /> My reports
          </button>
          <button
            type="button"
            className="button primary"
            onClick={() => navigate('/report')}
          >
            <i className="bi bi-plus-lg" /> Report lost item
          </button>
        </div>
      </div>

      <div className="search-toolbar">
        <div className="search-input">
          <i className="bi bi-search" />
          <input
            type="text"
            placeholder="Search by name, location, or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <i className="bi bi-x-circle-fill" />
            </button>
          )}
        </div>

        <select
          aria-label="Filter by category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ALL">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort items"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'NEWEST' | 'OLDEST')}
        >
          <option value="NEWEST">Most recent</option>
          <option value="OLDEST">Oldest first</option>
        </select>

        <label className="urgent-toggle-label">
          <input
            type="checkbox"
            checked={urgentOnly}
            onChange={(e) => setUrgentOnly(e.target.checked)}
          />
          <span className="urgent-toggle-text">
            <i className="bi bi-lightning-charge-fill text-warning" /> Urgent only
          </span>
        </label>
      </div>

      <div className="results-line">
        <span>
          Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> reports
        </span>
        {(searchQuery || selectedCategory !== 'ALL' || urgentOnly) && (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('ALL')
              setUrgentOnly(false)
            }}
          >
            Reset filters
          </button>
        )}
      </div>

      {loading && (
        <div className="state-container">
          <span className="loader-spinner" />
          <p>Loading lost items…</p>
        </div>
      )}

      {!loading && error && (
        <div className="state-container error">
          <i className="bi bi-exclamation-triangle state-icon text-danger" />
          <h2>Unable to load items</h2>
          <p>{error}</p>
          <button type="button" className="button primary small" onClick={fetchItems}>
            <i className="bi bi-arrow-clockwise" /> Try again
          </button>
        </div>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <div className="state-container empty">
          <div className="empty-icon-wrap">
            <i className="bi bi-search" />
          </div>
          <h2>No lost items found</h2>
          <p>
            {items.length === 0
              ? 'There are currently no active lost items reported on campus.'
              : 'No items match your active filters. Try clearing search criteria.'}
          </p>
          <button
            type="button"
            className="button primary"
            onClick={() => navigate('/report')}
          >
            <i className="bi bi-plus-lg" /> Report a lost item
          </button>
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="item-grid directory-grid">
          {filteredItems.map((item) => (
            <LostItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}
