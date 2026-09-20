import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './App.css'
import './styles/found-matching-claims.css'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import Logo from './components/Logo'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import ForbiddenPage from './pages/ForbiddenPage'
import LostItemsListPage from './pages/lost-items/LostItemsListPage'
import ReportLostItemPage from './pages/lost-items/ReportLostItemPage'
import LostItemDetailsPage from './pages/lost-items/LostItemDetailsPage'
import EditLostItemPage from './pages/lost-items/EditLostItemPage'
import MyLostItemsPage from './pages/lost-items/MyLostItemsPage'

// Developer 3 (Sahla) - Found Items, Smart Matching, Claims
import FoundItemsPage from './pages/found-items/FoundItemsPage'
import FoundItemDetailPage from './pages/found-items/FoundItemDetailPage'
import ReportFoundItemPage from './pages/found-items/ReportFoundItemPage'
import EditFoundItemPage from './pages/found-items/EditFoundItemPage'
import ItemMatchesPage from './pages/matches/ItemMatchesPage'
import MatchDetailPage from './pages/matches/MatchDetailPage'
import CreateClaimPage from './pages/claims/CreateClaimPage'
import MyClaimsPage from './pages/claims/MyClaimsPage'
import ClaimDetailPage from './pages/claims/ClaimDetailPage'
import SearchPage from './pages/search/SearchPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import StudentDashboardPage from './pages/dashboard/StudentDashboardPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminLostItemsPage from './pages/admin/AdminLostItemsPage'
import AdminFoundItemsPage from './pages/admin/AdminFoundItemsPage'
import AdminClaimsPage from './pages/admin/AdminClaimsPage'
import AdminConfigurationPage from './pages/admin/AdminConfigurationPage'
import AdminReturnHistoryPage from './pages/admin/AdminReturnHistoryPage'
import { getUnreadNotifications } from './services/notificationService'
import { getAllLostItems } from './services/lostItemService'
import { foundItemService } from './services/foundItemService'
import type { LostItem } from './types/lostItem'
import type { FoundItem } from './types/foundItem'

interface UnifiedRecentItem {
  id: number
  name: string
  kind: 'Lost' | 'Found'
  category: string
  location: string
  date: string
  status: string
  imageUrl: string | null
  color: string | null
}

const navItems: { label: string; path: string; icon: string }[] = [
  { label: 'Home', path: '/', icon: 'bi-house' },
  { label: 'Search', path: '/search', icon: 'bi-search' },
  { label: 'Lost items', path: '/lost', icon: 'bi-flag' },
  { label: 'Found items', path: '/found', icon: 'bi-box-seam' },
  { label: 'Claims', path: '/claims', icon: 'bi-shield-check' },
  { label: 'About', path: '/about', icon: 'bi-info-circle' },
]

