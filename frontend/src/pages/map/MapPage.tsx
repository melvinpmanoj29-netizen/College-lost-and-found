import { useCallback, useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { getMapItems } from '../../services/mapService'
import { getErrorMessage } from '../../services/api'
import type { MapItem } from '../../types/map'

// Default college campus coordinates fallback (e.g. standard campus center)
const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946]
const DEFAULT_ZOOM = 16

function isValidCoordinate(lat?: number, lng?: number): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false
  if (isNaN(lat) || isNaN(lng)) return false
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

function createMarkerIcon(item: MapItem): L.DivIcon {
  const isLost = item.type === 'LOST'
  const isUrgent = item.isUrgent

  let pinClasses = `custom-leaflet-pin ${isLost ? 'lost' : 'found'}`
  if (isUrgent) pinClasses += ' urgent'

  const iconName = isUrgent
    ? 'bi-exclamation-triangle-fill'
    : isLost
    ? 'bi-search'
    : 'bi-box-seam'

  return L.divIcon({
    className: 'custom-leaflet-pin-wrapper',
    html: `<div class="${pinClasses}"><i class="bi ${iconName}"></i></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  })
}

export default function MapPage() {
  const [items, setItems] = useState<MapItem[]>([])
  const [filter, setFilter] = useState<'ALL' | 'LOST' | 'FOUND' | 'URGENT'>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)

  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<number, L.Marker>>(new Map())

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMapItems()
      setItems(data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getMapItems()
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

  // Initialize the Leaflet map once the DOM container is ready
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Filter valid items
  const validItems = items.filter((item) => isValidCoordinate(item.latitude, item.longitude))

  const displayedItems = validItems.filter((item) => {
    if (filter === 'LOST') return item.type === 'LOST'
    if (filter === 'FOUND') return item.type === 'FOUND'
    if (filter === 'URGENT') return item.isUrgent
    return true
  })

  // Update map markers when displayedItems or map changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    if (displayedItems.length === 0) return

    const bounds = L.latLngBounds([])

    displayedItems.forEach((item) => {
      const icon = createMarkerIcon(item)
      const marker = L.marker([item.latitude, item.longitude], { icon }).addTo(map)

      const isLost = item.type === 'LOST'
      const badgeClass = isLost ? 'badge-lost' : 'badge-found'

      const popupHtml = `
        <div class="map-popup-card">
          <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 6px;">
            <span class="${badgeClass}">${item.type}</span>
            ${item.isUrgent ? '<span class="badge-urgent">URGENT</span>' : ''}
          </div>
          <h4>${item.itemName}</h4>
          <p><i class="bi bi-geo-alt"></i> ${item.location || 'Campus'}</p>
        </div>
      `

      marker.bindPopup(popupHtml)
      marker.on('click', () => {
        setSelectedItemId(item.id)
      })

      markersRef.current.set(item.id, marker)
      bounds.extend([item.latitude, item.longitude])
    })

    // Fit map bounds to show all markers if bounds are valid
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 })
    }
  }, [displayedItems])

  const handleSelectItem = (item: MapItem) => {
    setSelectedItemId(item.id)
    const map = mapInstanceRef.current
    const marker = markersRef.current.get(item.id)

    if (map && marker) {
      map.setView([item.latitude, item.longitude], 18, { animate: true })
      marker.openPopup()
    }
  }

  return (
    <div className="map-page page-width">
      <div className="map-page-header">
        <div>
          <span className="eyebrow">
            <i className="bi bi-map" /> CAMPUS GEOGRAPHY
          </span>
          <h1>Campus Lost &amp; Found Map</h1>
          <p>Explore reported items by geographic campus location using OpenStreetMap.</p>
        </div>
        <button className="button secondary small" onClick={fetchItems} disabled={loading}>
          <i className="bi bi-arrow-clockwise" /> Refresh Markers
        </button>
      </div>

      {/* Error state if API fails */}
      {error && (
        <div className="state-container" style={{ margin: '0 0 20px 0', padding: '24px' }}>
          <div className="state-icon error" style={{ width: '40px', height: '40px', fontSize: '20px' }}>
            <i className="bi bi-exclamation-circle" />
          </div>
          <div className="state-title" style={{ fontSize: '15px' }}>Failed to load map data</div>
          <div className="state-desc" style={{ fontSize: '13px' }}>{error}</div>
          <button className="button primary small" onClick={fetchItems}>
            <i className="bi bi-arrow-clockwise" /> Retry
          </button>
        </div>
      )}

      {/* Map and Sidebar Grid */}
      <div className="map-layout-container">
        {/* Map Canvas */}
        <div className="map-canvas-wrapper">
          {/* Floating Filter Controls */}
          <div className="map-controls-floating">
            <button
              className={`map-filter-btn ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All ({validItems.length})
            </button>
            <button
              className={`map-filter-btn ${filter === 'LOST' ? 'active' : ''}`}
              onClick={() => setFilter('LOST')}
            >
              Lost ({validItems.filter((i) => i.type === 'LOST').length})
            </button>
            <button
              className={`map-filter-btn ${filter === 'FOUND' ? 'active' : ''}`}
              onClick={() => setFilter('FOUND')}
            >
              Found ({validItems.filter((i) => i.type === 'FOUND').length})
            </button>
            <button
              className={`map-filter-btn ${filter === 'URGENT' ? 'active' : ''}`}
              onClick={() => setFilter('URGENT')}
            >
              Urgent ({validItems.filter((i) => i.isUrgent).length})
            </button>
          </div>

          {/* Leaflet DOM container */}
          <div ref={mapContainerRef} className="map-inner" />
        </div>

        {/* Sidebar Listing */}
        <div className="map-sidebar">
          <div className="map-sidebar-head">
            <h2>Campus Markers ({displayedItems.length})</h2>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Click to focus</span>
          </div>

          <div className="map-sidebar-list">
            {loading && (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '13px' }}>
                <div className="loader-spinner" style={{ marginBottom: '8px' }} />
                <div>Loading coordinates...</div>
              </div>
            )}

            {!loading && displayedItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 16px', color: '#64748b', fontSize: '13px' }}>
                <i className="bi bi-geo-alt" style={{ fontSize: '28px', color: '#94a3b8', display: 'block', marginBottom: '8px' }} />
                No mapped items match your active filter.
              </div>
            )}

            {!loading &&
              displayedItems.map((item) => {
                const isSelected = selectedItemId === item.id
                return (
                  <button
                    key={item.id}
                    className={`map-item-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectItem(item)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={item.type === 'LOST' ? 'badge-lost' : 'badge-found'}>
                        {item.type}
                      </span>
                      {item.isUrgent && <span className="badge-urgent">URGENT</span>}
                    </div>
                    <strong>{item.itemName}</strong>
                    <span>
                      <i className="bi bi-geo-alt" /> {item.location}
                    </span>
                  </button>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
