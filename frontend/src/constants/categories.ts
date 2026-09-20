/**
 * Standardized Categories and Locations configuration.
 * Single source of truth for Lost & Found item forms, search filters, smart matching, and admin configuration.
 */

export interface CategoryItem {
  id: string
  name: string
  icon: string
  active: boolean
  description?: string
}

export interface LocationItem {
  id: string
  name: string
  active: boolean
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'wallet', name: 'Wallet', icon: 'bi-wallet2', active: true, description: 'Wallets, coin pouches, cardholders' },
  { id: 'keys', name: 'Keys', icon: 'bi-key', active: true, description: 'Room keys, vehicle keys, keychains' },
  { id: 'phone', name: 'Phone', icon: 'bi-phone', active: true, description: 'Smartphones, mobile devices' },
  { id: 'id-card', name: 'ID Card', icon: 'bi-person-badge', active: true, description: 'College ID cards, library cards, driver licenses' },
  { id: 'bag', name: 'Bag', icon: 'bi-backpack2', active: true, description: 'Backpacks, laptop bags, handbags, pouches' },
  { id: 'books', name: 'Books', icon: 'bi-book', active: true, description: 'Textbooks, notebooks, study materials' },
  { id: 'electronics', name: 'Electronics', icon: 'bi-laptop', active: true, description: 'Laptops, calculators, headphones, chargers' },
  { id: 'documents', name: 'Documents', icon: 'bi-file-earmark-text', active: true, description: 'Certificates, project files, official papers' },
  { id: 'clothing', name: 'Clothing & Accessories', icon: 'bi-sunglasses', active: true, description: 'Jackets, watches, glasses, umbrellas' },
  { id: 'water-bottle', name: 'Water Bottles', icon: 'bi-cup-straw', active: true, description: 'Thermos, water bottles, lunch boxes' },
  { id: 'other', name: 'Other', icon: 'bi-box-seam', active: true, description: 'Any other miscellaneous items' },
]

export const DEFAULT_CAMPUS_LOCATIONS: LocationItem[] = [
  { id: 'library', name: 'Central Library', active: true },
  { id: 'academic-block', name: 'Main Academic Block', active: true },
  { id: 'canteen', name: 'Campus Canteen', active: true },
  { id: 'computer-labs', name: 'Computer Labs', active: true },
  { id: 'science-block', name: 'Science Block', active: true },
  { id: 'mech-block', name: 'Mechanical Block', active: true },
  { id: 'civil-block', name: 'Civil Block', active: true },
  { id: 'eee-ece-block', name: 'EEE / ECE Block', active: true },
  { id: 'auditorium', name: 'College Auditorium', active: true },
  { id: 'sports-ground', name: 'Sports Ground / Indoor Stadium', active: true },
  { id: 'mens-hostel', name: "Men's Hostel", active: true },
  { id: 'ladies-hostel', name: 'Ladies Hostel', active: true },
  { id: 'admin-block', name: 'Administrative Block', active: true },
  { id: 'parking-gate', name: 'Main Entrance & Parking', active: true },
  { id: 'other-location', name: 'Other', active: true },
]

const CATEGORY_STORAGE_KEY = 'college_lf_categories_config'
const LOCATION_STORAGE_KEY = 'college_lf_locations_config'

/**
 * Get configured categories (with fallback to default categories).
 */
export function getConfiguredCategories(): CategoryItem[] {
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CategoryItem[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // ignore parse error and fallback
  }
  return DEFAULT_CATEGORIES
}

/**
 * Save configured categories to storage.
 */
export function saveConfiguredCategories(categories: CategoryItem[]): void {
  try {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories))
    window.dispatchEvent(new Event('categories-updated'))
  } catch {
    // storage not available
  }
}

/**
 * Get active category names list for dropdowns.
 */
export function getActiveCategoryNames(): string[] {
  return getConfiguredCategories()
    .filter((c) => c.active)
    .map((c) => c.name)
}

/**
 * Get configured locations (with fallback to default locations).
 */
export function getConfiguredLocations(): LocationItem[] {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as LocationItem[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // ignore parse error and fallback
  }
  return DEFAULT_CAMPUS_LOCATIONS
}

/**
 * Save configured locations to storage.
 */
export function saveConfiguredLocations(locations: LocationItem[]): void {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locations))
    window.dispatchEvent(new Event('locations-updated'))
  } catch {
    // storage not available
  }
}

/**
 * Get active campus location names list for dropdowns.
 */
export function getActiveLocationNames(): string[] {
  return getConfiguredLocations()
    .filter((l) => l.active)
    .map((l) => l.name)
}

/**
 * Helper to determine category icon based on category name.
 */
export function getCategoryIcon(categoryName?: string): string {
  if (!categoryName) return 'bi-box-seam'
  const c = categoryName.toLowerCase()
  if (c.includes('wallet') || c.includes('purse')) return 'bi-wallet2'
  if (c.includes('key')) return 'bi-key'
  if (c.includes('phone') || c.includes('mobile')) return 'bi-phone'
  if (c.includes('id') || c.includes('card') || c.includes('badge')) return 'bi-person-badge'
  if (c.includes('bag') || c.includes('backpack')) return 'bi-backpack2'
  if (c.includes('book') || c.includes('notebook')) return 'bi-book'
  if (c.includes('electronic') || c.includes('laptop') || c.includes('charger') || c.includes('calculator')) return 'bi-laptop'
  if (c.includes('doc') || c.includes('paper') || c.includes('certificate')) return 'bi-file-earmark-text'
  if (c.includes('cloth') || c.includes('wear') || c.includes('glasses') || c.includes('watch')) return 'bi-sunglasses'
  if (c.includes('bottle') || c.includes('cup') || c.includes('flask')) return 'bi-cup-straw'
  return 'bi-box-seam'
}

/**
 * Pre-defined category and campus location lists for direct array imports.
 */
export const STANDARD_CATEGORIES: string[] = DEFAULT_CATEGORIES.map((c) => c.name)
export const CAMPUS_LOCATIONS: string[] = DEFAULT_CAMPUS_LOCATIONS.map((l) => l.name)
