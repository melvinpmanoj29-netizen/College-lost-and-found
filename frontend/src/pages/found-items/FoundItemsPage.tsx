import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import foundItemService from '../../services/foundItemService'
import { getErrorMessage } from '../../services/api'
import type { FoundItem } from '../../types/foundItem'
import FoundItemCard from '../../components/found-items/FoundItemCard'

export default function FoundItemsPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all')
  const [items, setItems] = useState<FoundItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')

  useEffect(() => {
    let cancelled = false

    async function loadItems() {
      setLoading(true)
      setError(null)
      try {
        const data =
          activeTab === 'my'
            ? await foundItemService.getMy()
            : await foundItemService.getAll()
        if (!cancelled) {
          setItems(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadItems()

    return () => {
      cancelled = true
    }
  }, [activeTab])

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.category) set.add(item.category)
    })
    return Array.from(set).sort()
  }, [items])

  // Filter items based on user inputs
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.foundLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.color && item.color.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory

      const matchesStatus =
        selectedStatus === 'ALL' || item.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [items, searchQuery, selectedCategory, selectedStatus])

  function handleRetry() {
    setLoading(true)
    setError(null)
    const fetcher =
      activeTab === 'my' ? foundItemService.getMy() : foundItemService.getAll()
    fetcher
      .then((data) => setItems(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  return (
    <section className="fmc-page page-width">
      <div className="fmc-header">
        <div>
          <span className="section-kicker">CAMPUS DIRECTORY</span>
          <h1>Found Items</h1>
          <p>
            Browse belongings found across campus. If you recognize something that belongs to you,
            submit a verification claim to reconnect with your item.
          </p>
        </div>
        <div className="fmc-header-actions">
          <button
            type="button"
            className="button primary"
            onClick={() => navigate('/found/new')}
          >
            <i className="bi bi-plus-lg" /> Report Found Item
          </button>
        </div>
      </div>

      {/* Tabs: All items vs My items */}
      {isAuthenticated && (
        <div className="fmc-tabs" role="tablist" aria-label="Found items view selector">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`fmc-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <i className="bi bi-grid" /> All Found Items
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'my'}
            className={`fmc-tab ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            <i className="bi bi-person" /> My Found Reports
            {activeTab === 'my' && !loading && (
              <span className="badge-count">{items.length}</span>
            )}
          </button>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="fmc-toolbar">
        <div className="fmc-search-box">
          <i className="bi bi-search" />
          <input
            type="text"
            placeholder="Search by title, location, description, or color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="fmc-select"
          aria-label="Filter by category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          className="fmc-select"
          aria-label="Filter by status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="FOUND">Found (Awaiting Claim)</option>
          <option value="RETURNED">Returned</option>
        </select>

        {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
          <button
            type="button"
            className="button secondary small"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('ALL')
              setSelectedStatus('ALL')
            }}
          >
            <i className="bi bi-x-lg" /> Reset
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="full-page-loader" style={{ minHeight: '320px' }}>
          <div className="loader-box">
            <span className="loader-spinner" aria-hidden="true" />
            <span>Loading found items...</span>
          </div>
        </div>
      )}

      {/* Error state with retry */}
      {!loading && error && (
        <div className="alert-banner" role="alert" style={{ marginBottom: '24px' }}>
          <i className="bi bi-exclamation-octagon" />
          <div className="flex-grow-1">
            <strong>Unable to load found items</strong>
            <p className="mb-2">{error}</p>
            <button
              type="button"
              className="button secondary small"
              onClick={handleRetry}
            >
              <i className="bi bi-arrow-clockwise" /> Try again
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="fmc-empty-state">
          <div className="fmc-empty-icon">
            <i className="bi bi-box-seam" />
          </div>
          <h3>No found items found</h3>
          <p>
            {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
              ? 'Try adjusting your filters or search terms to locate reports.'
              : activeTab === 'my'
              ? "You haven't reported any found items yet. If you picked up an item on campus, report it to help find the owner!"
              : 'There are currently no active found items recorded in the system.'}
          </p>
          <button
            type="button"
            className="button primary"
            onClick={() => navigate('/found/new')}
          >
            <i className="bi bi-plus-lg" /> Report an Item Now
          </button>
        </div>
      )}

      {/* Grid of cards */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="fmc-card-grid">
          {filteredItems.map((item) => (
            <FoundItemCard
              key={item.id}
              item={item}
              isOwner={user?.id === item.userId}
            />
          ))}
        </div>
      )}
    </section>
  )
}