function App() {
  return (
    <Routes>
      <Route element={<ShellLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />

        {/* Student area - requires authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<StudentDashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Lost Items Routes (Developer 2 - Nived) */}
          <Route path="/lost" element={<LostItemsListPage />} />
          <Route path="/lost/:id" element={<LostItemDetailsPage />} />
          <Route path="/lost/:id/edit" element={<EditLostItemPage />} />
          <Route path="/my-lost" element={<MyLostItemsPage />} />
          <Route path="/report" element={<ReportLostItemPage />} />
          <Route path="/report/lost" element={<ReportLostItemPage />} />
          <Route path="/report/found" element={<ReportFoundItemPage />} />

          {/* Found Items Routes (Developer 3 - Sahla) */}
          <Route path="/found" element={<FoundItemsPage />} />
          <Route path="/found/new" element={<ReportFoundItemPage />} />
          <Route path="/found/:id" element={<FoundItemDetailPage />} />
          <Route path="/found/:id/edit" element={<EditFoundItemPage />} />

          {/* Smart Matching Routes (Developer 3 - Sahla) */}
          <Route path="/matches/found/:foundItemId" element={<ItemMatchesPage type="found" />} />
          <Route path="/matches/lost/:lostItemId" element={<ItemMatchesPage type="lost" />} />
          <Route path="/matches/:id" element={<MatchDetailPage />} />

          {/* Claims Routes (Developer 3 - Sahla) */}
          <Route path="/claims" element={<MyClaimsPage />} />
          <Route path="/claims/new" element={<CreateClaimPage />} />
          <Route path="/claims/:id" element={<ClaimDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin area - requires ADMIN role */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="lost-items" element={<AdminLostItemsPage />} />
              <Route path="found-items" element={<AdminFoundItemsPage />} />
              <Route path="claims" element={<AdminClaimsPage />} />
              <Route path="categories" element={<AdminConfigurationPage />} />
              <Route path="configuration" element={<AdminConfigurationPage />} />
              <Route path="return-history" element={<AdminReturnHistoryPage />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function ShellLayout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) return

    let isMounted = true
    const fetchUnread = async () => {
      try {
        const unread = await getUnreadNotifications()
        if (isMounted) setUnreadCount(unread.length)
      } catch {
        // silently ignore in navbar
      }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [isAuthenticated, location.pathname])

  const effectiveUnread = isAuthenticated ? unreadCount : 0

  const go = (path: string) => {
    navigate(path)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const initials = user
    ? user.studentName.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : ''

  return (
    <div className="app-shell">
      <header className="navbar">
        <button className="brand" onClick={() => go('/')} aria-label="Go to College Lost and Found home">
          <Logo size={32} />
          <span>College <strong>Lost &amp; Found</strong></span>
        </button>
        <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              key={item.path}
              onClick={() => go(item.path)}
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </button>
          ))}
          {menuOpen && isAuthenticated && (
            <div className="mobile-nav-extras">
              <button className="nav-link" onClick={() => go('/dashboard')}>
                <i className="bi bi-grid-1x2" /> Dashboard
              </button>
              <button className="nav-link" onClick={() => go('/profile')}>
                <i className="bi bi-person" /> Profile ({user?.studentName})
              </button>
              {isAdmin && (
                <button className="nav-link admin-link" onClick={() => go('/admin/dashboard')}>
                  <i className="bi bi-speedometer2" /> Admin Console
                </button>
              )}
              <button className="nav-link text-danger" onClick={logout}>
                <i className="bi bi-box-arrow-right" /> Log out
              </button>
            </div>
          )}
        </nav>
        <div className="nav-actions">
          <button
            className="icon-button theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <i className={`bi ${theme === 'light' ? 'bi-moon-stars' : 'bi-sun'}`} />
          </button>

          {isAuthenticated ? (
            <>
              <button
                className="icon-button notif-nav-btn"
                aria-label="Notifications"
                onClick={() => go('/notifications')}
                title="Notifications"
              >
                <i className="bi bi-bell" />
                {effectiveUnread > 0 ? (
                  <span className="nav-unread-badge">{effectiveUnread > 99 ? '99+' : effectiveUnread}</span>
                ) : (
                  <span className="notification-dot" />
                )}
              </button>
              <button
                className="avatar"
                aria-label="Open profile"
                onClick={() => go('/profile')}
                title={`Signed in as ${user?.studentName || 'User'}`}
              >
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.studentName}
                    className="navbar-avatar-img"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      const next = e.currentTarget.nextElementSibling as HTMLElement;
                      if (next) next.style.display = 'grid';
                    }}
                  />
                ) : null}
                <span
                  className="navbar-avatar-initials"
                  style={{ display: user?.profileImageUrl ? 'none' : 'grid' }}
                >
                  {initials}
                </span>
              </button>
              <button className="button primary small nav-report-btn" onClick={() => go('/report')}><i className="bi bi-plus-lg" /> Report item</button>
              {isAdmin && (
                <button className="nav-link admin-link nav-admin-badge-btn" onClick={() => go('/admin/dashboard')}><i className="bi bi-speedometer2" /> Admin</button>
              )}
              <button className="icon-button logout-btn" aria-label="Log out" onClick={logout} title="Log out"><i className="bi bi-box-arrow-right" /></button>
            </>
          ) : (
            <>
              <button className="button secondary small" onClick={() => go('/register')}>Sign up</button>
              <button className="button primary small" onClick={() => go('/login')}><i className="bi bi-box-arrow-in-right" /> Log in</button>
            </>
          )}
        </div>
        <button className="menu-button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
          <i className={menuOpen ? 'bi bi-x-lg' : 'bi bi-list'} />
        </button>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <div className="page-width footer-inner">
          <div className="footer-brand">
            <Logo size={34} />
            <div>
              <strong>College Lost &amp; Found</strong>
              <p>Reuniting students with what matters.</p>
            </div>
          </div>
          <div className="footer-links">
            <button onClick={() => go('/')}>Home</button>
            <button onClick={() => go('/search')}>Search</button>
            <button onClick={() => go('/lost')}>Lost items</button>
            <button onClick={() => go('/found')}>Found items</button>
            <button onClick={() => go('/claims')}>Claims</button>
            <button onClick={() => go('/about')}>About</button>
          </div>
          <span className="copyright">© 2026 College Lost &amp; Found. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}

