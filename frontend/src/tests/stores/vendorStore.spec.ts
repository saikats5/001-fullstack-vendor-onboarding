import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useVendorStore } from '../../stores/vendorStore'
import { VendorService } from '../../services/VendorService'
import type { Vendor } from '../../types/Vendor'

vi.mock('../../services/VendorService', () => ({
  VendorService: {
    getVendors: vi.fn(),
    createVendor: vi.fn(),
    deleteVendor: vi.fn(),
    checkEmailExists: vi.fn(),
    exportToCSV: vi.fn(),
  },
}))

vi.mock('../../composables/useToast', () => ({
  useToast: () => ({
    show: vi.fn(),
    remove: vi.fn(),
    toasts: { value: [] },
  }),
}))

describe('VendorStore', () => {
  const mockVendors: Vendor[] = [
    {
      id: 1,
      name: 'Test Company 1',
      contact_person: 'John Test',
      email: 'john@testcompany.com',
      partner_type: 'Supplier',
    },
    {
      id: 2,
      name: 'Test Company 2',
      contact_person: 'Jane Test',
      email: 'jane@testcompany.com',
      partner_type: 'Partner',
    },
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(VendorService.getVendors).mockReset()
    vi.mocked(VendorService.createVendor).mockReset()
    vi.mocked(VendorService.deleteVendor).mockReset()
    vi.mocked(VendorService.checkEmailExists).mockReset()
  })

  // ============================================
  // INITIAL STATE
  // ============================================
  it('has correct initial state', () => {
    const store = useVendorStore()
    expect(store.vendors).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
    expect(store.searchQuery).toBe('')
    expect(store.debouncedQuery).toBe('')
    expect(store.sortField).toBe('id')
    expect(store.sortDirection).toBe('desc')
    expect(store.currentPage).toBe(1)
    expect(store.pageSize).toBe(10)
  })

  // ============================================
  // FETCH VENDORS
  // ============================================
  describe('fetchVendors', () => {
    it('loads vendors and clears loading/error state', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
      const store = useVendorStore()
      await store.fetchVendors()
      expect(store.vendors).toEqual(mockVendors)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('sets loading to true during fetch', async () => {
      let resolve: (v: Vendor[]) => void = () => {}
      vi.mocked(VendorService.getVendors).mockReturnValue(
        new Promise((r) => {
          resolve = r
        }),
      )
      const store = useVendorStore()
      const promise = store.fetchVendors()
      expect(store.loading).toBe(true)
      resolve(mockVendors)
      await promise
      expect(store.loading).toBe(false)
    })

    it('sets error message on failure', async () => {
      vi.mocked(VendorService.getVendors).mockRejectedValue(
        new Error('Network error'),
      )
      const store = useVendorStore()
      await store.fetchVendors()
      expect(store.loading).toBe(false)
      expect(store.error).toBe('Failed to load vendors. Please try again.')
      expect(store.vendors).toEqual([])
    })
  })

  // ============================================
  // ADD VENDOR
  // ============================================
  describe('addVendor', () => {
    const newVendor: Vendor = {
      name: 'New Company',
      contact_person: 'New Person',
      email: 'new@company.com',
      partner_type: 'Supplier',
    }

    it('calls createVendor and refreshes list on success', async () => {
      vi.mocked(VendorService.createVendor).mockResolvedValue({
        ...newVendor,
        id: 3,
      })
      vi.mocked(VendorService.getVendors).mockResolvedValue([
        ...mockVendors,
        { ...newVendor, id: 3 },
      ])
      const store = useVendorStore()
      await store.addVendor(newVendor)
      expect(VendorService.createVendor).toHaveBeenCalledWith(newVendor)
      expect(VendorService.getVendors).toHaveBeenCalled()
      expect(store.vendors.length).toBe(3)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('sets error and throws on failure', async () => {
      vi.mocked(VendorService.createVendor).mockRejectedValue(
        new Error('API error'),
      )
      const store = useVendorStore()
      await expect(store.addVendor(newVendor)).rejects.toThrow()
      expect(store.loading).toBe(false)
      expect(store.error).toBe('Failed to add vendor. Please try again.')
    })
  })

  // ============================================
  // DELETE VENDOR
  // ============================================
  describe('deleteVendor', () => {
    it('removes vendor from local state on success', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
      vi.mocked(VendorService.deleteVendor).mockResolvedValue(undefined)
      const store = useVendorStore()
      await store.fetchVendors()
      expect(store.vendors.length).toBe(2)
      await store.deleteVendor(1)
      expect(VendorService.deleteVendor).toHaveBeenCalledWith('1')
      expect(store.vendors.length).toBe(1)
      expect(store.vendors.find((v) => v.id === 1)).toBeUndefined()
      expect(store.loading).toBe(false)
    })

    it('sets error and throws on failure', async () => {
      vi.mocked(VendorService.deleteVendor).mockRejectedValue(
        new Error('Delete failed'),
      )
      const store = useVendorStore()
      await expect(store.deleteVendor(1)).rejects.toThrow()
      expect(store.error).toBe('Failed to delete vendor. Please try again.')
      expect(store.loading).toBe(false)
    })
  })

  // ============================================
  // SORT
  // ============================================
  describe('setSort', () => {
    it('sets sort field and defaults to asc on first click', () => {
      const store = useVendorStore()
      store.setSort('name')
      expect(store.sortField).toBe('name')
      expect(store.sortDirection).toBe('asc')
    })

    it('toggles direction when same field is clicked again', () => {
      const store = useVendorStore()
      store.setSort('name')
      expect(store.sortDirection).toBe('asc')
      store.setSort('name')
      expect(store.sortDirection).toBe('desc')
      store.setSort('name')
      expect(store.sortDirection).toBe('asc')
    })

    it('resets to asc when switching to a different field', () => {
      const store = useVendorStore()
      store.setSort('name')
      store.setSort('name')
      expect(store.sortDirection).toBe('desc')
      store.setSort('email')
      expect(store.sortField).toBe('email')
      expect(store.sortDirection).toBe('asc')
    })
  })

  // ============================================
  // FILTERED VENDORS (search + sort)
  // ============================================
  describe('filteredVendors', () => {
    beforeEach(async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
      const store = useVendorStore()
      await store.fetchVendors()
    })

    it('returns all vendors when no search query', () => {
      const store = useVendorStore()
      expect(store.filteredVendors.length).toBe(2)
    })

    it('filters by name using debouncedQuery', async () => {
      const store = useVendorStore()
      store.debouncedQuery = 'Test Company 1'
      expect(store.filteredVendors.length).toBe(1)
      expect(store.filteredVendors[0].name).toBe('Test Company 1')
    })

    it('filters by email case-insensitively', () => {
      const store = useVendorStore()
      store.debouncedQuery = 'JANE@TESTCOMPANY'
      expect(store.filteredVendors.length).toBe(1)
      expect(store.filteredVendors[0].id).toBe(2)
    })

    it('filters by partner_type', () => {
      const store = useVendorStore()
      store.debouncedQuery = 'Supplier'
      expect(store.filteredVendors.length).toBe(1)
      expect(store.filteredVendors[0].partner_type).toBe('Supplier')
    })

    it('returns empty array when no matches', () => {
      const store = useVendorStore()
      store.debouncedQuery = 'nonexistentxyz'
      expect(store.filteredVendors.length).toBe(0)
    })

    it('sorts by name ascending', () => {
      const store = useVendorStore()
      store.setSort('name')
      expect(store.filteredVendors[0].name).toBe('Test Company 1')
      expect(store.filteredVendors[1].name).toBe('Test Company 2')
    })

    it('sorts by name descending', () => {
      const store = useVendorStore()
      store.setSort('name')
      store.setSort('name')
      expect(store.filteredVendors[0].name).toBe('Test Company 2')
      expect(store.filteredVendors[1].name).toBe('Test Company 1')
    })
  })

  // ============================================
  // PAGINATION
  // ============================================
  describe('pagination', () => {
    it('paginatedVendors returns correct slice', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
      const store = useVendorStore()
      await store.fetchVendors()
      store.setPageSize(1)
      expect(store.paginatedVendors.length).toBe(1)
      expect(store.totalPages).toBe(2)
    })

    it('setPage changes current page', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
      const store = useVendorStore()
      await store.fetchVendors()
      store.setPageSize(1)

      // Page 1 shows one vendor
      expect(store.paginatedVendors.length).toBe(1)
      const page1Id = store.paginatedVendors[0].id

      // Page 2 shows a different vendor
      store.setPage(2)
      expect(store.currentPage).toBe(2)
      expect(store.paginatedVendors.length).toBe(1)
      expect(store.paginatedVendors[0].id).not.toBe(page1Id)
    })

    it('setPage ignores out-of-range values', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
      const store = useVendorStore()
      await store.fetchVendors()
      store.setPage(999)
      expect(store.currentPage).toBe(1)
      store.setPage(0)
      expect(store.currentPage).toBe(1)
    })

    it('setPageSize resets to page 1', async () => {
      vi.mocked(VendorService.getVendors).mockResolvedValue(mockVendors)
      const store = useVendorStore()
      await store.fetchVendors()
      store.setPageSize(1)
      store.setPage(2)
      expect(store.currentPage).toBe(2)
      store.setPageSize(10)
      expect(store.currentPage).toBe(1)
    })

    it('totalPages is at least 1 even with no vendors', () => {
      const store = useVendorStore()
      expect(store.totalPages).toBe(1)
    })
  })
})
