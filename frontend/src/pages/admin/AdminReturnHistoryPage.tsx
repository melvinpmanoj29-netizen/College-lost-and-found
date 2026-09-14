import { useCallback, useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { getReturnHistory } from '../../services/adminService'
import { getErrorMessage } from '../../services/api'
import type { ReturnHistoryStats } from '../../types/admin'

Chart.register(...registerables)

export default function AdminReturnHistoryPage() {
  const [stats, setStats] = useState<ReturnHistoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getReturnHistory()
      setStats(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getReturnHistory()
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

  useEffect(() => {
    if (!stats || !chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const categories = [
      { label: 'Wallets', count: stats.walletsReturned, color: '#2563eb' },
      { label: 'ID Cards', count: stats.idCardsReturned, color: '#059669' },
      { label: 'Phones', count: stats.phonesReturned, color: '#7c3aed' },
      { label: 'Keys', count: stats.keysReturned, color: '#d97706' },
      { label: 'Bags', count: stats.bagsReturned, color: '#db2777' },
      { label: 'Documents', count: stats.docsReturned, color: '#0891b2' },
      { label: 'Others', count: stats.othersReturned, color: '#64748b' },
    ]

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: categories.map((c) => c.label),
        datasets: [
          {
            label: 'Items Returned',
            data: categories.map((c) => c.count),
            backgroundColor: categories.map((c) => c.color),
            borderRadius: 6,
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
              label: (ctx) => ` Successfully Reunited: ${ctx.parsed.y} items`,
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

    return () => {
      chartInstance.current?.destroy()
    }
  }, [stats])

  if (loading) {
    return (
      <div className="state-container">
        <div className="loader-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
        <div className="state-title" style={{ marginTop: '16px' }}>Loading Return History...</div>
        <div className="state-desc">Aggregating historical campus returns from approved claims.</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="state-container">
        <div className="state-icon error">
          <i className="bi bi-exclamation-circle" />
        </div>
        <div className="state-title">Failed to load return history</div>
        <div className="state-desc">{error}</div>
        <button className="button primary small" onClick={fetchHistory}>
          <i className="bi bi-arrow-clockwise" /> Try Again
        </button>
      </div>
    )
  }

  const s = stats || {
    bagsReturned: 0,
    phonesReturned: 0,
    idCardsReturned: 0,
    walletsReturned: 0,
    keysReturned: 0,
    docsReturned: 0,
    othersReturned: 0,
  }

  const totalReturned =
    s.bagsReturned +
    s.phonesReturned +
    s.idCardsReturned +
    s.walletsReturned +
    s.keysReturned +
    s.docsReturned +
    s.othersReturned

  const categoryCards = [
    { label: 'Wallets', count: s.walletsReturned, icon: 'bi-wallet2', color: '#2563eb' },
    { label: 'ID Cards', count: s.idCardsReturned, icon: 'bi-person-badge', color: '#059669' },
    { label: 'Phones & Tech', count: s.phonesReturned, icon: 'bi-phone', color: '#7c3aed' },
    { label: 'Keys', count: s.keysReturned, icon: 'bi-key', color: '#d97706' },
    { label: 'Bags & Backpacks', count: s.bagsReturned, icon: 'bi-backpack2', color: '#db2777' },
    { label: 'Documents', count: s.docsReturned, icon: 'bi-file-earmark-text', color: '#0891b2' },
    { label: 'Other Items', count: s.othersReturned, icon: 'bi-box-seam', color: '#64748b' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px 0' }}>
          Historical Returns by Category
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
          Total items reunited with their verified owners: <strong>{totalReturned} items</strong>
        </p>
      </div>

      {/* Category Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '28px',
        }}
      >
        {categoryCards.map((c) => (
          <div
            key={c.label}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{c.label}</span>
              <i className={`bi ${c.icon}`} style={{ color: c.color, fontSize: '18px' }} />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#0f172a' }}>
              {c.count}
            </div>
          </div>
        ))}
      </div>

      {/* Category Distribution Chart Card */}
      <div className="admin-chart-card" style={{ marginBottom: '28px' }}>
        <h2>Return Volume by Category</h2>
        <p className="subtitle">Breakdown of all completed handoffs recorded in the database.</p>
        <div className="chart-canvas-wrap" style={{ height: '320px' }}>
          <canvas ref={chartRef} />
        </div>
      </div>

      {/* Summary Table */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>Detailed Category Breakdown</h2>
          <button className="button secondary small" onClick={fetchHistory} disabled={loading}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Reunited</th>
                <th>Percentage of All Returns</th>
              </tr>
            </thead>
            <tbody>
              {categoryCards.map((c) => {
                const pct = totalReturned > 0 ? Math.round((c.count / totalReturned) * 100) : 0
                return (
                  <tr key={c.label}>
                    <td>
                      <i className={`bi ${c.icon}`} style={{ color: c.color, marginRight: '8px' }} />
                      <strong>{c.label}</strong>
                    </td>
                    <td>{c.count} items</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '100px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: c.color }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
