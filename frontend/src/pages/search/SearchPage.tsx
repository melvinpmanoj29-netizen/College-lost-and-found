import { useCallback, useEffect, useState } from 'react'
import { searchItems } from '../../services/searchService'
import { getErrorMessage } from '../../services/api'
import type { SearchFilterParams, SearchFoundItem, SearchLostItem } from '../../types/search'

import { getActiveCategoryNames, getActiveLocationNames, getCategoryIcon } from '../../constants/categories'

const STATUSES = ['All statuses', 'LOST', 'FOUND', 'RETURNED']

const COLORS = [
  'All colors',
  'Black',
  'Blue',
  'Red',
  'White',
  'Silver',
  'Green',
  'Brown',
  'Yellow',
  'Other',
]

function formatDate(isoString?: string): string {
  if (!isoString) return 'Date not specified'
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return isoString
  }
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('All categories')
  const [location, setLocation] = useState('All locations')
  const [status, setStatus] = useState('All statuses')
  const [color, setColor] = useState('All colors')
  const [date, setDate] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all')

  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all')
  const [lostItems, setLostItems] = useState<SearchLostItem[]>([])
  const [foundItems, setFoundItems] = useState<SearchFoundItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const executeSearch = useCallback(async () => {
    setLoading(true)
    setError(null)
    setHasSearched(true)

    const params: SearchFilterParams = {}
    if (searchTerm.trim()) params.q = searchTerm.trim()
    if (category !== 'All categories') params.category = category
    if (location !== 'All locations') params.location = location
    if (status !== 'All statuses') params.status = status
    if (color !== 'All colors') params.color = color
    if (date) params.date = date
    if (isUrgent) params.urgent = true
    if (typeFilter !== 'all') params.type = typeFilter

    try {
      const response = await searchItems(params)
      setLostItems(response.lostItems || [])
      setFoundItems(response.foundItems || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [searchTerm, category, location, status, color, date, isUrgent, typeFilter])

  // Run initial search on mount
  useEffect(() => {
    let isMounted = true
    searchItems({})
      .then((response) => {
        if (!isMounted) return
        setLostItems(response.lostItems || [])
        setFoundItems(response.foundItems || [])
        setHasSearched(true)
        setLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(getErrorMessage(err))
        setHasSearched(true)
        setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleResetFilters = () => {
    setSearchTerm('')
    setCategory('All categories')
    setLocation('All locations')
    setStatus('All statuses')
    setColor('All colors')
    setDate('')
    setIsUrgent(false)
    setTypeFilter('all')
  }

  const activeFiltersCount =
    (category !== 'All categories' ? 1 : 0) +
    (location !== 'All locations' ? 1 : 0) +
    (status !== 'All statuses' ? 1 : 0) +
    (color !== 'All colors' ? 1 : 0) +
    (date ? 1 : 0) +
    (isUrgent ? 1 : 0) +
    (typeFilter !== 'all' ? 1 : 0)

  const displayedLost = typeFilter === 'found' ? [] : lostItems
  const displayedFound = typeFilter === 'lost' ? [] : foundItems
  const totalResults = displayedLost.length + displayedFound.length

  return (
    <div className="search-page page-width">
      <div className="search-header">
        <span className="eyebrow">
          <i className="bi bi-search" /> CAMPUS SEARCH
        </span>
        <h1>Search Lost &amp; Found</h1>
        <p>Search across verified campus reports by item name, location, category, date, and color.</p>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          executeSearch()
        }}
      >
        <div className="search-bar-wrap">
          <i className="bi bi-search" style={{ color: '#94a3b8', fontSize: '18px' }} />
          <input
            type="text"
            placeholder="Search by keywords (e.g. 'blue wallet', 'keys', 'calculator')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search items"
          />
          {searchTerm && (
            <button
              type="button"
              className="icon-button"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <i className="bi bi-x-lg" />
            </button>
          )}
          <button type="submit" className="button primary small">
            Search
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="search-filters-bar">
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'lost' | 'found')}
            aria-label="Filter by report type"
          >
            <option value="all">All Report Types</option>
            <option value="lost">Lost items only</option>
            <option value="found">Found items only</option>
          </select>

          <select
            className="filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="All categories">All categories</option>
            {getActiveCategoryNames().map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Filter by location"
          >
            <option value="All locations">All locations</option>
            {getActiveLocationNames().map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Filter by color"
          >
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="filter-select"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Filter by date"
          />

          <label className="urgent-toggle-label">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
            />
            <i className="bi bi-exclamation-triangle-fill" style={{ color: '#d97706' }} />
            Urgent only
          </label>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              className="text-button"
              onClick={handleResetFilters}
              style={{ fontSize: '12px' }}
            >
              Reset filters ({activeFiltersCount})
            </button>
          )}
        </div>
      </form>

      {/* Active Filter Pills */}
      {activeFiltersCount > 0 && (
        <div className="search-active-pills">
          <span style={{ fontSize: '12px', color: '#64748b' }}>Active filters:</span>
          {category !== 'All categories' && (
            <span className="active-pill">
              Category: {category}{' '}
              <button onClick={() => setCategory('All categories')}>&times;</button>
            </span>
          )}
          {location !== 'All locations' && (
            <span className="active-pill">
              Location: {location}{' '}
              <button onClick={() => setLocation('All locations')}>&times;</button>
            </span>
          )}
          {status !== 'All statuses' && (
            <span className="active-pill">
              Status: {status} <button onClick={() => setStatus('All statuses')}>&times;</button>
            </span>
          )}
          {color !== 'All colors' && (
            <span className="active-pill">
              Color: {color} <button onClick={() => setColor('All colors')}>&times;</button>
            </span>
          )}
          {date && (
            <span className="active-pill">
              Date: {date} <button onClick={() => setDate('')}>&times;</button>
            </span>
          )}
          {isUrgent && (
            <span className="active-pill">
              Urgent <button onClick={() => setIsUrgent(false)}>&times;</button>
            </span>
          )}
          {typeFilter !== 'all' && (
            <span className="active-pill">
              Type: {typeFilter} <button onClick={() => setTypeFilter('all')}>&times;</button>
            </span>
          )}
        </div>
      )}

      {/* Results navigation tabs */}
      <div className="search-tabs">
        <button
          className={`search-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Items <span className="tab-count">{totalResults}</span>
        </button>
        <button
          className={`search-tab-btn ${activeTab === 'lost' ? 'active' : ''}`}
          onClick={() => setActiveTab('lost')}
        >
          Lost Items <span className="tab-count">{displayedLost.length}</span>
        </button>
        <button
          className={`search-tab-btn ${activeTab === 'found' ? 'active' : ''}`}
          onClick={() => setActiveTab('found')}
        >
          Found Items <span className="tab-count">{displayedFound.length}</span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="state-container">
          <div className="loader-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
          <div className="state-title" style={{ marginTop: '16px' }}>Searching campus records...</div>
          <div className="state-desc">Finding matching lost and found reports.</div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="state-container">
          <div className="state-icon error">
            <i className="bi bi-exclamation-circle" />
          </div>
          <div className="state-title">Unable to complete search</div>
          <div className="state-desc">{error}</div>
          <button className="button primary small" onClick={executeSearch}>
            <i className="bi bi-arrow-clockwise" /> Try Again
          </button>
        </div>
      )}

      {/* Empty results state */}
      {!loading && !error && hasSearched && totalResults === 0 && (
        <div className="state-container">
          <div className="state-icon">
            <i className="bi bi-search" />
          </div>
          <div className="state-title">No matching reports found</div>
          <div className="state-desc">
            We couldn't find any items matching your criteria. Try adjusting your search keywords,
            clearing specific filters, or checking back later.
          </div>
          {activeFiltersCount > 0 && (
            <button className="button secondary small" onClick={handleResetFilters}>
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Results display */}
      {!loading && !error && totalResults > 0 && (
        <div>
          {/* Lost items section */}
          {(activeTab === 'all' || activeTab === 'lost') && displayedLost.length > 0 && (
            <div style={{ marginBottom: '36px' }}>
              {activeTab === 'all' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span className="badge-lost">LOST ITEMS</span>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    ({displayedLost.length} reports)
                  </span>
                </div>
              )}
              <div className="search-results-grid">
                {displayedLost.map((item) => (
                  <article className="item-card-nourin" key={`lost-${item.id}`}>
                    <div className="item-card-cover">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.itemName} />
                      ) : (
                        <i className={`bi ${getCategoryIcon(item.category)} item-card-fallback-icon`} />
                      )}
                      <div className="item-card-badges">
                        <span className="badge-lost">LOST</span>
                        {item.isUrgent && <span className="badge-urgent">URGENT</span>}
                      </div>
                    </div>
                    <div className="item-card-content">
                      <h3>{item.itemName}</h3>
                      {item.description && <p className="item-desc">{item.description}</p>}
                      <div className="item-meta-list">
                        <div className="item-meta-row">
                          <i className="bi bi-tag" />
                          <span>{item.category || 'General'}</span>
                          {item.color && <span>&bull; {item.color}</span>}
                        </div>
                        <div className="item-meta-row">
                          <i className="bi bi-geo-alt" />
                          <span>Last seen: {item.lastSeenLocation || 'Campus'}</span>
                        </div>
                        {item.lostDateTime && (
                          <div className="item-meta-row">
                            <i className="bi bi-calendar3" />
                            <span>{formatDate(item.lostDateTime)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Found items section */}
          {(activeTab === 'all' || activeTab === 'found') && displayedFound.length > 0 && (
            <div>
              {activeTab === 'all' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span className="badge-found">FOUND ITEMS</span>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    ({displayedFound.length} reports)
                  </span>
                </div>
              )}
              <div className="search-results-grid">
                {displayedFound.map((item) => (
                  <article className="item-card-nourin" key={`found-${item.id}`}>
                    <div className="item-card-cover">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.itemName} />
                      ) : (
                        <i className={`bi ${getCategoryIcon(item.category)} item-card-fallback-icon`} />
                      )}
                      <div className="item-card-badges">
                        <span className="badge-found">FOUND</span>
                        {item.isUrgent && <span className="badge-urgent">URGENT</span>}
                      </div>
                    </div>
                    <div className="item-card-content">
                      <h3>{item.itemName}</h3>
                      {item.description && <p className="item-desc">{item.description}</p>}
                      <div className="item-meta-list">
                        <div className="item-meta-row">
                          <i className="bi bi-tag" />
                          <span>{item.category || 'General'}</span>
                          {item.color && <span>&bull; {item.color}</span>}
                        </div>
                        <div className="item-meta-row">
                          <i className="bi bi-geo-alt" />
                          <span>Found at: {item.foundLocation || 'Campus'}</span>
                        </div>
                        {item.foundDateTime && (
                          <div className="item-meta-row">
                            <i className="bi bi-calendar3" />
                            <span>{formatDate(item.foundDateTime)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