function Home() {
  const navigate = useNavigate()
  const [recentItems, setRecentItems] = useState<UnifiedRecentItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function fetchRecentActivity() {
      try {
        const [lostList, foundList] = await Promise.allSettled([
          getAllLostItems(),
          foundItemService.getAll(),
        ])

        const unified: UnifiedRecentItem[] = []

        if (lostList.status === 'fulfilled' && Array.isArray(lostList.value)) {
          lostList.value
            .filter((item: LostItem) => item.status !== 'RETURNED' && !item.isArchived)
            .forEach((item: LostItem) => {
              unified.push({
                id: item.id,
                name: item.itemName,
                kind: 'Lost',
                category: item.category,
                location: item.lastSeenLocation,
                date: item.lostDateTime,
                status: item.isUrgent ? 'Urgent' : 'Active',
                imageUrl: item.imageUrl,
                color: item.color,
              })
            })
        }

        if (foundList.status === 'fulfilled' && Array.isArray(foundList.value)) {
          foundList.value
            .filter((item: FoundItem) => item.status !== 'RETURNED')
            .forEach((item: FoundItem) => {
              unified.push({
                id: item.id,
                name: item.itemName,
                kind: 'Found',
                category: item.category,
                location: item.foundLocation,
                date: item.foundDateTime,
                status: 'Awaiting Claim',
                imageUrl: item.imageUrl,
                color: item.color,
              })
            })
        }

        // Sort latest first
        unified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        if (isMounted) {
          setRecentItems(unified.slice(0, 4))
          setLoadingItems(false)
        }
      } catch {
        if (isMounted) setLoadingItems(false)
      }
    }

    fetchRecentActivity()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <section className="hero-section page-width">
        <div className="hero-copy">
          <span className="eyebrow"><i className="bi bi-stars" /> AI-Powered Campus Recovery</span>
          <h1>Lost something on campus?<br /><em>Let's help you find it.</em></h1>
          <p>
            One unified editorial space for students to report missing belongings, browse verified found items,
            and match belongings in real-time.
          </p>
          <div className="hero-actions">
            <button className="button primary" onClick={() => navigate('/report')}>
              <i className="bi bi-plus-lg" /> Report lost item
            </button>
            <button className="button secondary" onClick={() => navigate('/found')}>
              Browse found items <i className="bi bi-arrow-right" />
            </button>
          </div>
          <div className="trust-note">
            <span className="avatar-stack"><b>AM</b><b>KL</b><b>RS</b></span>
            <span>Trusted by <strong>2,400+ students</strong> at Jyothi Engineering College</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="product-mockup-card">
            <div className="browser-chrome">
              <div className="browser-dots">
                <div className="browser-dot" />
                <div className="browser-dot" />
                <div className="browser-dot" />
              </div>
              <div className="browser-tabs">
                <span className="browser-tab"><i className="bi bi-cpu" /> smart-matching-engine</span>
                <span className="browser-tab"><i className="bi bi-shield-check" /> verified-handoff</span>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'var(--color-primary-soft)',
                    color: 'var(--color-cobalt)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '18px'
                  }}>
                    <i className="bi bi-radar" />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Live Campus Detection</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Automated TF-IDF + NLP Matching</div>
                  </div>
                </div>
                <span className="badge found" style={{ fontSize: '11px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
                  SYSTEM ACTIVE
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="bi bi-laptop" style={{ color: 'var(--color-cobalt)', fontSize: '16px' }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Smart Match Threshold &gt; 50%</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Instant Email &amp; In-App Notification</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: 'rgba(5, 150, 105, 0.1)', padding: '3px 8px', borderRadius: '20px' }}>
                    Auto-Alert
                  </span>
                </div>

                <div style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="bi bi-shield-lock" style={{ color: '#7c3aed', fontSize: '16px' }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Encrypted Claim Verification</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Owner-Only Distinction Checks</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', background: 'rgba(124, 58, 237, 0.1)', padding: '3px 8px', borderRadius: '20px' }}>
                    Safe Handoff
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="quick-actions page-width">
        <div>
          <span className="section-kicker">START HERE</span>
          <h2>What do you need today?</h2>
        </div>
        <div className="action-grid">
          <Action icon="bi-search" title="Find an item" text="Browse lost and found reports" onClick={() => navigate('/search')} />
          <Action icon="bi-flag" title="Report lost" text="Tell the campus community" onClick={() => navigate('/report')} />
          <Action icon="bi-box-seam" title="Report found" text="Help return an item" onClick={() => navigate('/found/new')} />
          <Action icon="bi-grid-1x2" title="My dashboard" text="Track your activity" onClick={() => navigate('/dashboard')} />
        </div>
      </section>

      <section className="section-band">
        <div className="page-width">
          <SectionHeading kicker="RECENT ACTIVITY" title="Items making their way home" action="View all items" onClick={() => navigate('/search')} />
          
          {loadingItems ? (
            <div className="state-container" style={{ minHeight: '180px' }}>
              <span className="loader-spinner" />
              <p style={{ marginTop: '12px' }}>Loading real-time campus activity...</p>
            </div>
          ) : recentItems.length === 0 ? (
            <div className="state-container empty" style={{ minHeight: '180px' }}>
              <div className="empty-icon-wrap"><i className="bi bi-inbox" /></div>
              <h3>No items reported yet</h3>
              <p>Be the first to report a lost or found item on campus.</p>
              <button className="button primary small" onClick={() => navigate('/report')}>
                <i className="bi bi-plus-lg" /> Report an item
              </button>
            </div>
          ) : (
            <div className="item-grid">
              {recentItems.map((item) => (
                <RealItemCard
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  onClick={() => navigate(item.kind === 'Lost' ? `/lost/${item.id}` : `/found/${item.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <HowItWorks />

      <section className="stats-section page-width">
        <div>
          <span className="section-kicker">CAMPUS AT A GLANCE</span>
          <h2>Small actions make a<br />big difference.</h2>
        </div>
        <div className="stats-grid">
          <Stat value="1,284" label="Items reported" />
          <Stat value="846" label="Items reunited" />
          <Stat value="94%" label="Return rate" />
          <Stat value="2.4k" label="Active students" />
        </div>
      </section>

      <section className="cta page-width">
        <div>
          <span className="eyebrow">Make a difference today</span>
          <h2>That thing you found?<br />It might mean everything to someone.</h2>
        </div>
        <button className="button white" onClick={() => navigate('/report')}>
          Report an item <i className="bi bi-arrow-up-right" />
        </button>
      </section>
    </>
  )
}

function Action({ icon, title, text, onClick }: { icon: string; title: string; text: string; onClick: () => void }) {
  return (
    <button className="action-card" onClick={onClick}>
      <span className="action-icon"><i className={`bi ${icon}`} /></span>
      <span><strong>{title}</strong><small>{text}</small></span>
      <i className="bi bi-arrow-up-right arrow" />
    </button>
  )
}

function SectionHeading({ kicker, title, action, onClick }: { kicker: string; title: string; action?: string; onClick?: () => void }) {
  return (
    <div className="section-heading">
      <div>
        <span className="section-kicker">{kicker}</span>
        <h2>{title}</h2>
      </div>
      {action && (
        <button className="text-button" onClick={onClick}>
          {action} <i className="bi bi-arrow-right" />
        </button>
      )}
    </div>
  )
}

function getCategoryIcon(category: string): string {
  const c = (category || '').toLowerCase()
  if (c.includes('bag') || c.includes('backpack')) return 'bi-backpack2'
  if (c.includes('phone') || c.includes('mobile')) return 'bi-phone'
  if (c.includes('book') || c.includes('notebook')) return 'bi-book'
  if (c.includes('key')) return 'bi-key'
  if (c.includes('card') || c.includes('id')) return 'bi-person-badge'
  if (c.includes('electronic') || c.includes('earbud') || c.includes('laptop')) return 'bi-laptop'
  if (c.includes('bottle') || c.includes('flask')) return 'bi-cup-straw'
  if (c.includes('wallet') || c.includes('purse')) return 'bi-wallet2'
  return 'bi-box-seam'
}

function formatRelativeDate(isoDate: string): string {
  try {
    const d = new Date(isoDate)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return isoDate
  }
}

function RealItemCard({ item, onClick }: { item: UnifiedRecentItem; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <article className="item-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="item-image" style={{ position: 'relative', overflow: 'hidden', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-lavender-mist)' }}>
        {item.imageUrl && !imgErr ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <i className={`bi ${getCategoryIcon(item.category)}`} style={{ fontSize: '2.5rem', color: 'var(--color-cobalt)' }} />
        )}
        <span
          className={item.kind === 'Lost' ? 'badge lost' : 'badge found'}
          style={{ position: 'absolute', top: '10px', left: '10px' }}
        >
          {item.kind}
        </span>
      </div>
      <div className="item-info">
        <div className="item-title">
          <h3>{item.name}</h3>
        </div>
        <p className="meta">
          <span><i className="bi bi-tag" /> {item.category}</span>
          <span><i className="bi bi-geo-alt" /> {item.location}</span>
        </p>
        <div className="card-bottom">
          <span><i className="bi bi-calendar3" /> {formatRelativeDate(item.date)}</span>
          <span className={item.kind === 'Found' ? 'status success' : 'status'}>{item.status}</span>
        </div>
        <button className="details-link" onClick={onClick}>
          View details <i className="bi bi-arrow-up-right" />
        </button>
      </div>
    </article>
  )
}

function HowItWorks() {
  return (
    <section className="how-section page-width">
      <SectionHeading kicker="HOW IT WORKS" title="From missing to returned" />
      <div className="steps">
        <Step number="01" icon="bi-pencil-square" title="Report" text="Share a few details about what is lost or found." />
        <Step number="02" icon="bi-search" title="Match" text="Browse reports and get notified about possible matches." />
        <Step number="03" icon="bi-hand-thumbs-up" title="Claim" text="Verify the details and request a safe handoff." />
        <Step number="04" icon="bi-house-heart" title="Return" text="Reconnect the item with its owner." />
      </div>
    </section>
  )
}

function Step({ number, icon, title, text }: { number: string; icon: string; title: string; text: string }) {
  return (
    <div className="step">
      <span className="step-number">{number}</span>
      <span className="step-icon"><i className={`bi ${icon}`} /></span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function About() {
  return (
    <section className="about-page page-width">
      <span className="section-kicker">OUR PURPOSE</span>
      <h1>A more connected campus,<br /><em>one return at a time.</em></h1>
      <p className="about-lead">
        College Lost &amp; Found is a shared campus space designed to make reporting, searching, and returning belongings feel simple.
      </p>
      <div className="about-grid">
        <Step number="01" icon="bi-pencil-square" title="Make it visible" text="A clear report gives a missing item its best chance of being recognized." />
        <Step number="02" icon="bi-people" title="Look out for each other" text="Our campus community is strongest when small acts of care are easy to make." />
        <Step number="03" icon="bi-shield-check" title="Return with confidence" text="Simple details and safe handoffs help make every reunion feel right." />
      </div>
    </section>
  )
}

export default App

