import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyLostItems } from '../../services/lostItemService'
import foundItemService from '../../services/foundItemService'
import claimService from '../../services/claimService'
import { getNotifications, markNotificationAsRead } from '../../services/notificationService'
import { getErrorMessage } from '../../services/api'
import { getCategoryIcon } from '../../constants/categories'
import type { LostItem } from '../../types/lostItem'
import type { FoundItem } from '../../types/foundItem'
import type { Claim } from '../../types/claim'
import type { NotificationItem } from '../../types/notification'

export default function StudentDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [lostItems, setLostItems] = useState<LostItem[]>([])
  const [foundItems, setFoundItems] = useState<FoundItem[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [lostRes, foundRes, claimsRes, notifRes] = await Promise.allSettled([
        getMyLostItems(),
        foundItemService.getMy(),
        claimService.getMyClaims(),
        getNotifications(),
      ])

      if (lostRes.status === 'fulfilled') setLostItems(lostRes.value || [])
      if (foundRes.status === 'fulfilled') setFoundItems(foundRes.value || [])
      if (claimsRes.status === 'fulfilled') setClaims(claimsRes.value || [])
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        )
      } catch {
        // silent fallback
      }
    }
    if (notif.type === 'CLAIM_APPROVED' || notif.type === 'CLAIM_REJECTED') {
      navigate('/claims')
    } else if (notif.type === 'ITEM_FOUND' || notif.type === 'ITEM_RETURNED') {
      navigate('/lost')
    } else {
      navigate('/notifications')
    }
  }

  // Derived metrics
  const activeLostCount = lostItems.filter((i) => i.status === 'LOST').length
  const activeFoundCount = foundItems.filter((i) => i.status === 'FOUND').length
  const pendingClaimsCount = claims.filter((c) => c.status === 'PENDING').length
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length

  const greetingName = user?.studentName ? user.studentName.split(' ')[0] : 'Student'

  return (
    <div className="student-dashboard-page page-width" style={{ padding: '32px 0 64px' }}>
      {/* Welcome Hero Banner */}
      <div className="dashboard-hero-banner">
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-badge">
            <span className="live-dot" />
            <span>CAMPUS RECOVERY NETWORK</span>
          </div>
          <h1>
            Welcome back, {greetingName}
          </h1>
          <p>
            {user?.className ? `${user.className} • ` : ''}
            Track your lost reports, claim verifications, and found recoveries across campus in real time.
          </p>
        </div>

        <div className="dashboard-hero-actions">
          <button className="button primary" onClick={() => navigate('/report')}>
            <i className="bi bi-flag-fill" /> Report Lost Item
          </button>
          <button className="button secondary" onClick={() => navigate('/found/new')}>
            <i className="bi bi-box-seam-fill" /> Report Found Item
          </button>
          <button
            className="icon-button refresh-btn"
            title="Refresh dashboard"
            onClick={loadDashboardData}
            disabled={loading}
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner" role="alert" style={{ marginBottom: '24px' }}>
          <i className="bi bi-exclamation-circle-fill" />
          <span>{error}</span>
        </div>
      )}

      {/* Modern Metric Cards Grid */}
      <div className="dashboard-stats-grid" style={{ marginBottom: '32px' }}>
        <div
          className="dashboard-stat-card stat-card-blue"
          onClick={() => navigate('/my-lost')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-top">
            <span className="stat-icon-wrapper blue">
              <i className="bi bi-flag-fill" />
            </span>
            <span className="stat-badge-pill blue">
              {activeLostCount} Active
            </span>
          </div>
          <div className="stat-card-value">{loading ? '—' : lostItems.length}</div>
          <div className="stat-card-label">My Lost Reports</div>
          <div className="stat-card-sub">
            {lostItems.length - activeLostCount} recovered or resolved
          </div>
        </div>

        <div
          className="dashboard-stat-card stat-card-green"
          onClick={() => navigate('/found')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-top">
            <span className="stat-icon-wrapper green">
              <i className="bi bi-box-seam-fill" />
            </span>
            <span className="stat-badge-pill green">
              {activeFoundCount} In Custody
            </span>
          </div>
          <div className="stat-card-value">{loading ? '—' : foundItems.length}</div>
          <div className="stat-card-label">Items You Found</div>
          <div className="stat-card-sub">
            {foundItems.length - activeFoundCount} safely returned to owner
          </div>
        </div>

        <div
          className="dashboard-stat-card stat-card-yellow"
          onClick={() => navigate('/claims')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-top">
            <span className="stat-icon-wrapper yellow">
              <i className="bi bi-shield-check" />
            </span>
            <span className="stat-badge-pill yellow">
              {pendingClaimsCount} Pending
            </span>
          </div>
          <div className="stat-card-value">{loading ? '—' : claims.length}</div>
          <div className="stat-card-label">Item Claims</div>
          <div className="stat-card-sub">
            Verification status with campus security
          </div>
        </div>

        <div
          className="dashboard-stat-card stat-card-purple"
          onClick={() => navigate('/notifications')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-top">
            <span className="stat-icon-wrapper purple">
              <i className="bi bi-bell-fill" />
            </span>
            {unreadNotifsCount > 0 && (
              <span className="stat-badge-pill purple">
                {unreadNotifsCount} New
              </span>
            )}
          </div>
          <div className="stat-card-value">{loading ? '—' : notifications.length}</div>
          <div className="stat-card-label">Campus Alerts</div>
          <div className="stat-card-sub">
            {unreadNotifsCount} unread system notifications
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="dashboard-quick-actions-bar" style={{ marginBottom: '32px' }}>
        <button className="quick-action-pill" onClick={() => navigate('/search')}>
          <div className="quick-pill-icon"><i className="bi bi-search" /></div>
          <div>
            <strong>Search Campus Directory</strong>
            <small>Browse all lost &amp; found logs</small>
          </div>
          <i className="bi bi-chevron-right pill-arrow" />
        </button>
        <button className="quick-action-pill" onClick={() => navigate('/found')}>
          <div className="quick-pill-icon"><i className="bi bi-box-seam" /></div>
          <div>
            <strong>Found Items Directory</strong>
            <small>Browse items awaiting claim</small>
          </div>
          <i className="bi bi-chevron-right pill-arrow" />
        </button>
        <button className="quick-action-pill" onClick={() => navigate('/my-lost')}>
          <div className="quick-pill-icon"><i className="bi bi-list-task" /></div>
          <div>
            <strong>Manage Lost Reports</strong>
            <small>Edit or resolve active reports</small>
          </div>
          <i className="bi bi-chevron-right pill-arrow" />
        </button>
        <button className="quick-action-pill" onClick={() => navigate('/claims')}>
          <div className="quick-pill-icon"><i className="bi bi-shield-lock" /></div>
          <div>
            <strong>Claim Verification</strong>
            <small>Review claims &amp; pickup codes</small>
          </div>
          <i className="bi bi-chevron-right pill-arrow" />
        </button>
      </div>

      {/* Main Two-Column Activity Grids */}
      <div className="dashboard-main-grid">
        {/* Left Column: Recent Lost & Found Reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Lost Items Panel */}
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <span className="section-kicker">MY ACTIVITY</span>
                <h2>Recent Lost Reports</h2>
              </div>
              <button className="text-button" onClick={() => navigate('/my-lost')}>
                View all ({lostItems.length}) <i className="bi bi-arrow-right" />
              </button>
            </div>

            {loading ? (
              <div className="dashboard-loading-state">
                <div className="loader-spinner" />
                <span>Loading your lost reports...</span>
              </div>
            ) : lostItems.length === 0 ? (
              <div className="dashboard-empty-panel">
                <div className="empty-icon-wrap blue">
                  <i className="bi bi-folder2-open" />
                </div>
                <p className="empty-title">No lost items reported yet</p>
                <p className="empty-desc">
                  If you misplaced something on campus, file a report to help other students and security find it.
                </p>
                <button
                  className="button primary small"
                  onClick={() => navigate('/report')}
                  style={{ marginTop: '12px' }}
                >
                  <i className="bi bi-plus-lg" /> Report a Lost Item
                </button>
              </div>
            ) : (
              <div className="dashboard-item-list">
                {lostItems.slice(0, 4).map((item) => {
                  const iconClass = getCategoryIcon(item.category)
                  const isLost = item.status === 'LOST'
                  return (
                    <div
                      key={item.id}
                      className="dashboard-item-row"
                      onClick={() => navigate(`/lost/${item.id}`)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="item-row-left">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.itemName}
                            className="item-thumbnail"
                          />
                        ) : (
                          <span className="item-icon-box blue">
                            <i className={`bi ${iconClass}`} />
                          </span>
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong className="item-row-title">{item.itemName}</strong>
                            {item.isUrgent && <span className="badge-urgent">URGENT</span>}
                          </div>
                          <p className="item-row-meta">
                            <i className="bi bi-tag" /> {item.category} •{' '}
                            <i className="bi bi-geo-alt" /> {item.lastSeenLocation}
                          </p>
                        </div>
                      </div>

                      <div className="item-row-right">
                        <span className={`status-badge ${isLost ? 'status-lost' : 'status-returned'}`}>
                          {item.status}
                        </span>
                        <i className="bi bi-chevron-right chevron-icon" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Active Found Items Panel */}
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <span className="section-kicker">CAMPUS ASSISTANCE</span>
                <h2>Items You Found</h2>
              </div>
              <button className="text-button" onClick={() => navigate('/found')}>
                Browse found ({foundItems.length}) <i className="bi bi-arrow-right" />
              </button>
            </div>

            {loading ? (
              <div className="dashboard-loading-state">
                <div className="loader-spinner" />
                <span>Loading your found items...</span>
              </div>
            ) : foundItems.length === 0 ? (
              <div className="dashboard-empty-panel">
                <div className="empty-icon-wrap green">
                  <i className="bi bi-box-seam" />
                </div>
                <p className="empty-title">No found items reported by you</p>
                <p className="empty-desc">
                  Found someone's lost keys, wallet, or phone on campus? Report it to help them recover it safely.
                </p>
                <button
                  className="button secondary small"
                  onClick={() => navigate('/found/new')}
                  style={{ marginTop: '12px' }}
                >
                  <i className="bi bi-plus-lg" /> Report a Found Item
                </button>
              </div>
            ) : (
              <div className="dashboard-item-list">
                {foundItems.slice(0, 3).map((item) => {
                  const iconClass = getCategoryIcon(item.category)
                  return (
                    <div
                      key={item.id}
                      className="dashboard-item-row"
                      onClick={() => navigate(`/found/${item.id}`)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="item-row-left">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.itemName}
                            className="item-thumbnail"
                          />
                        ) : (
                          <span className="item-icon-box green">
                            <i className={`bi ${iconClass}`} />
                          </span>
                        )}
                        <div>
                          <strong className="item-row-title">{item.itemName}</strong>
                          <p className="item-row-meta">
                            <i className="bi bi-tag" /> {item.category} •{' '}
                            <i className="bi bi-geo-alt" /> {item.foundLocation}
                          </p>
                        </div>
                      </div>

                      <div className="item-row-right">
                        <span className="status-badge status-found">{item.status}</span>
                        <i className="bi bi-chevron-right chevron-icon" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Claims & Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Claims Overview Panel */}
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <span className="section-kicker">VERIFICATION</span>
                <h2>My Item Claims</h2>
              </div>
              <button className="text-button" onClick={() => navigate('/claims')}>
                All claims ({claims.length}) <i className="bi bi-arrow-right" />
              </button>
            </div>

            {loading ? (
              <div className="dashboard-loading-state">
                <div className="loader-spinner" />
                <span>Loading claims...</span>
              </div>
            ) : claims.length === 0 ? (
              <div className="dashboard-empty-panel">
                <div className="empty-icon-wrap yellow">
                  <i className="bi bi-shield-check" />
                </div>
                <p className="empty-title">No active claims</p>
                <p className="empty-desc">
                  When you spot an item in the Found directory that belongs to you, submit a verification claim.
                </p>
              </div>
            ) : (
              <div className="dashboard-item-list">
                {claims.slice(0, 3).map((claim) => (
                  <div
                    key={claim.id}
                    className="dashboard-item-row"
                    onClick={() => navigate(`/claims/${claim.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="item-row-left">
                      <span className="item-icon-box yellow">
                        <i className="bi bi-shield-check" />
                      </span>
                      <div>
                        <strong className="item-row-title">Claim #{claim.id}</strong>
                        <p className="item-row-meta">
                          Found item #{claim.foundItemId} • Lost #{claim.lostItemId}
                        </p>
                      </div>
                    </div>
                    <div className="item-row-right">
                      <span
                        className={`status-badge ${
                          claim.status === 'APPROVED'
                            ? 'status-approved'
                            : claim.status === 'REJECTED'
                            ? 'status-rejected'
                            : 'status-pending'
                        }`}
                      >
                        {claim.status}
                      </span>
                      <i className="bi bi-chevron-right chevron-icon" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Panel */}
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <span className="section-kicker">CAMPUS FEED</span>
                <h2>Updates &amp; Alerts</h2>
              </div>
              <button className="text-button" onClick={() => navigate('/notifications')}>
                View feed <i className="bi bi-arrow-right" />
              </button>
            </div>

            {loading ? (
              <div className="dashboard-loading-state">
                <div className="loader-spinner" />
                <span>Loading updates...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="dashboard-empty-panel">
                <div className="empty-icon-wrap purple">
                  <i className="bi bi-bell-slash" />
                </div>
                <p className="empty-title">No notifications yet</p>
                <p className="empty-desc">
                  You'll be notified here whenever a potential match or claim update is available.
                </p>
              </div>
            ) : (
              <div className="dashboard-item-list">
                {notifications.slice(0, 4).map((notif) => (
                  <div
                    key={notif.id}
                    className={`dashboard-notif-row ${!notif.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className={`notif-status-dot ${!notif.isRead ? 'unread' : 'read'}`} />
                    <div style={{ flex: 1 }}>
                      <p className="notif-message-text">{notif.message}</p>
                      <small className="notif-time-text">
                        {new Date(notif.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </small>
                    </div>
                    {!notif.isRead && <span className="notif-new-tag">NEW</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
