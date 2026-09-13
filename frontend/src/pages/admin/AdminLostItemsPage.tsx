import { useCallback, useEffect, useState } from 'react'
import { deleteAdminLostItem, getAdminLostItems } from '../../services/adminService'
import { getErrorMessage } from '../../services/api'
import type { AdminLostItem } from '../../types/admin'

function formatDate(isoString?: string): string {
  if (!isoString) return '—'
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return isoString
  }
}

export default function AdminLostItemsPage() {
  const [items, setItems] = useState<AdminLostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Deletion modal state
  const [deletingItem, setDeletingItem] = useState<AdminLostItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminLostItems()
      setItems(data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getAdminLostItems()
      .then((data) => {
        if (!isMounted) return
        setItems(data || [])
        setLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(getErrorMessage(err))
        setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return
    setIsDeleting(true)
    setFeedback(null)
    try {
      await deleteAdminLostItem(deletingItem.id)
      setItems((prev) => prev.filter((i) => i.id !== deletingItem.id))
      setFeedback({
        type: 'success',
        message: `Report "${deletingItem.itemName}" (#${deletingItem.id}) was successfully removed.`,
      })
      setDeletingItem(null)
    } catch (err) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(err),
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.lastSeenLocation && item.lastSeenLocation.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div>
      <div className="admin-table-card">
        <div className="admin-table-header">
          <div>
            <h2>Manage Lost Reports ({items.length})</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Review all reported lost items and remove illegitimate or duplicate submissions.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="input-wrap" style={{ width: '240px' }}>
              <i className="bi bi-search" />
              <input
                type="text"
                placeholder="Filter reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minHeight: '38px', fontSize: '13px' }}
              />
            </div>
            <button className="button secondary small" onClick={fetchItems} disabled={loading}>
              <i className="bi bi-arrow-clockwise" />
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div style={{ padding: '16px 20px 0' }}>
            <div className={`admin-feedback-toast ${feedback.type}`}>
              <i className={`bi ${feedback.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} />
              <span>{feedback.message}</span>
              <button
                style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer' }}
                onClick={() => setFeedback(null)}
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="state-container" style={{ margin: '20px' }}>
            <div className="loader-spinner" style={{ width: '28px', height: '28px', borderWidth: '3px' }} />
            <div className="state-title" style={{ marginTop: '14px', fontSize: '15px' }}>Loading lost reports...</div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="state-container" style={{ margin: '20px' }}>
            <div className="state-icon error" style={{ width: '40px', height: '40px', fontSize: '20px' }}>
              <i className="bi bi-exclamation-circle" />
            </div>
            <div className="state-title" style={{ fontSize: '16px' }}>Failed to load lost reports</div>
            <div className="state-desc">{error}</div>
            <button className="button primary small" onClick={fetchItems}>
              <i className="bi bi-arrow-clockwise" /> Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="state-container" style={{ margin: '20px' }}>
            <div className="state-icon" style={{ width: '44px', height: '44px', fontSize: '22px' }}>
              <i className="bi bi-inbox" />
            </div>
            <div className="state-title" style={{ fontSize: '16px' }}>No lost reports found</div>
            <div className="state-desc">
              {searchTerm ? 'No reports matched your search filter.' : 'There are currently no active lost reports.'}
            </div>
          </div>
        )}

        {/* Data table */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Last Seen Location</th>
                  <th>Date Lost</th>
                  <th>Status</th>
                  <th>Urgent</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>
                      <strong>{item.itemName}</strong>
                      {item.description && (
                        <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td>{item.category}</td>
                    <td>{item.lastSeenLocation || '—'}</td>
                    <td>{formatDate(item.lostDateTime)}</td>
                    <td>
                      <span className="badge-lost">{item.status}</span>
                    </td>
                    <td>
                      {item.isUrgent ? <span className="badge-urgent">URGENT</span> : <span style={{ color: '#94a3b8' }}>No</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="button secondary small"
                        style={{ color: '#dc2626', borderColor: '#fecaca', padding: '4px 10px', minHeight: '30px', fontSize: '12px' }}
                        onClick={() => setDeletingItem(item)}
                      >
                        <i className="bi bi-trash" /> Remove Fake
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {deletingItem && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-head">
              <h3>Confirm Report Removal</h3>
              <button
                className="icon-button"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: '0 0 14px', fontSize: '14px', color: '#1e293b' }}>
                Are you sure you want to remove the lost report for{' '}
                <strong>"{deletingItem.itemName}"</strong> (Report ID: #{deletingItem.id})?
              </p>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px', fontSize: '12.5px', color: '#991b1b', lineHeight: 1.5 }}>
                <i className="bi bi-exclamation-triangle" style={{ marginRight: '6px' }} />
                This action is irreversible. The report will be permanently purged from the system.
              </div>
            </div>
            <div className="modal-foot">
              <button
                className="button secondary small"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="button primary small"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Removing...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
