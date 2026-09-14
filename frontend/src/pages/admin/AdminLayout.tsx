import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'bi-speedometer2' },
    { label: 'Lost Reports', path: '/admin/lost-items', icon: 'bi-flag' },
    { label: 'Found Reports', path: '/admin/found-items', icon: 'bi-box-seam' },
    { label: 'Claims Review', path: '/admin/claims', icon: 'bi-shield-check' },
    { label: 'Return History', path: '/admin/return-history', icon: 'bi-clock-history' },
  ]

  const isActive = (tabPath: string) => {
    if (tabPath === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard'
    }
    return location.pathname.startsWith(tabPath)
  }

  return (
    <div className="admin-shell page-width">
      <div className="admin-header-bar">
        <div className="admin-title-group">
          <span className="admin-badge-role">ADMINISTRATOR</span>
          <div>
            <h1>Campus Administration Portal</h1>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Signed in as <strong>{user?.email}</strong>
            </div>
          </div>
        </div>

        <button className="button secondary small" onClick={() => navigate('/dashboard')}>
          <i className="bi bi-box-arrow-left" /> Back to Student Portal
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="admin-nav-tabs" style={{ marginBottom: '24px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.path}
            className={`admin-nav-tab ${isActive(tab.path) ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <i className={`bi ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nested Admin Page Content */}
      <Outlet />
    </div>
  )
}
