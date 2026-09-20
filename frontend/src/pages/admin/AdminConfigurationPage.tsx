import { useEffect, useState } from 'react'
import {
  getConfiguredCategories,
  saveConfiguredCategories,
  getConfiguredLocations,
  saveConfiguredLocations,
  DEFAULT_CATEGORIES,
  DEFAULT_CAMPUS_LOCATIONS,
  type CategoryItem,
  type LocationItem,
} from '../../constants/categories'

export default function AdminConfigurationPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [activeTab, setActiveTab] = useState<'categories' | 'locations'>('categories')

  // Modals / forms state
  const [showAddCatModal, setShowAddCatModal] = useState(false)
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('bi-box-seam')
  const [newCatDesc, setNewCatDesc] = useState('')

  const [showAddLocModal, setShowAddLocModal] = useState(false)
  const [editingLoc, setEditingLoc] = useState<LocationItem | null>(null)
  const [newLocName, setNewLocName] = useState('')

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setCategories(getConfiguredCategories())
    setLocations(getConfiguredLocations())
  }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message })
    window.setTimeout(() => setFeedback(null), 4000)
  }

  // Categories Handlers
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newCatName.trim()
    if (!name) {
      showToast('Category name is required.', 'error')
      return
    }

    // Check duplicate
    const isDup = categories.some(
      (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== editingCat?.id
    )
    if (isDup) {
      showToast('A category with this name already exists.', 'error')
      return
    }

    if (editingCat) {
      const updated = categories.map((c) =>
        c.id === editingCat.id
          ? { ...c, name, icon: newCatIcon, description: newCatDesc.trim() || undefined }
          : c
      )
      setCategories(updated)
      saveConfiguredCategories(updated)
      showToast(`Category "${name}" updated successfully.`)
    } else {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
      const newCat: CategoryItem = {
        id,
        name,
        icon: newCatIcon,
        active: true,
        description: newCatDesc.trim() || undefined,
      }
      const updated = [...categories, newCat]
      setCategories(updated)
      saveConfiguredCategories(updated)
      showToast(`Category "${name}" added successfully.`)
    }

    closeCategoryModal()
  }

  const handleToggleCategoryActive = (cat: CategoryItem) => {
    const updated = categories.map((c) => (c.id === cat.id ? { ...c, active: !c.active } : c))
    setCategories(updated)
    saveConfiguredCategories(updated)
    showToast(`Category "${cat.name}" is now ${!cat.active ? 'active' : 'disabled'}.`)
  }

  const handleResetCategories = () => {
    if (window.confirm('Reset categories back to institutional defaults?')) {
      setCategories(DEFAULT_CATEGORIES)
      saveConfiguredCategories(DEFAULT_CATEGORIES)
      showToast('Categories reset to standard defaults.')
    }
  }

  const openEditCategory = (cat: CategoryItem) => {
    setEditingCat(cat)
    setNewCatName(cat.name)
    setNewCatIcon(cat.icon || 'bi-box-seam')
    setNewCatDesc(cat.description || '')
    setShowAddCatModal(true)
  }

  const closeCategoryModal = () => {
    setShowAddCatModal(false)
    setEditingCat(null)
    setNewCatName('')
    setNewCatIcon('bi-box-seam')
    setNewCatDesc('')
  }

  // Locations Handlers
  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newLocName.trim()
    if (!name) {
      showToast('Location name is required.', 'error')
      return
    }

    const isDup = locations.some(
      (l) => l.name.toLowerCase() === name.toLowerCase() && l.id !== editingLoc?.id
    )
    if (isDup) {
      showToast('A campus location with this name already exists.', 'error')
      return
    }

    if (editingLoc) {
      const updated = locations.map((l) => (l.id === editingLoc.id ? { ...l, name } : l))
      setLocations(updated)
      saveConfiguredLocations(updated)
      showToast(`Location "${name}" updated successfully.`)
    } else {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
      const newLoc: LocationItem = { id, name, active: true }
      const updated = [...locations, newLoc]
      setLocations(updated)
      saveConfiguredLocations(updated)
      showToast(`Campus location "${name}" added successfully.`)
    }

    closeLocationModal()
  }

  const handleToggleLocationActive = (loc: LocationItem) => {
    const updated = locations.map((l) => (l.id === loc.id ? { ...l, active: !l.active } : l))
    setLocations(updated)
    saveConfiguredLocations(updated)
    showToast(`Location "${loc.name}" is now ${!loc.active ? 'active' : 'disabled'}.`)
  }

  const handleResetLocations = () => {
    if (window.confirm('Reset campus locations back to institutional defaults?')) {
      setLocations(DEFAULT_CAMPUS_LOCATIONS)
      saveConfiguredLocations(DEFAULT_CAMPUS_LOCATIONS)
      showToast('Campus locations reset to standard defaults.')
    }
  }

  const openEditLocation = (loc: LocationItem) => {
    setEditingLoc(loc)
    setNewLocName(loc.name)
    setShowAddLocModal(true)
  }

  const closeLocationModal = () => {
    setShowAddLocModal(false)
    setEditingLoc(null)
    setNewLocName('')
  }

  // Filtered lists
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredLocations = locations.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const iconOptions = [
    { label: 'Wallet / Purse', value: 'bi-wallet2' },
    { label: 'Keys', value: 'bi-key' },
    { label: 'Smartphone / Mobile', value: 'bi-phone' },
    { label: 'ID Card / Badge', value: 'bi-person-badge' },
    { label: 'Backpack / Bag', value: 'bi-backpack2' },
    { label: 'Book / Notebook', value: 'bi-book' },
    { label: 'Laptop / Gadget', value: 'bi-laptop' },
    { label: 'Official Documents', value: 'bi-file-earmark-text' },
    { label: 'Clothing / Wearables', value: 'bi-sunglasses' },
    { label: 'Water Bottle / Cup', value: 'bi-cup-straw' },
    { label: 'Headphones / Audio', value: 'bi-headphones' },
    { label: 'Generic Item', value: 'bi-box-seam' },
  ]

  return (
    <div className="admin-page-container">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`alert-banner ${feedback.type === 'error' ? '' : 'success'}`}
          style={{ marginBottom: '20px' }}
        >
          <i className={`bi ${feedback.type === 'error' ? 'bi-exclamation-circle' : 'bi-check-circle'}`} />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="admin-page-head" style={{ marginBottom: '24px' }}>
        <div>
          <span className="eyebrow">
            <i className="bi bi-sliders" /> INSTITUTIONAL CONFIGURATION
          </span>
          <h1>Form Options &amp; Categories</h1>
          <p>
            Manage configurable categories and campus locations available across student and admin
            report forms.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'categories' ? (
            <>
              <button className="button secondary small" onClick={handleResetCategories}>
                <i className="bi bi-arrow-counterclockwise" /> Reset Defaults
              </button>
              <button className="button primary small" onClick={() => setShowAddCatModal(true)}>
                <i className="bi bi-plus-lg" /> Add Category
              </button>
            </>
          ) : (
            <>
              <button className="button secondary small" onClick={handleResetLocations}>
                <i className="bi bi-arrow-counterclockwise" /> Reset Defaults
              </button>
              <button className="button primary small" onClick={() => setShowAddLocModal(true)}>
                <i className="bi bi-plus-lg" /> Add Location
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navigation Subtabs & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div className="form-tabs" style={{ margin: 0 }}>
          <button
            type="button"
            className={activeTab === 'categories' ? 'active' : ''}
            onClick={() => {
              setActiveTab('categories')
              setSearchQuery('')
            }}
          >
            <i className="bi bi-tags-fill" /> Item Categories ({categories.length})
          </button>
          <button
            type="button"
            className={activeTab === 'locations' ? 'active' : ''}
            onClick={() => {
              setActiveTab('locations')
              setSearchQuery('')
            }}
          >
            <i className="bi bi-geo-alt-fill" /> Campus Locations ({locations.length})
          </button>
        </div>

        <div className="search-input-wrap" style={{ maxWidth: '280px', width: '100%' }}>
          <i className="bi bi-search" />
          <input
            type="text"
            placeholder={`Filter ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* CATEGORIES TABLE */}
      {activeTab === 'categories' && (
        <div className="table-responsive-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Icon</th>
                <th>Category Name</th>
                <th>Description</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No categories found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} style={{ opacity: cat.active ? 1 : 0.6 }}>
                    <td>
                      <span className="item-icon-box blue" style={{ width: '36px', height: '36px', fontSize: '16px' }}>
                        <i className={`bi ${cat.icon || 'bi-box-seam'}`} />
                      </span>
                    </td>
                    <td>
                      <strong>{cat.name}</strong>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                      {cat.description || 'Standard category'}
                    </td>
                    <td>
                      <span className={`status-badge ${cat.active ? 'status-found' : 'status-returned'}`}>
                        {cat.active ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="button secondary small"
                          title="Edit Category"
                          onClick={() => openEditCategory(cat)}
                          style={{ padding: '4px 10px' }}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className={`button ${cat.active ? 'secondary' : 'primary'} small`}
                          title={cat.active ? 'Disable from new dropdowns' : 'Enable in dropdowns'}
                          onClick={() => handleToggleCategoryActive(cat)}
                          style={{ padding: '4px 10px' }}
                        >
                          <i className={`bi ${cat.active ? 'bi-eye-slash' : 'bi-eye'}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* LOCATIONS TABLE */}
      {activeTab === 'locations' && (
        <div className="table-responsive-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Pin</th>
                <th>Campus Location</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No campus locations found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredLocations.map((loc) => (
                  <tr key={loc.id} style={{ opacity: loc.active ? 1 : 0.6 }}>
                    <td>
                      <span className="item-icon-box green" style={{ width: '36px', height: '36px', fontSize: '16px' }}>
                        <i className="bi bi-geo-alt-fill" />
                      </span>
                    </td>
                    <td>
                      <strong>{loc.name}</strong>
                    </td>
                    <td>
                      <span className={`status-badge ${loc.active ? 'status-found' : 'status-returned'}`}>
                        {loc.active ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="button secondary small"
                          title="Edit Location"
                          onClick={() => openEditLocation(loc)}
                          style={{ padding: '4px 10px' }}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className={`button ${loc.active ? 'secondary' : 'primary'} small`}
                          title={loc.active ? 'Disable from new dropdowns' : 'Enable in dropdowns'}
                          onClick={() => handleToggleLocationActive(loc)}
                          style={{ padding: '4px 10px' }}
                        >
                          <i className={`bi ${loc.active ? 'bi-eye-slash' : 'bi-eye'}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD / EDIT CATEGORY MODAL */}
      {showAddCatModal && (
        <div className="admin-modal-overlay" onClick={closeCategoryModal}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>{editingCat ? 'Edit Category' : 'Add Item Category'}</h3>
              <button className="icon-button" onClick={closeCategoryModal}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="form-field" style={{ marginBottom: '16px' }}>
                <label>
                  Category Name <span className="req">*</span>
                  <input
                    type="text"
                    placeholder="e.g. Scientific Calculators, Sports Gear"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                    autoFocus
                  />
                </label>
              </div>

              <div className="form-field" style={{ marginBottom: '16px' }}>
                <label>
                  Category Icon
                  <select value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)}>
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-field" style={{ marginBottom: '20px' }}>
                <label>
                  Description <small>(Optional helper text)</small>
                  <input
                    type="text"
                    placeholder="Brief description of items in this category"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                  />
                </label>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="button secondary" onClick={closeCategoryModal}>
                  Cancel
                </button>
                <button type="submit" className="button primary">
                  <i className="bi bi-check-lg" /> {editingCat ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT LOCATION MODAL */}
      {showAddLocModal && (
        <div className="admin-modal-overlay" onClick={closeLocationModal}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>{editingLoc ? 'Edit Campus Location' : 'Add Campus Location'}</h3>
              <button className="icon-button" onClick={closeLocationModal}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation}>
              <div className="form-field" style={{ marginBottom: '20px' }}>
                <label>
                  Campus Location Name <span className="req">*</span>
                  <input
                    type="text"
                    placeholder="e.g. Decennial Block, Placement Cell, Cafeteria Annex"
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    required
                    autoFocus
                  />
                </label>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="button secondary" onClick={closeLocationModal}>
                  Cancel
                </button>
                <button type="submit" className="button primary">
                  <i className="bi bi-check-lg" /> {editingLoc ? 'Save Changes' : 'Add Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
