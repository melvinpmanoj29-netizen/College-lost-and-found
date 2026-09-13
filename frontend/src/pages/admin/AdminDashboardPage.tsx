import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chart, registerables } from 'chart.js'
import { getAdminDashboard } from '../../services/adminService'
import { getErrorMessage } from '../../services/api'
import type { DashboardStats } from '../../types/admin'

Chart.register(...registerables)

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const locationChartRef = useRef<HTMLCanvasElement | null>(null)
  const locationChartInstance = useRef<Chart | null>(null)

  const statusChartRef = useRef<HTMLCanvasElement | null>(null)
  const statusChartInstance = useRef<Chart | null>(null)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminDashboard()
      setStats(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getAdminDashboard()
      .then((data) => {
        if (!isMounted) return
        setStats(data)
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

  // Build or update Chart.js instances when stats arrive
  useEffect(() => {
    if (!stats) return

    // 1. Location Frequency Bar Chart
    if (locationChartRef.current) {
      if (locationChartInstance.current) {
        locationChartInstance.current.destroy()
      }

      const locations = stats.mostCommonLocations || []
      const labels = locations.map((l) => l.location)
      const data = locations.map((l) => l.count)

      locationChartInstance.current = new Chart(locationChartRef.current, {
        type: 'bar',
        data: {
          labels: labels.length > 0 ? labels : ['No location data'],
          datasets: [
            {
              label: 'Report Count',
              data: data.length > 0 ? data : [0],
              backgroundColor: '#2563eb',
              borderRadius: 6,
              hoverBackgroundColor: '#1d4ed8',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Reports: ${ctx.parsed.y}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1, precision: 0 },
              grid: { color: '#f1f5f9' },
            },
            x: {
              grid: { display: false },
            },
          },
        },
      })
    }

    // 2. Status Doughnut Chart
    if (statusChartRef.current) {
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy()
      }

      const totalLost = stats.totalLostItems || 0
      const totalFound = stats.totalFoundItems || 0
      const returned = stats.itemsReturned || 0

      statusChartInstance.current = new Chart(statusChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Active Lost', 'Active Found', 'Returned Items'],
          datasets: [
            {
              data: [totalLost, totalFound, returned],
              backgroundColor: ['#dc2626', '#2563eb', '#16a34a'],
              borderWidth: 2,
              borderColor: '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, padding: 14, font: { size: 12 } },
            },
          },
          cutout: '70%',
        },
      })
    }

    return () => {
      locationChartInstance.current?.destroy()
      statusChartInstance.current?.destroy()
    }
  }, [stats])

  if (loading) {
    return (
      <div className="state-container">
        <div className="loader-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
        <div className="state-title" style={{ marginTop: '16px' }}>Loading Admin Analytics...</div>
        <div className="state-desc">Aggregating campus statistics from database records.</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="state-container">
        <div className="state-icon error">
          <i className="bi bi-exclamation-triangle-fill" />
        </div>
        <div className="state-title">Failed to load admin dashboard</div>
        <div className="state-desc">{error}</div>
        <button className="button primary small" onClick={fetchDashboard}>
          <i className="bi bi-arrow-clockwise" /> Try Again
        </button>
      </div>
    )
  }

  const totalLost = stats?.totalLostItems ?? 0
  const totalFound = stats?.totalFoundItems ?? 0
  const itemsReturned = stats?.itemsReturned ?? 0
  const pendingClaims = stats?.pendingClaims ?? 0

  return (
    <div>
      {/* Bento Metric Cards */}
      <div className="admin-bento-grid">
        <div className="admin-stat-card" onClick={() => navigate('/admin/lost-items')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-top">
            <span className="admin-stat-label">Total Lost Reports</span>
            <div className="admin-stat-icon lost">
              <i className="bi bi-search" />
            </div>
          </div>
          <div>
            <div className="admin-stat-value">{totalLost}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
              Active student reports
            </div>
          </div>
        </div>

        <div className="admin-stat-card" onClick={() => navigate('/admin/found-items')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-top">
            <span className="admin-stat-label">Total Found Reports</span>
            <div className="admin-stat-icon found">
              <i className="bi bi-box-seam" />
            </div>
          </div>
          <div>
            <div className="admin-stat-value">{totalFound}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
              Awaiting verification/claims
            </div>
          </div>
        </div>

        <div className="admin-stat-card" onClick={() => navigate('/admin/return-history')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-top">
            <span className="admin-stat-label">Items Returned</span>
            <div className="admin-stat-icon returned">
              <i className="bi bi-check2-circle" />
            </div>
          </div>
          <div>
            <div className="admin-stat-value">{itemsReturned}</div>
            <div style={{ fontSize: '11px', color: '#059669', marginTop: '6px', fontWeight: 600 }}>
              Successfully reunited
            </div>
          </div>
        </div>

        <div className="admin-stat-card" onClick={() => navigate('/admin/claims')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-top">
            <span className="admin-stat-label">Pending Claims</span>
            <div className="admin-stat-icon claims">
              <i className="bi bi-shield-exclamation" />
            </div>
          </div>
          <div>
            <div className="admin-stat-value">{pendingClaims}</div>
            <div style={{ fontSize: '11px', color: '#d97706', marginTop: '6px', fontWeight: 600 }}>
              Requires admin review
            </div>
          </div>
        </div>
      </div>

      {/* Chart.js Visualizations */}
      <div className="admin-charts-grid">
        {/* Most Common Locations Bar Chart */}
        <div className="admin-chart-card">
          <h2>Most Frequent Locations</h2>
          <p className="subtitle">Campus zones with the highest volume of reported items.</p>
          <div className="chart-canvas-wrap">
            <canvas ref={locationChartRef} />
          </div>
        </div>

        {/* Item Distribution Doughnut Chart */}
        <div className="admin-chart-card">
          <h2>Inventory Breakdown</h2>
          <p className="subtitle">Overall ratio of lost, found, and reunited items.</p>
          <div className="chart-canvas-wrap">
            <canvas ref={statusChartRef} />
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <button className="button primary small" onClick={() => navigate('/admin/claims')}>
          <i className="bi bi-shield-check" /> Review Pending Claims ({pendingClaims})
        </button>
        <button className="button secondary small" onClick={() => navigate('/admin/lost-items')}>
          <i className="bi bi-flag" /> Manage Lost Reports
        </button>
        <button className="button secondary small" onClick={() => navigate('/admin/found-items')}>
          <i className="bi bi-box-seam" /> Manage Found Reports
        </button>
        <button className="button secondary small" onClick={() => navigate('/admin/return-history')}>
          <i className="bi bi-clock-history" /> View Category Return History
        </button>
      </div>
    </div>
  )
}
