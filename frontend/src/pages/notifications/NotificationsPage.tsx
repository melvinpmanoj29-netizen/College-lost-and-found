import { useCallback, useEffect, useState } from 'react'
import { getNotifications, markNotificationAsRead } from '../../services/notificationService'
import { getErrorMessage } from '../../services/api'
import type { NotificationItem, NotificationType } from '../../types/notification'

function getNotificationMeta(type: NotificationType) {
  switch (type) {
    case 'MATCH_FOUND':
      return {
        icon: 'bi-stars',
        circleClass: 'match',
        label: 'Possible Match',
      }
    case 'SIMILAR_ITEM_REPORTED':
      return {
        icon: 'bi-search',
        circleClass: 'match',
        label: 'Similar Item',
      }
    case 'ITEM_FOUND':
      return {
        icon: 'bi-box-seam',
        circleClass: 'found',
        label: 'Item Found',
      }
    case 'CLAIM_APPROVED':
      return {
        icon: 'bi-check-circle-fill',
        circleClass: 'approved',
        label: 'Claim Approved',
      }
    case 'CLAIM_REJECTED':
      return {
        icon: 'bi-x-circle-fill',
        circleClass: 'rejected',
        label: 'Claim Rejected',
      }
    case 'ITEM_RETURNED':
      return {
        icon: 'bi-box-heart',
        circleClass: 'returned',
        label: 'Item Returned',
      }
    default:
      return {
        icon: 'bi-bell',
        circleClass: 'default',
        label: 'Update',
      }
  }
}

function formatRelativeTime(isoString?: string): string {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return isoString
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingId, setMarkingId] = useState<number | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotificationsList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getNotifications()
      setNotifications(data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getNotifications()
      .then((data) => {
        if (!isMounted) return
        setNotifications(data || [])
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

  const handleMarkAsRead = async (id: number) => {
    setMarkingId(id)
    try {
      const updated = await markNotificationAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: updated.isRead ?? true } : n))
      )
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    } finally {
      setMarkingId(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    const unreadItems = notifications.filter((n) => !n.isRead)
    if (unreadItems.length === 0) return

    setMarkingAll(true)
    try {
      // Mark each unread notification as read sequentially or in parallel
      await Promise.all(unreadItems.map((n) => markNotificationAsRead(n.id)))
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const displayedNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications

  return (
    <div className="notifications-page page-width">
      <div className="notifications-header">
        <div>
          <span className="eyebrow">
            <i className="bi bi-bell" /> INBOX
          </span>
          <h1>Notifications</h1>
          <p>Stay updated on your reported items, possible matches, and claim statuses.</p>
        </div>
        {unreadCount > 0 && (
          <button
            className="button secondary small"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <>
                <span className="loader-spinner" style={{ width: '12px', height: '12px' }} />
                Updating...
              </>
            ) : (
              <>
                <i className="bi bi-check2-all" /> Mark all as read
              </>
            )}
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="notif-filter-tabs">
        <button
          className={`notif-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`notif-filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="state-container">
          <div className="loader-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
          <div className="state-title" style={{ marginTop: '16px' }}>Loading notifications...</div>
          <div className="state-desc">Retrieving your latest campus activity updates.</div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="state-container">
          <div className="state-icon error">
            <i className="bi bi-exclamation-circle" />
          </div>
          <div className="state-title">Unable to load notifications</div>
          <div className="state-desc">{error}</div>
          <button className="button primary small" onClick={fetchNotificationsList}>
            <i className="bi bi-arrow-clockwise" /> Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && displayedNotifications.length === 0 && (
        <div className="state-container">
          <div className="state-icon">
            <i className="bi bi-bell-slash" />
          </div>
          <div className="state-title">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </div>
          <div className="state-desc">
            {filter === 'unread'
              ? "You're all caught up! There are no unread updates right now."
              : "When there are updates regarding your lost or found items, they'll appear here."}
          </div>
          {filter === 'unread' && notifications.length > 0 && (
            <button className="button secondary small" onClick={() => setFilter('all')}>
              View All Notifications
            </button>
          )}
        </div>
      )}

      {/* Notifications list */}
      {!loading && !error && displayedNotifications.length > 0 && (
        <div className="notifications-list">
          {displayedNotifications.map((notif) => {
            const meta = getNotificationMeta(notif.type)
            return (
              <div
                key={notif.id}
                className={`notif-card ${!notif.isRead ? 'unread' : ''}`}
              >
                {!notif.isRead && <span className="notif-unread-indicator" title="Unread" />}
                <div className={`notif-icon-circle ${meta.circleClass}`}>
                  <i className={`bi ${meta.icon}`} />
                </div>
                <div className="notif-body">
                  <div className="notif-type-tag">{meta.label}</div>
                  <p className="notif-message">{notif.message}</p>
                  <div className="notif-timestamp">
                    <i className="bi bi-clock" /> {formatRelativeTime(notif.createdAt)}
                  </div>
                  {!notif.isRead && (
                    <button
                      className="notif-mark-btn"
                      onClick={() => handleMarkAsRead(notif.id)}
                      disabled={markingId === notif.id}
                    >
                      {markingId === notif.id ? 'Marking...' : 'Mark as read'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
