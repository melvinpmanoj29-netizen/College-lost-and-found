import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FullPageLoader from './FullPageLoader'

/**
 * Blocks non-admins from admin pages:
 *   not logged in      -> redirect to /login
 *   logged in, not ADMIN -> redirect to the 403 page
 *   logged in as ADMIN -> render the page
 */
export default function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullPageLoader />
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (!isAdmin) {
    return <Navigate to="/forbidden" replace />
  }
  return <Outlet />
}