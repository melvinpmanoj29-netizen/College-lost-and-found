import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteLostItem, getMyLostItems } from '../../services/lostItemService'
import { getErrorMessage } from '../../services/api'
import type { LostItem } from '../../types/lostItem'
import LostItemCard from '../../components/lost-items/LostItemCard'
import DeleteConfirmModal from '../../components/lost-items/DeleteConfirmModal'

export default function MyLostItemsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<LostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Delete state
  const [itemToDelete, setItemToDelete] = useState<LostItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchMyItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyLostItems()
      setItems(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      await fetchMyItems()
    }
    load()
  }, [])

  function handleDeleteClick(id: number) {
    const found = items.find((i) => i.id === id)
    if (found) {
      setItemToDelete(found)
    }
  }

  async function handleDeleteConfirm() {
    if (!itemToDelete) return
    setDeleting(true)
    setActionError(null)
    try {
      await deleteLostItem(itemToDelete.id)
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id))
      setItemToDelete(null)
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="directory page-width">
      <div className="directory-head">
        <div>
          <span className="section-kicker">PERSONAL DASHBOARD</span>
          <h1>My lost reports</h1>
          <p>Manage reports for items you have reported missing on campus.</p>
        </div>
        <div className="directory-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => navigate('/lost')}
          >
            <i className="bi bi-grid" /> All lost items
          </button>
          <button
            type="button"
            className="button primary"
            onClick={() => navigate('/report')}
          >
            <i className="bi bi-plus-lg" /> Report new item
          </button>
        </div>
      </div>

      {actionError && (
        <div className="alert-banner" role="alert">
          <i className="bi bi-exclamation-circle" />
          <span>{actionError}</span>
        </div>
      )}

      {loading && (
        <div className="state-container">
          <span className="loader-spinner" />
          <p>Loading your reports…</p>
        </div>
      )}

      {!loading && error && (
        <div className="state-container error">
          <i className="bi bi-exclamation-triangle state-icon text-danger" />
          <h2>Could not load your reports</h2>
          <p>{error}</p>
          <button type="button" className="button primary small" onClick={fetchMyItems}>
            <i className="bi bi-arrow-clockwise" /> Retry
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="state-container empty">
          <div className="empty-icon-wrap">
            <i className="bi bi-file-earmark-text" />
          </div>
          <h2>No lost items reported yet</h2>
          <p>You haven't submitted any lost item reports. When you lose an item, report it here.</p>
          <button
            type="button"
            className="button primary"
            onClick={() => navigate('/report')}
          >
            <i className="bi bi-plus-lg" /> Report a lost item
          </button>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="item-grid directory-grid">
          {items.map((item) => (
            <LostItemCard
              key={item.id}
              item={item}
              showOwnerActions={true}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        itemName={itemToDelete?.itemName || ''}
        isDeleting={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />
    </section>
  )
}
