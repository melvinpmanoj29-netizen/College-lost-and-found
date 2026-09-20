import { useCallback, useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { getReturnHistory, getAdminHistory } from '../../services/adminService'
import { getErrorMessage } from '../../services/api'
import type { ReturnHistoryStats, AdminItemHistoryDetail } from '../../types/admin'

Chart.register(...registerables)

export default function AdminReturnHistoryPage() {
  const [stats, setStats] = useState<ReturnHistoryStats | null>(null)
  const [historyItems, setHistoryItems] = useState<AdminItemHistoryDetail[]>([])
  const [selectedItem, setSelectedItem] = useState<AdminItemHistoryDetail | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsData, itemsData] = await Promise.all([
        getReturnHistory(),
        getAdminHistory(),
      ])
      setStats(statsData)
      setHistoryItems(itemsData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

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
        <div className="state-desc">Aggregating historical campus returns and resolved item audits.</div>
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

  const filteredHistory = historyItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesQuery =
      !q ||
      item.itemName.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.claimant?.name && item.claimant.name.toLowerCase().includes(q)) ||
      (item.lostReport?.location && item.lostReport.location.toLowerCase().includes(q)) ||
      (item.foundReport?.location && item.foundReport.location.toLowerCase().includes(q))

    const matchesCategory =
      categoryFilter === 'ALL' ||
      (item.category && item.category.toLowerCase() === categoryFilter.toLowerCase())

    return matchesQuery && matchesCategory
  })

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px 0' }}>
          Item History &amp; Resolution Audit
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
          Total items successfully resolved and reunited with verified owners: <strong>{totalReturned} items</strong>
        </p>
      </div>

      {/* Category Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '14px',
          marginBottom: '28px',
        }}
      >
        {categoryCards.map((c) => (
          <div
            key={c.label}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{c.label}</span>
              <i className={`bi ${c.icon}`} style={{ color: c.color, fontSize: '18px' }} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {c.count}
            </div>
          </div>
        ))}
      </div>

      {/* Category Distribution Chart Card */}
      <div className="admin-chart-card" style={{ marginBottom: '28px' }}>
        <h2>Return Volume by Category</h2>
        <p className="subtitle">Breakdown of all completed handoffs recorded in the database.</p>
        <div className="chart-canvas-wrap" style={{ height: '300px' }}>
          <canvas ref={chartRef} />
        </div>
      </div>

      {/* Itemized Resolved Items History Log */}
      <div className="admin-table-card" style={{ marginBottom: '28px' }}>
        <div className="admin-table-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2>Item History Records ({filteredHistory.length})</h2>
            <p className="subtitle" style={{ margin: 0 }}>Full lifecycle log of resolved items and verified handovers.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="input-wrap" style={{ maxWidth: '240px', minWidth: '180px' }}>
              <i className="bi bi-search" />
              <input
                type="text"
                placeholder="Search history…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '13px', padding: '6px 8px 6px 32px' }}
              />
            </div>
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ fontSize: '13px', padding: '6px 10px' }}
            >
              <option value="ALL">All Categories</option>
              {categoryCards.map((c) => (
                <option key={c.label} value={c.label}>{c.label}</option>
              ))}
            </select>
            <button className="button secondary small" onClick={fetchHistory} disabled={loading}>
              <i className="bi bi-arrow-clockwise" /> Refresh
            </button>
          </div>
        </div>

        <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
          {filteredHistory.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <i className="bi bi-check2-circle" style={{ fontSize: '2.4rem', color: '#059669', marginBottom: '8px', display: 'inline-block' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>No resolved item records found matching criteria.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Claimant</th>
                  <th>Lost Reporter</th>
                  <th>Resolved Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.claimId}>
                    <td><strong>#{item.claimId}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.itemName}</div>
                      {item.lostReport?.location && (
                        <small style={{ color: 'var(--color-text-muted)' }}>Lost at: {item.lostReport.location}</small>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}>
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <div>{item.claimant?.name || 'Verified Student'}</div>
                      <small style={{ color: 'var(--color-text-muted)' }}>{item.claimant?.rollNumber || ''}</small>
                    </td>
                    <td>
                      <div>{item.lostReporter?.name || (item.foundReporter?.name ? `Finder: ${item.foundReporter.name}` : 'Student')}</div>
                    </td>
                    <td>{new Date(item.resolvedAt).toLocaleDateString()}</td>
                    <td>
                      <span className="badge found">
                        <i className="bi bi-check-circle-fill" /> RESOLVED
                      </span>
                    </td>
                    <td>
                      <button
                        className="button secondary small"
                        style={{ fontSize: '0.78rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
                        onClick={() => setSelectedItem(item)}
                      >
                        <i className="bi bi-clock-history" /> View Details &amp; Timeline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Item Resolution & Lifecycle Timeline Modal */}
      {selectedItem && (
        <div className="modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-cobalt)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Item Resolution Audit • Claim #{selectedItem.claimId}
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem' }}>{selectedItem.itemName}</h3>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedItem(null)}
                aria-label="Close modal"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Resolution Banner */}
              <div
                style={{
                  padding: '14px 16px',
                  background: 'rgba(5, 150, 105, 0.08)',
                  border: '1px solid rgba(5, 150, 105, 0.25)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#059669', color: '#ffffff', display: 'grid', placeItems: 'center', fontSize: '18px' }}>
                    <i className="bi bi-shield-check" />
                  </div>
                  <div>
                    <strong style={{ color: '#065f46', fontSize: '0.94rem' }}>Status: RESOLVED &amp; RETURNED</strong>
                    <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                      Verified handoff completed on {new Date(selectedItem.resolvedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                {selectedItem.reviewer && (
                  <div style={{ fontSize: '0.78rem', color: '#047857', textAlign: 'right' }}>
                    Verified By: <strong>{selectedItem.reviewer.name}</strong> ({selectedItem.reviewer.role})
                  </div>
                )}
              </div>

              {/* Grid: Lost Report & Found Report Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Lost Report Card */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', background: 'var(--color-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                    <i className="bi bi-flag-fill" style={{ color: '#ef4444' }} />
                    <strong style={{ fontSize: '0.92rem' }}>Lost Report</strong>
                  </div>
                  {selectedItem.lostReport ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>Reported By:</strong> {selectedItem.lostReporter?.name || 'Student'} ({selectedItem.lostReporter?.rollNumber || ''})</div>
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>Lost Date &amp; Time:</strong> {new Date(selectedItem.lostReport.lostDateTime).toLocaleString()}</div>
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>Last Seen Location:</strong> {selectedItem.lostReport.location}</div>
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>Category:</strong> {selectedItem.lostReport.category}</div>
                      {selectedItem.lostReport.color && <div><strong style={{ color: 'var(--color-text-secondary)' }}>Color:</strong> {selectedItem.lostReport.color}</div>}
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>Description:</strong> <span style={{ color: 'var(--color-text-primary)' }}>{selectedItem.lostReport.description}</span></div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>No separate lost report attached (claimed directly from found log).</div>
                  )}
                </div>

                {/* Found Report Card */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', background: 'var(--color-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                    <i className="bi bi-box-seam-fill" style={{ color: '#059669' }} />
                    <strong style={{ fontSize: '0.92rem' }}>Found Report</strong>
                  </div>
                  {selectedItem.foundReport ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>Reported By:</strong> {selectedItem.foundReporter?.name || 'Finder'} ({selectedItem.foundReporter?.rollNumber || ''})</div>
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>Found Date &amp; Time:</strong> {new Date(selectedItem.foundReport.foundDateTime).toLocaleString()}</div>
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>Found Location:</strong> {selectedItem.foundReport.location}</div>
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>Category:</strong> {selectedItem.foundReport.category}</div>
                      {selectedItem.foundReport.color && <div><strong style={{ color: 'var(--color-text-secondary)' }}>Color:</strong> {selectedItem.foundReport.color}</div>}
                      <div><strong style={{ color: 'var(--color-text-secondary)' }}>Description:</strong> <span style={{ color: 'var(--color-text-primary)' }}>{selectedItem.foundReport.description}</span></div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>No separate found report attached.</div>
                  )}
                </div>
              </div>

              {/* Claim & Verification Card */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', background: 'var(--color-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <i className="bi bi-shield-check" style={{ color: 'var(--color-cobalt)' }} />
                  <strong style={{ fontSize: '0.92rem' }}>Ownership Claim &amp; Verification</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '0.84rem', marginBottom: '12px' }}>
                  <div><strong style={{ color: 'var(--color-text-secondary)' }}>Claimed By:</strong> {selectedItem.claimant?.name} ({selectedItem.claimant?.email})</div>
                  <div><strong style={{ color: 'var(--color-text-secondary)' }}>Roll Number:</strong> {selectedItem.claimant?.rollNumber}</div>
                  <div><strong style={{ color: 'var(--color-text-secondary)' }}>Class:</strong> {selectedItem.claimant?.className}</div>
                  <div><strong style={{ color: 'var(--color-text-secondary)' }}>Claim Submitted:</strong> {selectedItem.claimDetail?.createdAt ? new Date(selectedItem.claimDetail.createdAt).toLocaleString() : 'N/A'}</div>
                </div>
                <div style={{ background: 'var(--color-surface-hover)', padding: '12px', borderRadius: '6px', fontSize: '0.84rem' }}>
                  <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>Claimant Verification Answer:</strong>
                  <p style={{ margin: 0, color: 'var(--color-text-primary)', fontStyle: 'italic' }}>
                    "{selectedItem.claimDetail?.verificationAnswer || 'Verification details submitted directly.'}"
                  </p>
                </div>
              </div>

              {/* Visual Chronological Lifecycle Timeline */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', background: 'var(--color-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <i className="bi bi-diagram-3-fill" style={{ color: 'var(--color-cobalt)' }} />
                  <strong style={{ fontSize: '0.92rem' }}>Lifecycle Chronological Timeline</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '24px' }}>
                  {/* Timeline vertical bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      bottom: '8px',
                      left: '8px',
                      width: '2px',
                      background: 'var(--color-border-strong)',
                    }}
                  />

                  {selectedItem.timeline && selectedItem.timeline.length > 0 ? (
                    selectedItem.timeline.map((evt, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        {/* Timeline Node Icon */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '-24px',
                            top: '2px',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: evt.type === 'RESOLVED' || evt.type === 'CLAIM_APPROVED' ? '#059669' : 'var(--color-cobalt)',
                            color: '#ffffff',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '10px',
                          }}
                        >
                          <i className={evt.type === 'RESOLVED' ? 'bi-check-lg' : 'bi-circle-fill'} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px' }}>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>{evt.title}</strong>
                          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                            {new Date(evt.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                          {evt.description}
                        </p>
                        {evt.actorName && (
                          <small style={{ fontSize: '0.74rem', color: 'var(--color-cobalt)', fontWeight: 500 }}>
                            Action by: {evt.actorName} ({evt.actorRole})
                          </small>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Timeline events recorded.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="button secondary" onClick={() => setSelectedItem(null)}>
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
